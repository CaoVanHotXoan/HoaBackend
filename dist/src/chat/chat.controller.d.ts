import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getHistory(req: any, targetUserId: number): Promise<any[]>;
    getChatUsers(req: any): Promise<any[]>;
    getNotifications(req: any): Promise<any[]>;
    markNotificationAsRead(req: any, notifId: number): Promise<{
        success: boolean;
    }>;
}
