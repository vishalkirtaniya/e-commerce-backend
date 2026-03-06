import { supabase } from "../../services/supabase"

export async function getTopSellingProducts() {
  // Sum quantity sold per product from order_items, join product details
  const { data, error } = await supabase
    .from("order_items")
    .select(
      `
      product_id,
      quantity,
      products (
        id,
        name,
        price,
        original_price,
        rating,
        product_images ( image_url )
      )
    `
    )
    .order("quantity", { ascending: false })

  if (error) throw error

  // Aggregate total quantity sold per product
  const totals = new Map<string, { product: any; totalSold: number }>()

  for (const item of data) {
    if (!item.products) continue
    const pid = item.product_id
    if (totals.has(pid)) {
      totals.get(pid)!.totalSold += item.quantity ?? 0
    } else {
      totals.set(pid, { product: item.products, totalSold: item.quantity ?? 0 })
    }
  }

  // Sort by totalSold descending, return top 4
  return Array.from(totals.values())
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 4)
    .map((entry) => entry.product)
}