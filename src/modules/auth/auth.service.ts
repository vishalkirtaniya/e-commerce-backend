import { supabase } from "../../services/supabase"

export async function findUserByEmail(email: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single()

  if (error) return null

  return data
}

export async function createUser(user: any) {
  const { data, error } = await supabase
    .from("users")
    .insert(user)
    .select()
    .single()

  if (error) throw error

  return data
}