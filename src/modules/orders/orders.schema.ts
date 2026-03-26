import { z } from 'zod';

export const PlaceOrderSchema = z.object({
  email:          z.string().email('Invalid email address'),
  phone:          z.string().min(10, 'Invalid phone number'),
  first_name:     z.string().min(2),
  last_name:      z.string().min(2),
  street_address: z.string().min(5),
  city:           z.string().min(2),
  state:          z.string().min(2),
  zip_code:       z.string().min(4),
  payment_method: z.string().min(1, 'Payment method is required'),
});

export type PlaceOrderInput = z.infer<typeof PlaceOrderSchema>;