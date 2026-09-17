import { DatabaseService } from '../database/database.service';
import { EventsGateway } from '../gateway/events.gateway';
export declare class OrdersService {
    private dbService;
    private eventsGateway;
    constructor(dbService: DatabaseService, eventsGateway: EventsGateway);
    createOrder(userId: number, shippingAddress: string, latitude: number | null, longitude: number | null, paymentMethod: string, promoCode?: string, shippingFee?: number): Promise<any>;
    getClientOrders(userId: number): Promise<any[]>;
    getOrderDetails(userId: number, orderId: number, isAdmin?: boolean): Promise<any>;
    getAllOrders(): Promise<any[]>;
    updateOrderStatus(orderId: number, status: string, cancelReason?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    simulateShipperCall(orderId: number): Promise<{
        success: boolean;
        message: string;
        callCount: any;
    }>;
    getActivePromotions(): Promise<any[]>;
    validatePromotion(code: string, orderTotal: number): Promise<{
        valid: boolean;
        message: string;
        discountAmount?: undefined;
        promoCode?: undefined;
    } | {
        valid: boolean;
        discountAmount: number;
        promoCode: any;
        message: string;
    }>;
    cancelOrder(userId: number, orderId: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
