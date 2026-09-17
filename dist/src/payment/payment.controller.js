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
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const payment_service_1 = require("./payment.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let PaymentController = class PaymentController {
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async createPaymentUrl(req, orderId) {
        if (!orderId) {
            throw new common_1.BadRequestException('Mã hóa đơn (orderId) là bắt buộc.');
        }
        let ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.ip ||
            '127.0.0.1';
        if (Array.isArray(ipAddr)) {
            ipAddr = ipAddr[0];
        }
        if (ipAddr && ipAddr.includes(',')) {
            ipAddr = ipAddr.split(',')[0].trim();
        }
        if (ipAddr && (ipAddr.includes(':') || ipAddr === '::1')) {
            ipAddr = '127.0.0.1';
        }
        const userId = req.user.userId;
        const paymentUrl = await this.paymentService.createPaymentUrl(userId, orderId, ipAddr);
        return { paymentUrl };
    }
    async processReturn(query) {
        return await this.paymentService.processReturn(query);
    }
    async processIpn(query) {
        return await this.paymentService.processIpn(query);
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('create-vnpay-url'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "createPaymentUrl", null);
__decorate([
    (0, common_1.Get)('vnpay-return'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "processReturn", null);
__decorate([
    (0, common_1.Get)('vnpay-ipn'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "processIpn", null);
exports.PaymentController = PaymentController = __decorate([
    (0, common_1.Controller)('payment'),
    __metadata("design:paramtypes", [payment_service_1.PaymentService])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map