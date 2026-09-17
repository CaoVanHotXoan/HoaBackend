import { DatabaseService } from '../database/database.service';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from '../orders/orders.service';
import { PaymentService } from '../payment/payment.service';
export declare class ChatbotService {
    private readonly databaseService;
    private readonly configService;
    private readonly ordersService;
    private readonly paymentService;
    private readonly logger;
    private apiKey;
    constructor(databaseService: DatabaseService, configService: ConfigService, ordersService: OrdersService, paymentService: PaymentService);
    processMessage(userId: number | null, message: string, sessionId?: string, localCart?: any[]): Promise<{
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
    }>;
    getLogs(): Promise<{
        LogID: any;
        SessionID: any;
        CreatedAt: any;
        FullName: any;
        Email: any;
    }[]>;
    generatePromotionContent(data: {
        productName: string;
        type: string;
        discount?: string;
        event?: string;
        platform: string;
        style: string;
        length: string;
        description?: string;
    }): Promise<any>;
    generateProductDescription(productName: string, ingredients: string): Promise<any>;
    private callGroq;
    setWebsiteAnnouncement(content: string, productId?: number): Promise<{
        success: boolean;
    }>;
    getWebsiteAnnouncement(): Promise<{
        content: any;
        productId: any;
    }>;
}
