import { CartService } from './cart.service';
export declare class CartController {
    private cartService;
    constructor(cartService: CartService);
    getCart(req: any): Promise<any[]>;
    addToCart(req: any, body: any): Promise<any[] | {
        message: string;
    }>;
    updateCartQuantity(req: any, body: any): Promise<any[]>;
    removeFromCart(req: any, productId: number): Promise<any[]>;
    syncCart(req: any, items: any[]): Promise<any[]>;
}
