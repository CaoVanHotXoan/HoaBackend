import { DatabaseService } from '../database/database.service';
export declare class CartService {
    private dbService;
    constructor(dbService: DatabaseService);
    getCart(userId: number): Promise<any[]>;
    addToCart(userId: number, productId: number, quantity: number): Promise<any[] | {
        message: string;
    }>;
    updateCartQuantity(userId: number, productId: number, quantity: number): Promise<any[]>;
    removeFromCart(userId: number, productId: number): Promise<any[]>;
    syncCart(userId: number, items: {
        productId: number;
        quantity: number;
    }[]): Promise<any[]>;
}
