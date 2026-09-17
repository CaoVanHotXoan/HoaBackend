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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let ProductsController = class ProductsController {
    constructor(productsService) {
        this.productsService = productsService;
    }
    async getProducts(search, categoryId, page, limit) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        const catId = categoryId ? parseInt(categoryId, 10) : undefined;
        return await this.productsService.getProducts(search, catId, pageNum, limitNum);
    }
    async getCategories() {
        return await this.productsService.getCategories();
    }
    async getProductById(id) {
        const product = await this.productsService.getProductById(id);
        if (!product) {
            throw new common_1.NotFoundException(`Không tìm thấy món ăn với ID ${id}.`);
        }
        return {
            message: 'Lấy chi tiết món ăn thành công.',
            product,
        };
    }
    async createCategory(body) {
        const { categoryName, description, imageUrl } = body;
        return await this.productsService.createCategory(categoryName, description, imageUrl);
    }
    async updateCategory(id, body) {
        const { categoryName, description, imageUrl } = body;
        const updated = await this.productsService.updateCategory(id, categoryName, description, imageUrl);
        if (!updated) {
            throw new common_1.NotFoundException(`Không tìm thấy danh mục với ID ${id} để cập nhật.`);
        }
        return {
            message: 'Cập nhật danh mục thành công.',
            category: updated,
        };
    }
    async createProduct(body) {
        const { productName, categoryId, price, inventory, imageUrl, ingredients, description, } = body;
        return await this.productsService.createProduct(productName, categoryId, price, inventory, imageUrl, ingredients, description);
    }
    async updateProduct(id, body) {
        const { productName, categoryId, price, inventory, imageUrl, ingredients, description, } = body;
        const updated = await this.productsService.updateProduct(id, productName, categoryId, price, inventory, imageUrl, ingredients, description);
        if (!updated) {
            throw new common_1.NotFoundException(`Không tìm thấy món ăn với ID ${id} để cập nhật.`);
        }
        return {
            message: 'Cập nhật món ăn thành công.',
            product: updated,
        };
    }
    async deleteProduct(id) {
        const updated = await this.productsService.toggleProductStatus(id, false);
        if (!updated) {
            throw new common_1.NotFoundException(`Không tìm thấy món ăn với ID ${id} để xóa mềm.`);
        }
        return {
            message: 'Ngừng bán món ăn thành công (Xóa mềm).',
            product: updated,
        };
    }
    async toggleProductStatus(id, isActive) {
        const updated = await this.productsService.toggleProductStatus(id, isActive);
        if (!updated) {
            throw new common_1.NotFoundException(`Không tìm thấy món ăn với ID ${id} để cập nhật trạng thái.`);
        }
        return {
            message: `${isActive ? 'Bật lại' : 'Ngừng bán'} món ăn thành công.`,
            product: updated,
        };
    }
    async getProductHistory(id) {
        const product = await this.productsService.getProductById(id);
        if (!product) {
            throw new common_1.NotFoundException(`Không tìm thấy món ăn với ID ${id}.`);
        }
        const history = await this.productsService.getProductHistory(id);
        return {
            message: `Lấy lịch sử biến động giá và tồn kho của món ăn [${product.ProductName}] thành công.`,
            history,
        };
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Get)('products'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('categoryId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('products/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getProductById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('Admin'),
    (0, common_1.Post)('admin/categories'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "createCategory", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('Admin'),
    (0, common_1.Put)('admin/categories/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('Admin'),
    (0, common_1.Post)('admin/products'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "createProduct", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('Admin'),
    (0, common_1.Put)('admin/products/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('Admin'),
    (0, common_1.Delete)('admin/products/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "deleteProduct", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('Admin'),
    (0, common_1.Put)('admin/products/:id/status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Boolean]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "toggleProductStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('Admin'),
    (0, common_1.Get)('admin/products/:id/history'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getProductHistory", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.Controller)(''),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map