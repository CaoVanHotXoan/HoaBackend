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
exports.AdminOrdersController = exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let OrdersController = class OrdersController {
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async createOrder(req, body) {
        const userId = req.user.userId;
        const { shippingAddress, latitude, longitude, paymentMethod, promoCode, shippingFee, } = body;
        return await this.ordersService.createOrder(userId, shippingAddress, latitude ? parseFloat(latitude) : null, longitude ? parseFloat(longitude) : null, paymentMethod, promoCode, shippingFee ? parseFloat(shippingFee) : 0);
    }
    async getClientOrders(req) {
        const userId = req.user.userId;
        return await this.ordersService.getClientOrders(userId);
    }
    async getActivePromotions() {
        return await this.ordersService.getActivePromotions();
    }
    async validatePromotion(body) {
        const { code, totalAmount } = body;
        return await this.ordersService.validatePromotion(code, parseFloat(totalAmount));
    }
    async getOrderDetails(req, id) {
        const userId = req.user.userId;
        return await this.ordersService.getOrderDetails(userId, id, false);
    }
    async cancelOrder(req, id) {
        const userId = req.user.userId;
        return await this.ordersService.cancelOrder(userId, id);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getClientOrders", null);
__decorate([
    (0, common_1.Get)('promotions/active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getActivePromotions", null);
__decorate([
    (0, common_1.Post)('validate-promo'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "validatePromotion", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrderDetails", null);
__decorate([
    (0, common_1.Put)(':id/cancel'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "cancelOrder", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
let AdminOrdersController = class AdminOrdersController {
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async getAllOrders() {
        return await this.ordersService.getAllOrders();
    }
    async getAdminOrderDetails(req, id) {
        const userId = req.user.userId;
        return await this.ordersService.getOrderDetails(userId, id, true);
    }
    async testOrderDetails(id) {
        return await this.ordersService.getOrderDetails(1, id, true);
    }
    async updateOrderStatus(id, status, cancelReason) {
        return await this.ordersService.updateOrderStatus(id, status, cancelReason);
    }
    async simulateShipperCall(id) {
        return await this.ordersService.simulateShipperCall(id);
    }
};
exports.AdminOrdersController = AdminOrdersController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('Admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminOrdersController.prototype, "getAllOrders", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('Admin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], AdminOrdersController.prototype, "getAdminOrderDetails", null);
__decorate([
    (0, common_1.Get)('test/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminOrdersController.prototype, "testOrderDetails", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, roles_decorator_1.Roles)('Admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Body)('cancelReason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", Promise)
], AdminOrdersController.prototype, "updateOrderStatus", null);
__decorate([
    (0, common_1.Post)(':id/shipper-call'),
    (0, roles_decorator_1.Roles)('Admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminOrdersController.prototype, "simulateShipperCall", null);
exports.AdminOrdersController = AdminOrdersController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('admin/orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], AdminOrdersController);
//# sourceMappingURL=orders.controller.js.map