"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaceOrderSchema = void 0;
const zod_1 = require("zod");
exports.PlaceOrderSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    phone: zod_1.z.string().min(10, 'Invalid phone number'),
    first_name: zod_1.z.string().min(2),
    last_name: zod_1.z.string().min(2),
    street_address: zod_1.z.string().min(5),
    city: zod_1.z.string().min(2),
    state: zod_1.z.string().min(2),
    zip_code: zod_1.z.string().min(4),
    payment_method: zod_1.z.string().min(1, 'Payment method is required'),
});
//# sourceMappingURL=orders.schema.js.map