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
exports.EventsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const database_service_1 = require("../database/database.service");
const chat_service_1 = require("../chat/chat.service");
let EventsGateway = class EventsGateway {
    constructor(jwtService, configService, dbService, chatService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.dbService = dbService;
        this.chatService = chatService;
        this.lastAutoReplyTime = new Map();
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token;
            if (!token) {
                client.disconnect();
                return;
            }
            const secret = this.configService.get('JWT_SECRET');
            const payload = this.jwtService.verify(token, { secret });
            const userId = payload.sub;
            client.join(`room_user_${userId}`);
            console.log(`Client connected: ${client.id} - UserID: ${userId}`);
        }
        catch (err) {
            console.log('Client connected with invalid token, disconnecting...');
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        console.log(`Client disconnected: ${client.id}`);
    }
    startDeliverySimulation(orderId, userId, startLat, startLng, endLat, endLng) {
        const steps = 20;
        const stepLat = (endLat - startLat) / steps;
        const stepLng = (endLng - startLng) / steps;
        let currentStep = 0;
        console.log(`Bắt đầu giao đơn hàng #${orderId} cho User #${userId}...`);
        const interval = setInterval(() => {
            currentStep++;
            const currentLat = startLat + stepLat * currentStep;
            const currentLng = startLng + stepLng * currentStep;
            this.server.to(`room_user_${userId}`).emit('shipperLocation', {
                orderId,
                lat: currentLat,
                lng: currentLng,
                progress: (currentStep / steps) * 100,
            });
            if (currentStep >= steps) {
                clearInterval(interval);
                this.dbService
                    .query(`UPDATE Orders SET Status = 'Hoàn thành', PaymentStatus = CASE WHEN PaymentStatus = 'Chưa thanh toán' THEN 'Đã thanh toán' ELSE PaymentStatus END WHERE OrderID = @OrderID`, [{ name: 'OrderID', value: orderId }])
                    .then(() => {
                    this.server.to(`room_user_${userId}`).emit('orderStatusUpdate', {
                        orderId,
                        status: 'Hoàn thành',
                    });
                    this.server
                        .to(`room_user_${userId}`)
                        .emit('deliveryCompleted', { orderId });
                    console.log(`Đơn hàng #${orderId} đã giao thành công và cập nhật DB.`);
                })
                    .catch((err) => {
                    console.error(`Lỗi cập nhật đơn hàng #${orderId} thành Hoàn thành:`, err);
                });
            }
        }, 3000);
    }
    notifyOrderStatusUpdate(userId, orderId, status, cancelReason) {
        this.server.to(`room_user_${userId}`).emit('orderStatusUpdate', {
            orderId,
            status,
            cancelReason,
        });
        let msg = `Đơn hàng #${orderId} của bạn đã chuyển sang trạng thái: ${status}`;
        if (status === 'Đã hủy' && cancelReason) {
            msg = `Đơn hàng #${orderId} của bạn đã bị hủy với lý do: ${cancelReason}`;
        }
        this.chatService.addNotification(userId, 'Cập nhật đơn hàng', msg);
        this.server.to(`room_user_${userId}`).emit('newNotification');
    }
    async handleSendMessage(client, payload) {
        try {
            const token = client.handshake.auth.token;
            const secret = this.configService.get('JWT_SECRET');
            const decoded = this.jwtService.verify(token, { secret });
            const senderId = parseInt(decoded.sub);
            const result = await this.chatService.saveMessage(senderId, payload.receiverId, payload.text);
            const messageObj = {
                MessageID: result.MessageID,
                SenderID: senderId,
                ReceiverID: payload.receiverId,
                MessageText: payload.text,
                SentAt: result.SentAt,
                IsRead: false,
            };
            client.emit('receiveMessage', messageObj);
            this.server
                .to(`room_user_${payload.receiverId}`)
                .emit('receiveMessage', messageObj);
            if (payload.receiverId === 1 && senderId !== 1) {
                const now = Date.now();
                const lastReply = this.lastAutoReplyTime.get(senderId) || 0;
                if (now - lastReply > 300000) {
                    this.lastAutoReplyTime.set(senderId, now);
                    setTimeout(async () => {
                        const autoReplyMsg = 'Cảm ơn bạn đã liên hệ FIVEFOOD! Hiện tại các tư vấn viên đang bận, chúng tôi sẽ phản hồi bạn trong vài phút tới nhé. Chúc bạn một ngày vui vẻ! ❤️';
                        try {
                            const autoReplyResult = await this.chatService.saveMessage(1, senderId, autoReplyMsg);
                            const autoObj = {
                                MessageID: autoReplyResult.MessageID,
                                SenderID: 1,
                                ReceiverID: senderId,
                                MessageText: autoReplyResult.MessageText,
                                SentAt: autoReplyResult.SentAt,
                                IsRead: false,
                            };
                            this.server
                                .to(`room_user_${senderId}`)
                                .emit('receiveMessage', autoObj);
                            this.server.to(`room_user_1`).emit('receiveMessage', autoObj);
                        }
                        catch (err) {
                            console.error('Error sending auto reply:', err);
                        }
                    }, 3000);
                }
            }
        }
        catch (err) {
            console.error('Error handling sendMessage event:', err);
        }
    }
    async handleTyping(client, payload) {
        try {
            const token = client.handshake.auth.token;
            const secret = this.configService.get('JWT_SECRET');
            const decoded = this.jwtService.verify(token, { secret });
            const senderId = parseInt(decoded.sub);
            this.server.to(`room_user_${payload.receiverId}`).emit('typingStatus', {
                senderId,
                isTyping: payload.isTyping,
            });
        }
        catch (err) {
            console.error('Error handling typing event:', err);
        }
    }
};
exports.EventsGateway = EventsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], EventsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], EventsGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], EventsGateway.prototype, "handleTyping", null);
exports.EventsGateway = EventsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        database_service_1.DatabaseService,
        chat_service_1.ChatService])
], EventsGateway);
//# sourceMappingURL=events.gateway.js.map