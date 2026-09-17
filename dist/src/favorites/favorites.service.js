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
var FavoritesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavoritesService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let FavoritesService = FavoritesService_1 = class FavoritesService {
    constructor(databaseService) {
        this.databaseService = databaseService;
        this.logger = new common_1.Logger(FavoritesService_1.name);
    }
    async getFavorites(userId) {
        try {
            const query = `
        SELECT f.FavoriteID, p.ProductID, p.ProductName, p.Price, p.ImageURL, c.CategoryName
        FROM Favorites f
        INNER JOIN Products p ON f.ProductID = p.ProductID
        INNER JOIN Categories c ON p.CategoryID = c.CategoryID
        WHERE f.UserID = @UserID
        ORDER BY f.CreatedAt DESC
      `;
            const result = await this.databaseService.query(query, [
                { name: 'UserID', value: userId },
            ]);
            return result.recordset;
        }
        catch (error) {
            this.logger.error('Error fetching favorites', error);
            throw error;
        }
    }
    async addFavorite(userId, productId) {
        try {
            const checkQuery = `SELECT 1 FROM Favorites WHERE UserID = @UserID AND ProductID = @ProductID`;
            const checkResult = await this.databaseService.query(checkQuery, [
                { name: 'UserID', value: userId },
                { name: 'ProductID', value: productId },
            ]);
            if (checkResult.recordset.length > 0) {
                throw new common_1.ConflictException('Sản phẩm đã có trong danh sách yêu thích');
            }
            const query = `
        INSERT INTO Favorites (UserID, ProductID) 
        VALUES (@UserID, @ProductID)
      `;
            await this.databaseService.query(query, [
                { name: 'UserID', value: userId },
                { name: 'ProductID', value: productId },
            ]);
            return { success: true, message: 'Đã thêm vào danh sách yêu thích' };
        }
        catch (error) {
            this.logger.error('Error adding favorite', error);
            throw error;
        }
    }
    async removeFavorite(userId, productId) {
        try {
            const query = `
        DELETE FROM Favorites 
        WHERE UserID = @UserID AND ProductID = @ProductID
      `;
            const result = await this.databaseService.query(query, [
                { name: 'UserID', value: userId },
                { name: 'ProductID', value: productId },
            ]);
            if (result.rowsAffected[0] === 0) {
                throw new common_1.NotFoundException('Sản phẩm không nằm trong danh sách yêu thích');
            }
            return { success: true, message: 'Đã xóa khỏi danh sách yêu thích' };
        }
        catch (error) {
            this.logger.error('Error removing favorite', error);
            throw error;
        }
    }
};
exports.FavoritesService = FavoritesService;
exports.FavoritesService = FavoritesService = FavoritesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], FavoritesService);
//# sourceMappingURL=favorites.service.js.map