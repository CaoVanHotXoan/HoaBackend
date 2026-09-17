import { RecommendationsService } from './recommendations.service';
export declare class RecommendationsController {
    private readonly recommendationsService;
    constructor(recommendationsService: RecommendationsService);
    getRecommendations(req: any): Promise<{
        success: boolean;
        data: any[];
        type: string;
    }>;
}
