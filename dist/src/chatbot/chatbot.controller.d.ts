import { ChatbotService } from './chatbot.service';
import { JwtService } from '@nestjs/jwt';
export declare class ChatbotController {
    private readonly chatbotService;
    private readonly jwtService;
    constructor(chatbotService: ChatbotService, jwtService: JwtService);
    handleChat(body: {
        message: string;
        sessionId?: string;
        localCart?: any[];
    }, req: any): Promise<{
        success: boolean;
        data: {
            reply: string;
            sessionId: string;
            orderPlaced: boolean;
            newLocalCart?: undefined;
            richContent?: undefined;
        } | {
            reply: string;
            sessionId: string;
            orderPlaced: boolean;
            newLocalCart: any[] | null;
            richContent: any;
        };
    }>;
    getLogs(): Promise<{
        success: boolean;
        data: {
            LogID: any;
            SessionID: any;
            CreatedAt: any;
            FullName: any;
            Email: any;
        }[];
    }>;
    generatePromo(body: {
        productName: string;
        type: string;
        discount?: string;
        event?: string;
        platform: string;
        style: string;
        length: string;
        description?: string;
    }): Promise<{
        success: boolean;
        data: any;
    }>;
    generateDesc(body: {
        productName: string;
        ingredients: string;
    }): Promise<{
        success: boolean;
        data: any;
    }>;
    setAnnouncement(body: {
        content: string;
        productId?: number;
    }): Promise<{
        success: boolean;
    }>;
    getAnnouncement(): Promise<{
        success: boolean;
        data: {
            content: any;
            productId: any;
        };
    }>;
}
