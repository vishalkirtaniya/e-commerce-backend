import { supabase } from '../../../lib/supabaseClient.js'
import type { UpdateOrderStatusBody } from './orders.schema.js'

export async function getAllOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), addresses(*)')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function getOrderStatus(id: string) {
  const { data } = await supabase
    .from('orders')
    .select('status')
    .eq('id', id)
    .maybeSingle()

  return data as { status: string } | null
}

export async function updateOrderStatus(
  id: string,
  body: UpdateOrderStatusBody
) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status: body.status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('Order not found')

  const { error: historyError } = await supabase
    .from('order_status_history')
    .insert({
      order_id: Number(id),
      status: body.status,
      label: body.label,
    })

  if (historyError) {
    console.error('[orders.service] Failed to insert status history:', historyError.message)
  }

  return data
}