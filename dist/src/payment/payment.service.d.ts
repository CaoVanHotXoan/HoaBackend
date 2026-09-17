import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
export declare class PaymentService {
    private dbService;
    private configService;
    private vnpayInstance;
    constructor(dbService: DatabaseService, configService: ConfigService);
    createPaymentUrl(userId: number, orderId: number, ipAddr: string): Promise<string>;
    processReturn(queryParams: any): Promise<{
        success: boolean;
        message: string;
        orderId: number;
    }>;
    processIpn(queryParams: any): Promise<{
        RspCode: string;
        Message: string;
    }>;
}
