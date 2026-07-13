"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProductImage = uploadProductImage;
exports.getProductImages = getProductImages;
exports.setPrimaryImage = setPrimaryImage;
exports.reorderImages = reorderImages;
exports.deleteProductImage = deleteProductImage;
const db_js_1 = __importDefault(require("../../../services/db.js"));
const supabaseClient_js_1 = require("../../../lib/supabaseClient.js");
const sharp_1 = __importDefault(require("sharp"));
const BUCKET = 'product-images';
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const QUALITY = 85;
async function uploadProductImage(productId, fileBuffer, originalName, mimeType) {
    // 1. Compress + resize with sharp
    const processed = await (0, sharp_1.default)(fileBuffer)
        .resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: 'inside', // never upscale, keep aspect ratio
        withoutEnlargement: true,
    })
        .webp({ quality: QUALITY, lossless: false }) // convert to webp
        .toBuffer();
    // 2. Generate unique filename
    const timestamp = Date.now();
    const safeName = originalName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const filename = `${productId}/${timestamp}-${safeName}.webp`;
    // 3. Upload to Supabase Storage
    const { error: uploadError } = await supabaseClient_js_1.supabase.storage
        .from(BUCKET)
        .upload(filename, processed, {
        contentType: 'image/webp',
        upsert: false,
    });
    if (uploadError)
        throw new Error(`Upload failed: ${uploadError.message}`);
    // 4. Get public URL
    const { data: urlData } = supabaseClient_js_1.supabase.storage
        .from(BUCKET)
        .getPublicUrl(filename);
    const publicUrl = urlData.publicUrl;
    // 5. Check if this is the first image (make it primary)
    const countResult = await db_js_1.default.query(`SELECT COUNT(*) FROM product_images WHERE product_id = $1`, [productId]);
    const isPrimary = parseInt(countResult.rows[0].count) === 0;
    // 6. Get next sort order
    const orderResult = await db_js_1.default.query(`SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order 
     FROM product_images WHERE product_id = $1`, [productId]);
    const sortOrder = orderResult.rows[0].next_order;
    // 7. Insert into product_images
    const insertResult = await db_js_1.default.query(`INSERT INTO product_images (product_id, url, is_primary, sort_order)
     VALUES ($1, $2, $3, $4)
     RETURNING *`, [productId, publicUrl, isPrimary, sortOrder]);
    return insertResult.rows[0];
}
async function getProductImages(productId) {
    const result = await db_js_1.default.query(`SELECT * FROM product_images 
     WHERE product_id = $1 
     ORDER BY sort_order ASC`, [productId]);
    return result.rows;
}
async function setPrimaryImage(productId, imageId) {
    const client = await db_js_1.default.connect();
    try {
        await client.query('BEGIN');
        // Unset all primary
        await client.query(`UPDATE product_images SET is_primary = false WHERE product_id = $1`, [productId]);
        // Set new primary
        const result = await client.query(`UPDATE product_images SET is_primary = true 
       WHERE id = $1 AND product_id = $2 RETURNING *`, [imageId, productId]);
        await client.query('COMMIT');
        if (result.rows.length === 0)
            throw new Error('Image not found');
        return result.rows[0];
    }
    catch (err) {
        await client.query('ROLLBACK');
        throw err;
    }
    finally {
        client.release();
    }
}
async function reorderImages(productId, orderedIds) {
    const client = await db_js_1.default.connect();
    try {
        await client.query('BEGIN');
        for (let i = 0; i < orderedIds.length; i++) {
            await client.query(`UPDATE product_images SET sort_order = $1 
         WHERE id = $2 AND product_id = $3`, [i, orderedIds[i], productId]);
        }
        await client.query('COMMIT');
    }
    catch (err) {
        await client.query('ROLLBACK');
        throw err;
    }
    finally {
        client.release();
    }
}
async function deleteProductImage(productId, imageId) {
    // 1. Get the image record
    const result = await db_js_1.default.query(`SELECT * FROM product_images WHERE id = $1 AND product_id = $2`, [imageId, productId]);
    if (result.rows.length === 0)
        throw new Error('Image not found');
    const image = result.rows[0];
    // 2. Extract storage path from URL
    const url = image.url;
    const pathMatch = url.match(/product-images\/(.+)$/);
    if (pathMatch) {
        const storagePath = pathMatch[1];
        await supabaseClient_js_1.supabase.storage.from(BUCKET).remove([storagePath]);
    }
    // 3. Delete from DB
    await db_js_1.default.query(`DELETE FROM product_images WHERE id = $1`, [imageId]);
    // 4. If deleted was primary, make the next image primary
    if (image.is_primary) {
        await db_js_1.default.query(`UPDATE product_images SET is_primary = true 
       WHERE product_id = $1 
       ORDER BY sort_order ASC 
       LIMIT 1`, [productId]);
    }
}
//# sourceMappingURL=product-images.service.js.map