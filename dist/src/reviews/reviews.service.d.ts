import { DatabaseService } from '../database/database.service';
export declare class ReviewsService {
    private readonly databaseService;
    private readonly logger;
    constructor(databaseService: DatabaseService);
    getReviewsByProduct(productId: number): Promise<{
        reviews: any[];
        stats: any;
    }>;
    addReview(userId: number, productId: number, orderId: number, rating: number, comment: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getAllReviewsForAdmin(): Promise<any[]>;
    toggleReviewVisibility(reviewId: number): Promise<{
        success: boolean;
        isHidden: boolean;
        message: string;
    }>;
}
