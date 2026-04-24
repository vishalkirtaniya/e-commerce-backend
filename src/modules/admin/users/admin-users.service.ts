import { supabase } from "../../../lib/supabaseClient.js";
import type { CreateAdminUserBody } from "./admin-users.schema.js";

export async function getAllAdminUsers() {
  const { data, error } = await supabase
    .from("admin_users")
    .select(
      `
      id,
      is_active,
      created_at,
      admin_roles ( id, name, label ),
      user_credentials ( id, email )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function createAdminUser(body: CreateAdminUserBody) {
  // 1. Find the credential by email
  const { data: credential, error: credError } = await supabase
    .from("user_credentials")
    .select("id, email")
    .eq("email", body.email)
    .maybeSingle();

  if (credError) throw new Error(credError.message);
  if (!credential) throw new Error("No user found with that email");

  // 2. Check if already an admin
  const { data: existing } = await supabase
    .from("admin_users")
    .select("id")
    .eq("credential_id", credential.id)
    .maybeSingle();

  if (existing) throw new Error("User is already an admin");

  // 3. Insert into admin_users
  const { data, error } = await supabase
    .from("admin_users")
    .insert({
      credential_id: credential.id,
      role_id: body.role_id,
      is_active: true,
    })
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function deactivateAdminUser(id: string) {
  const { data, error } = await supabase
    .from("admin_users")
    .update({ is_active: false })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Admin user not found");
  return data;
}
