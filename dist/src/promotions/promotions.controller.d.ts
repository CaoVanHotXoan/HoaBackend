import { PromotionsService } from './promotions.service';
export declare class AdminPromotionsController {
    private readonly promotionsService;
    constructor(promotionsService: PromotionsService);
    getAllPromotions(): Promise<any[]>;
    createPromotion(body: any): Promise<{
        success: boolean;
        message: string;
        promotionId: any;
    }>;
    updatePromotion(id: number, body: any): Promise<{
        success: boolean;
        message: string;
    }>;
    deletePromotion(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
