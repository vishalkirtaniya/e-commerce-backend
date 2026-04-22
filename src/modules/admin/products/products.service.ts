import { supabase } from '../../../lib/supabaseClient.js'
import type { CreateProductBody, UpdateProductBody } from './products.schema.js'

export async function getAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (id, name, slug),
      product_images (id, url, is_primary, sort_order),
      product_sizes (id, label, price, is_default)
    `)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (id, name, slug),
      product_images (id, url, is_primary, sort_order),
      product_sizes (id, label, price, is_default),
      product_occasions (
        occasions (id, name, slug)
      )
    `)
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('Product not found')
  return data
}

export async function createProduct(body: CreateProductBody) {
  const { data, error } = await supabase
    .from('products')
    .insert({
      sku: body.sku,
      slug: body.slug,
      name: body.name,
      description: body.description ?? null,
      material: body.material,
      price: body.price,
      original_price: body.original_price ?? null,
      discount: body.discount ?? null,
      category_id: body.category_id,
      is_new_arrival: body.is_new_arrival,
      is_top_selling: body.is_top_selling,
      is_customizable: body.is_customizable,
    })
    .select()
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('Failed to create product')
  return data
}

export async function updateProduct(id: string, body: UpdateProductBody) {
  const { data, error } = await supabase
    .from('products')
    .update({ ...body })
    .eq('id', id)
    .select()
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('Product not found')
  return data
}

export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}