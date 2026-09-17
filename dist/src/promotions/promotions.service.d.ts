import { DatabaseService } from '../database/database.service';
export declare class PromotionsService {
    private readonly dbService;
    constructor(dbService: DatabaseService);
    getAllPromotions(): Promise<any[]>;
    createPromotion(data: any): Promise<{
        success: boolean;
        message: string;
        promotionId: any;
    }>;
    updatePromotion(id: number, data: any): Promise<{
        success: boolean;
        message: string;
    }>;
    deletePromotion(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
