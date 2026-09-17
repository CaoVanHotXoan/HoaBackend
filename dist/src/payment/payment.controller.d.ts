import { PaymentService } from './payment.service';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    createPaymentUrl(req: any, orderId: number): Promise<{
        paymentUrl: string;
    }>;
    processReturn(query: any): Promise<{
        success: boolean;
        message: string;
        orderId: number;
    }>;
    processIpn(query: any): Promise<{
        RspCode: string;
        Message: string;
    }>;
}
