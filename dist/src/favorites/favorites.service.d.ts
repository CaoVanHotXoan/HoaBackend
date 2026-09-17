import { DatabaseService } from '../database/database.service';
export declare class FavoritesService {
    private readonly databaseService;
    private readonly logger;
    constructor(databaseService: DatabaseService);
    getFavorites(userId: number): Promise<any[]>;
    addFavorite(userId: number, productId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    removeFavorite(userId: number, productId: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
