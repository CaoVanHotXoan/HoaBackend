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
var ChatService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let ChatService = ChatService_1 = class ChatService {
    constructor(databaseService) {
        this.databaseService = databaseService;
        this.logger = new common_1.Logger(ChatService_1.name);
    }
    async saveMessage(senderId, receiverId, text) {
        try {
            const query = `
        INSERT INTO ChatMessages (SenderID, ReceiverID, MessageText)
        VALUES (@SenderID, @ReceiverID, @MessageText)
        RETURNING MessageID, SentAt
      `;
            const result = await this.databaseService.query(query, [
                { name: 'SenderID', value: senderId },
                { name: 'ReceiverID', value: receiverId },
                { name: 'MessageText', value: text },
            ]);
            return result.recordset[0];
        }
        catch (error) {
            this.logger.error('Error saving chat message', error);
            throw error;
        }
    }
    async getChatHistory(user1Id, user2Id) {
        try {
            const query = `
        SELECT MessageID, SenderID, ReceiverID, MessageText, SentAt, IsRead
        FROM ChatMessages
        WHERE (SenderID = @U1 AND ReceiverID = @U2)
           OR (SenderID = @U2 AND ReceiverID = @U1)
        ORDER BY SentAt ASC
      `;
            const result = await this.databaseService.query(query, [
                { name: 'U1', value: user1Id },
                { name: 'U2', value: user2Id },
            ]);
            return result.recordset;
        }
        catch (error) {
            this.logger.error('Error fetching chat history', error);
            throw error;
        }
    }
    async getChatUsers(adminId) {
        try {
            const query = `
        SELECT DISTINCT u.UserID, u.FullName, u.Email
        FROM Users u
        INNER JOIN ChatMessages c ON u.UserID = c.SenderID OR u.UserID = c.ReceiverID
        WHERE u.UserID != @AdminID
      `;
            const result = await this.databaseService.query(query, [
                { name: 'AdminID', value: adminId },
            ]);
            return result.recordset;
        }
        catch (error) {
            this.logger.error('Error fetching chat users', error);
            throw error;
        }
    }
    async getFirstAdminId() {
        try {
            const query = `
        SELECT  u.UserID 
        FROM Users u
        INNER JOIN Roles r ON u.RoleID = r.RoleID
        WHERE r.RoleName = 'Admin'
      `;
            const result = await this.databaseService.query(query);
            if (result.recordset.length > 0) {
                return result.recordset[0].UserID;
            }
            return null;
        }
        catch (error) {
            this.logger.error('Error finding admin', error);
            throw error;
        }
    }
    async addNotification(userId, title, message) {
        try {
            const query = `
        INSERT INTO Notifications (UserID, Title, Message)
        VALUES (@UserID, @Title, @Message)
      `;
            await this.databaseService.query(query, [
                { name: 'UserID', value: userId },
                { name: 'Title', value: title },
                { name: 'Message', value: message },
            ]);
        }
        catch (error) {
            this.logger.error('Error adding notification', error);
        }
    }
    async getNotifications(userId) {
        try {
            const query = `
        SELECT NotificationID, Title, Message, IsRead, CreatedAt
        FROM Notifications
        WHERE UserID = @UserID
        ORDER BY CreatedAt DESC
      `;
            const result = await this.databaseService.query(query, [
                { name: 'UserID', value: userId },
            ]);
            return result.recordset;
        }
        catch (error) {
            this.logger.error('Error fetching notifications', error);
            throw error;
        }
    }
    async markAsRead(notificationId, userId) {
        try {
            const query = `
        UPDATE Notifications 
        SET IsRead = true 
        WHERE NotificationID = @NotifID AND UserID = @UserID
      `;
            await this.databaseService.query(query, [
                { name: 'NotifID', value: notificationId },
                { name: 'UserID', value: userId },
            ]);
            return { success: true };
        }
        catch (error) {
            this.logger.error('Error marking notification as read', error);
            throw error;
        }
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = ChatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], ChatService);
//# sourceMappingURL=chat.service.js.map