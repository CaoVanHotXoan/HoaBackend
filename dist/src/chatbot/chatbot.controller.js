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
exports.ChatbotController = void 0;
const common_1 = require("@nestjs/common");
const chatbot_service_1 = require("./chatbot.service");
const jwt_1 = require("@nestjs/jwt");
let ChatbotController = class ChatbotController {
    constructor(chatbotService, jwtService) {
        this.chatbotService = chatbotService;
        this.jwtService = jwtService;
    }
    async handleChat(body, req) {
        let userId = null;
        try {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.split(' ')[1];
                const payload = this.jwtService.verify(token);
                userId = parseInt(payload.sub, 10);
            }
        }
        catch (e) {
        }
        const result = await this.chatbotService.processMessage(userId, body.message, body.sessionId, body.localCart);
        return {
            success: true,
            data: result,
        };
    }
    async getLogs() {
        const logs = await this.chatbotService.getLogs();
        return {
            success: true,
            data: logs,
        };
    }
    async generatePromo(body) {
        const content = await this.chatbotService.generatePromotionContent(body);
        return { success: true, data: content };
    }
    async generateDesc(body) {
        const content = await this.chatbotService.generateProductDescription(body.productName, body.ingredients);
        return { success: true, data: content };
    }
    async setAnnouncement(body) {
        const result = await this.chatbotService.setWebsiteAnnouncement(body.content, body.productId);
        return result;
    }
    async getAnnouncement() {
        const data = await this.chatbotService.getWebsiteAnnouncement();
        return { success: true, data };
    }
};
exports.ChatbotController = ChatbotController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatbotController.prototype, "handleChat", null);
__decorate([
    (0, common_1.Get)('logs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChatbotController.prototype, "getLogs", null);
__decorate([
    (0, common_1.Post)('generate-promo'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatbotController.prototype, "generatePromo", null);
__decorate([
    (0, common_1.Post)('generate-desc'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatbotController.prototype, "generateDesc", null);
__decorate([
    (0, common_1.Post)('announcement'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatbotController.prototype, "setAnnouncement", null);
__decorate([
    (0, common_1.Get)('announcement'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChatbotController.prototype, "getAnnouncement", null);
exports.ChatbotController = ChatbotController = __decorate([
    (0, common_1.Controller)('chatbot'),
    __metadata("design:paramtypes", [chatbot_service_1.ChatbotService,
        jwt_1.JwtService])
], ChatbotController);
//# sourceMappingURL=chatbot.controller.js.map