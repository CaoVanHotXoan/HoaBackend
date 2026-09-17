import { UserActionsService } from './user-actions.service';
export declare class UserActionsController {
    private readonly userActionsService;
    constructor(userActionsService: UserActionsService);
    logAction(req: any, body: {
        actionType: string;
        productId?: number;
        searchQuery?: string;
    }): Promise<{
        success: boolean;
    }>;
}
