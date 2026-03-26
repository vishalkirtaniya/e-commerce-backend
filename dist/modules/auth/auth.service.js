"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByEmail = findUserByEmail;
exports.findUserById = findUserById;
exports.createUser = createUser;
const prisma_1 = require("../../services/prisma");
async function findUserByEmail(email) {
    return prisma_1.prisma.user.findUnique({
        where: { email }
    });
}
async function findUserById(id) {
    return prisma_1.prisma.user.findUnique({
        where: { id }
    });
}
async function createUser(user) {
    return prisma_1.prisma.user.create({
        data: user
    });
}
