import { DatabaseService } from '../database/database.service';
export declare class ChatService {
    private readonly databaseService;
    private readonly logger;
    constructor(databaseService: DatabaseService);
    saveMessage(senderId: number, receiverId: number, text: string): Promise<any>;
    getChatHistory(user1Id: number, user2Id: number): Promise<any[]>;
    getChatUsers(adminId: number): Promise<any[]>;
    getFirstAdminId(): Promise<any>;
    addNotification(userId: number, title: string, message: string): Promise<void>;
    getNotifications(userId: number): Promise<any[]>;
    markAsRead(notificationId: number, userId: number): Promise<{
        success: boolean;
    }>;
}
