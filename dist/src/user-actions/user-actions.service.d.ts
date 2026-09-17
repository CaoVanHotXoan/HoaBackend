import { DatabaseService } from '../database/database.service';
export declare class UserActionsService {
    private readonly databaseService;
    private readonly logger;
    constructor(databaseService: DatabaseService);
    logAction(userId: number, actionType: string, productId?: number, searchQuery?: string): Promise<{
        success: boolean;
    }>;
}
