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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let ProductsService = class ProductsService {
    constructor(dbService) {
        this.dbService = dbService;
    }
    async getCategories() {
        const result = await this.dbService.query('SELECT * FROM Categories ORDER BY CategoryName ASC');
        return result.recordset;
    }
    async getCategoryById(id) {
        const result = await this.dbService.query('SELECT * FROM Categories WHERE CategoryID = @CategoryID', [{ name: 'CategoryID', value: id }]);
        return result.recordset[0] || null;
    }
    async createCategory(categoryName, description, imageUrl) {
        const result = await this.dbService.query(`INSERT INTO Categories (CategoryName, Description, ImageURL) 
       VALUES (@CategoryName, @Description, @ImageURL)
       RETURNING *`, [
            { name: 'CategoryName', value: categoryName },
            { name: 'Description', value: description },
            { name: 'ImageURL', value: imageUrl || null },
        ]);
        return result.recordset[0];
    }
    async updateCategory(id, categoryName, description, imageUrl) {
        const result = await this.dbService.query(`UPDATE Categories 
       SET CategoryName = @CategoryName, Description = @Description, ImageURL = @ImageURL 
       WHERE CategoryID = @CategoryID
       RETURNING *`, [
            { name: 'CategoryID', value: id },
            { name: 'CategoryName', value: categoryName },
            { name: 'Description', value: description },
            { name: 'ImageURL', value: imageUrl || null },
        ]);
        return result.recordset[0] || null;
    }
    async getProducts(search, categoryId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        let queryStr = `
      SELECT p.*, c.CategoryName, COUNT(*) OVER() as TotalCount,
             COALESCE((
                SELECT SUM(od.Quantity) 
                FROM OrderDetails od 
                INNER JOIN Orders o ON od.OrderID = o.OrderID 
                WHERE od.ProductID = p.ProductID AND o.Status <> 'Đã hủy'
             ), 0) AS SoldCount,
             COALESCE((SELECT AVG(CAST(Rating AS FLOAT)) FROM Reviews WHERE ProductID = p.ProductID AND IsHidden = false), 0) AS AverageRating,
             COALESCE((SELECT COUNT(ReviewID) FROM Reviews WHERE ProductID = p.ProductID AND IsHidden = false), 0) AS ReviewCount
      FROM Products p
      INNER JOIN Categories c ON p.CategoryID = c.CategoryID
      WHERE p.IsActive = true
    `;
        const params = [];
        if (search) {
            queryStr += ` AND p.ProductName LIKE @Search`;
            params.push({
                name: 'Search',
                value: `%${search}%`,
            });
        }
        if (categoryId) {
            queryStr += ` AND p.CategoryID = @CategoryID`;
            params.push({ name: 'CategoryID', value: categoryId });
        }
        queryStr += `
      ORDER BY p.ProductID DESC
      LIMIT @Limit OFFSET @Offset
    `;
        params.push({ name: 'Offset', value: offset });
        params.push({ name: 'Limit', value: limit });
        const result = await this.dbService.query(queryStr, params);
        const products = result.recordset;
        const totalCount = products.length > 0 ? products[0].TotalCount : 0;
        const totalPages = Math.ceil(totalCount / limit);
        return {
            products,
            pagination: {
                totalItems: totalCount,
                totalPages,
                currentPage: page,
                itemsPerPage: limit,
            },
        };
    }
    async getProductById(id) {
        const result = await this.dbService.query(`SELECT p.*, c.CategoryName,
              COALESCE((SELECT AVG(CAST(Rating AS FLOAT)) FROM Reviews WHERE ProductID = p.ProductID AND IsHidden = false), 0) AS AverageRating,
              COALESCE((SELECT COUNT(ReviewID) FROM Reviews WHERE ProductID = p.ProductID AND IsHidden = false), 0) AS ReviewCount
       FROM Products p 
       INNER JOIN Categories c ON p.CategoryID = c.CategoryID 
       WHERE p.ProductID = @ProductID`, [{ name: 'ProductID', value: id }]);
        return result.recordset[0] || null;
    }
    async createProduct(productName, categoryId, price, inventory, imageUrl, ingredients, description) {
        const result = await this.dbService.query(`INSERT INTO Products (ProductName, CategoryID, Price, Inventory, ImageURL, Ingredients, Description, IsActive) 
       VALUES (@ProductName, @CategoryID, @Price, @Inventory, @ImageURL, @Ingredients, @Description, true)
       RETURNING *`, [
            { name: 'ProductName', value: productName },
            { name: 'CategoryID', value: categoryId },
            { name: 'Price', value: price },
            { name: 'Inventory', value: inventory },
            { name: 'ImageURL', value: imageUrl },
            {
                name: 'Ingredients',
                value: ingredients || null,
            },
            {
                name: 'Description',
                value: description || null,
            },
        ]);
        return result.recordset[0];
    }
    async updateProduct(id, productName, categoryId, price, inventory, imageUrl, ingredients, description) {
        const result = await this.dbService.query(`UPDATE Products 
       SET ProductName = @ProductName, CategoryID = @CategoryID, Price = @Price, Inventory = @Inventory, ImageURL = @ImageURL, Ingredients = @Ingredients, Description = @Description
       WHERE ProductID = @ProductID
       RETURNING *`, [
            { name: 'ProductID', value: id },
            { name: 'ProductName', value: productName },
            { name: 'CategoryID', value: categoryId },
            { name: 'Price', value: price },
            { name: 'Inventory', value: inventory },
            { name: 'ImageURL', value: imageUrl },
            {
                name: 'Ingredients',
                value: ingredients || null,
            },
            {
                name: 'Description',
                value: description || null,
            },
        ]);
        return result.recordset[0] || null;
    }
    async toggleProductStatus(id, isActive) {
        const result = await this.dbService.query(`UPDATE Products 
       SET IsActive = @IsActive 
       WHERE ProductID = @ProductID
       RETURNING *`, [
            { name: 'ProductID', value: id },
            { name: 'IsActive', value: isActive },
        ]);
        return result.recordset[0] || null;
    }
    async getProductHistory(id) {
        const result = await this.dbService.query(`SELECT ProductID, ProductName, Price, Inventory, IsActive, SysStartTime, SysEndTime 
       FROM (SELECT * FROM Products UNION ALL SELECT * FROM ProductsHistory) as p_all 
       WHERE ProductID = @ProductID 
       ORDER BY SysStartTime DESC`, [{ name: 'ProductID', value: id }]);
        return result.recordset;
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], ProductsService);
//# sourceMappingURL=products.service.js.map