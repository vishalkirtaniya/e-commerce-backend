"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = newArrivalsRoutes;
const newArrivals_controller_1 = require("./newArrivals.controller");
const newArrivals_schema_1 = require("./newArrivals.schema");
async function newArrivalsRoutes(app) {
    app.get("/products/new-arrivals", { ...newArrivals_schema_1.newArrivalsSchema }, newArrivals_controller_1.newArrivals);
}
