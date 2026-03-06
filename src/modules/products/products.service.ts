import { supabase } from "../../services/supabase"

export async function getAllProducts() {

  const { data, error } = await supabase
    .from("products")
    .select("*")

  if (error) throw error

  return data
}

export async function getProductById(id: string) {

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single()

  if (error) throw error

  return data
}

export async function getProductsByCategory(category: string) {

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)

  if (error) throw error

  return data
}

export async function createProduct(product: any) {

  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single()

  if (error) throw error

  return data
}