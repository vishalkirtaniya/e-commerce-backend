import { supabase } from "../../services/supabase";

export async function getCustomerReviews() {
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      rating,
      comment,
      verified,
      users ( name )
    `,
    )
    .eq("verified", true)
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) throw error;

  return data;
}
