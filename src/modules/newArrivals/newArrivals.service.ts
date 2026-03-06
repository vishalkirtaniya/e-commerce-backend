import { supabase } from "../../services/supabase"

export async function getNewArrivals() {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      price,
      original_price,
      rating,
      product_images (
        image_url
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(4)

  if (error) throw error

  return data
}