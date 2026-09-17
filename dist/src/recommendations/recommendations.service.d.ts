import { DatabaseService } from '../database/database.service';
export declare class RecommendationsService {
    private readonly databaseService;
    private readonly logger;
    constructor(databaseService: DatabaseService);
    getRecommendations(userId?: number): Promise<{
        items: any[];
        type: string;
    }>;
}
