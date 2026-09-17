import { FavoritesService } from './favorites.service';
export declare class FavoritesController {
    private readonly favoritesService;
    constructor(favoritesService: FavoritesService);
    getFavorites(req: any): Promise<any[]>;
    addFavorite(req: any, productId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    removeFavorite(req: any, productId: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
