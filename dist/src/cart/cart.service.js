"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let CartService = class CartService {
    constructor(dbService) {
        this.dbService = dbService;
    }
    async getCart(userId) {
        const result = await this.dbService.query(`SELECT c.CartItemID, c.ProductID, c.Quantity, c.UpdatedAt, p.ProductName, p.Price, p.ImageURL, p.Inventory
       FROM CartItems c
       INNER JOIN Products p ON c.ProductID = p.ProductID
       WHERE c.UserID = @UserID
       ORDER BY c.UpdatedAt DESC`, [{ name: 'UserID', value: userId }]);
        return result.recordset;
    }
    async addToCart(userId, productId, quantity) {
        const existing = await this.dbService.query(`SELECT CartItemID, Quantity FROM CartItems WHERE UserID = @UserID AND ProductID = @ProductID`, [
            { name: 'UserID', value: userId },
            { name: 'ProductID', value: productId },
        ]);
        if (existing.recordset.length > 0) {
            const newQuantity = existing.recordset[0].Quantity + quantity;
            if (newQuantity <= 0) {
                await this.removeFromCart(userId, productId);
                return { message: 'Đã xóa món ăn khỏi giỏ hàng.' };
            }
            await this.dbService.query(`UPDATE CartItems 
         SET Quantity = @Quantity, UpdatedAt = CURRENT_TIMESTAMP 
         WHERE UserID = @UserID AND ProductID = @ProductID`, [
                { name: 'UserID', value: userId },
                { name: 'ProductID', value: productId },
                { name: 'Quantity', value: newQuantity },
            ]);
        }
        else {
            if (quantity <= 0) {
                return { message: 'Số lượng thêm mới vào giỏ hàng phải lớn hơn 0.' };
            }
            await this.dbService.query(`INSERT INTO CartItems (UserID, ProductID, Quantity, UpdatedAt) 
         VALUES (@UserID, @ProductID, @Quantity, CURRENT_TIMESTAMP)`, [
                { name: 'UserID', value: userId },
                { name: 'ProductID', value: productId },
                { name: 'Quantity', value: quantity },
            ]);
        }
        return await this.getCart(userId);
    }
    async updateCartQuantity(userId, productId, quantity) {
        if (quantity <= 0) {
            return await this.removeFromCart(userId, productId);
        }
        const existing = await this.dbService.query(`SELECT CartItemID FROM CartItems WHERE UserID = @UserID AND ProductID = @ProductID`, [
            { name: 'UserID', value: userId },
            { name: 'ProductID', value: productId },
        ]);
        if (existing.recordset.length > 0) {
            await this.dbService.query(`UPDATE CartItems 
         SET Quantity = @Quantity, UpdatedAt = CURRENT_TIMESTAMP 
         WHERE UserID = @UserID AND ProductID = @ProductID`, [
                { name: 'UserID', value: userId },
                { name: 'ProductID', value: productId },
                { name: 'Quantity', value: quantity },
            ]);
        }
        else {
            await this.dbService.query(`INSERT INTO CartItems (UserID, ProductID, Quantity, UpdatedAt) 
         VALUES (@UserID, @ProductID, @Quantity, CURRENT_TIMESTAMP)`, [
                { name: 'UserID', value: userId },
                { name: 'ProductID', value: productId },
                { name: 'Quantity', value: quantity },
            ]);
        }
        return await this.getCart(userId);
    }
    async removeFromCart(userId, productId) {
        await this.dbService.query(`DELETE FROM CartItems WHERE UserID = @UserID AND ProductID = @ProductID`, [
            { name: 'UserID', value: userId },
            { name: 'ProductID', value: productId },
        ]);
        return await this.getCart(userId);
    }
    async syncCart(userId, items) {
        for (const item of items) {
            if (item.productId && item.quantity > 0) {
                const existing = await this.dbService.query(`SELECT CartItemID, Quantity FROM CartItems WHERE UserID = @UserID AND ProductID = @ProductID`, [
                    { name: 'UserID', value: userId },
                    { name: 'ProductID', value: item.productId },
                ]);
                if (existing.recordset.length > 0) {
                    const newQuantity = existing.recordset[0].Quantity + item.quantity;
                    await this.dbService.query(`UPDATE CartItems 
             SET Quantity = @Quantity, UpdatedAt = CURRENT_TIMESTAMP 
             WHERE UserID = @UserID AND ProductID = @ProductID`, [
                        { name: 'UserID', value: userId },
                        { name: 'ProductID', value: item.productId },
                        { name: 'Quantity', value: newQuantity },
                    ]);
                }
                else {
                    await this.dbService.query(`INSERT INTO CartItems (UserID, ProductID, Quantity, UpdatedAt) 
             VALUES (@UserID, @ProductID, @Quantity, CURRENT_TIMESTAMP)`, [
                        { name: 'UserID', value: userId },
                        { name: 'ProductID', value: item.productId },
                        { name: 'Quantity', value: item.quantity },
                    ]);
                }
            }
        }
        return await this.getCart(userId);
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], CartService);
//# sourceMappingURL=cart.service.js.map