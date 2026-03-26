"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = topSellingRoutes;
const topSelling_controller_1 = require("./topSelling.controller");
const topSelling_schema_1 = require("./topSelling.schema");
async function topSellingRoutes(app) {
    app.get("/products/top-selling", { ...topSelling_schema_1.topSellingSchema }, topSelling_controller_1.topSelling);
}
