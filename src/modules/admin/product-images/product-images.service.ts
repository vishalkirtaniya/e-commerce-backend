import pool from '../../../services/db.js'
import { supabase } from '../../../lib/supabaseClient.js'
import sharp from 'sharp'

const BUCKET = 'product-images'
const MAX_WIDTH = 1200
const MAX_HEIGHT = 1200
const QUALITY = 85

export async function uploadProductImage(
  productId: string,
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string
) {
  // 1. Compress + resize with sharp
  const processed = await sharp(fileBuffer)
    .resize(MAX_WIDTH, MAX_HEIGHT, {
      fit: 'inside',        // never upscale, keep aspect ratio
      withoutEnlargement: true,
    })
    .webp({ quality: QUALITY, lossless: false }) // convert to webp
    .toBuffer()

  // 2. Generate unique filename
  const timestamp = Date.now()
  const safeName = originalName.replace(/[^a-z0-9]/gi, '-').toLowerCase()
  const filename = `${productId}/${timestamp}-${safeName}.webp`

  // 3. Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filename, processed, {
      contentType: 'image/webp',
      upsert: false,
    })

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

  // 4. Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(filename)

  const publicUrl = urlData.publicUrl

  // 5. Check if this is the first image (make it primary)
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM product_images WHERE product_id = $1`,
    [productId]
  )
  const isPrimary = parseInt(countResult.rows[0].count) === 0

  // 6. Get next sort order
  const orderResult = await pool.query(
    `SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order 
     FROM product_images WHERE product_id = $1`,
    [productId]
  )
  const sortOrder = orderResult.rows[0].next_order

  // 7. Insert into product_images
  const insertResult = await pool.query(
    `INSERT INTO product_images (product_id, url, is_primary, sort_order)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [productId, publicUrl, isPrimary, sortOrder]
  )

  return insertResult.rows[0]
}

export async function getProductImages(productId: string) {
  const result = await pool.query(
    `SELECT * FROM product_images 
     WHERE product_id = $1 
     ORDER BY sort_order ASC`,
    [productId]
  )
  return result.rows
}

export async function setPrimaryImage(productId: string, imageId: string) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    // Unset all primary
    await client.query(
      `UPDATE product_images SET is_primary = false WHERE product_id = $1`,
      [productId]
    )
    // Set new primary
    const result = await client.query(
      `UPDATE product_images SET is_primary = true 
       WHERE id = $1 AND product_id = $2 RETURNING *`,
      [imageId, productId]
    )
    await client.query('COMMIT')
    if (result.rows.length === 0) throw new Error('Image not found')
    return result.rows[0]
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function reorderImages(
  productId: string,
  orderedIds: number[]
) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    for (let i = 0; i < orderedIds.length; i++) {
      await client.query(
        `UPDATE product_images SET sort_order = $1 
         WHERE id = $2 AND product_id = $3`,
        [i, orderedIds[i], productId]
      )
    }
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function deleteProductImage(
  productId: string,
  imageId: string
) {
  // 1. Get the image record
  const result = await pool.query(
    `SELECT * FROM product_images WHERE id = $1 AND product_id = $2`,
    [imageId, productId]
  )
  if (result.rows.length === 0) throw new Error('Image not found')

  const image = result.rows[0]

  // 2. Extract storage path from URL
  const url: string = image.url
  const pathMatch = url.match(/product-images\/(.+)$/)
  if (pathMatch) {
    const storagePath = pathMatch[1]
    await supabase.storage.from(BUCKET).remove([storagePath])
  }

  // 3. Delete from DB
  await pool.query(`DELETE FROM product_images WHERE id = $1`, [imageId])

  // 4. If deleted was primary, make the next image primary
  if (image.is_primary) {
    await pool.query(
      `UPDATE product_images SET is_primary = true 
       WHERE product_id = $1 
       ORDER BY sort_order ASC 
       LIMIT 1`,
      [productId]
    )
  }
}