import { OrdersService } from './orders.service';
export declare class OrdersController {
    private ordersService;
    constructor(ordersService: OrdersService);
    createOrder(req: any, body: any): Promise<any>;
    getClientOrders(req: any): Promise<any[]>;
    getActivePromotions(): Promise<any[]>;
    validatePromotion(body: any): Promise<{
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
    getOrderDetails(req: any, id: number): Promise<any>;
    cancelOrder(req: any, id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
export declare class AdminOrdersController {
    private ordersService;
    constructor(ordersService: OrdersService);
    getAllOrders(): Promise<any[]>;
    getAdminOrderDetails(req: any, id: number): Promise<any>;
    testOrderDetails(id: number): Promise<any>;
    updateOrderStatus(id: number, status: string, cancelReason?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    simulateShipperCall(id: number): Promise<{
        success: boolean;
        message: string;
        callCount: any;
    }>;
}
