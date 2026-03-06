import { supabase } from "../../services/supabase"

export async function getUserCart(userId: string) {

  const { data, error } = await supabase
    .from("carts")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error) return null

  return data
}

export async function createCart(userId: string) {

  const { data, error } = await supabase
    .from("carts")
    .insert({ user_id: userId })
    .select()
    .single()

  if (error) throw error

  return data
}

export async function addCartItem(
  cartId: string,
  productId: string,
  quantity: number
) {

  /* Check if item already exists */

  const { data: existingItem } = await supabase
    .from("cart_items")
    .select("*")
    .eq("cart_id", cartId)
    .eq("product_id", productId)
    .single()

  /* If exists → update quantity */

  if (existingItem) {

    const { data, error } = await supabase
      .from("cart_items")
      .update({
        quantity: existingItem.quantity + quantity
      })
      .eq("id", existingItem.id)
      .select()
      .single()

    if (error) throw error

    return data
  }

  /* Otherwise create new item */

  const { data, error } = await supabase
    .from("cart_items")
    .insert({
      cart_id: cartId,
      product_id: productId,
      quantity
    })
    .select()
    .single()

  if (error) throw error

  return data
}

export async function getCartItems(cartId: string) {

  const { data, error } = await supabase
    .from("cart_items")
    .select(`
      *,
      products(*)
    `)
    .eq("cart_id", cartId)

  if (error) throw error

  return data
}

export async function removeCartItem(itemId: string) {

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", itemId)

  if (error) throw error
}