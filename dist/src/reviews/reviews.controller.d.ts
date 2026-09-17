import { ReviewsService } from './reviews.service';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    getReviewsByProduct(productId: number): Promise<{
        reviews: any[];
        stats: any;
    }>;
    addReview(req: any, productId: number, orderId: number, rating: number, comment: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getAllReviewsForAdmin(req: any): Promise<any[]>;
    toggleReviewVisibility(req: any, id: number): Promise<{
        success: boolean;
        isHidden: boolean;
        message: string;
    }>;
}
