import { DatabaseService } from '../database/database.service';
export declare class ProductsService {
    private dbService;
    constructor(dbService: DatabaseService);
    getCategories(): Promise<any[]>;
    getCategoryById(id: number): Promise<any>;
    createCategory(categoryName: string, description: string, imageUrl?: string): Promise<any>;
    updateCategory(id: number, categoryName: string, description: string, imageUrl?: string): Promise<any>;
    getProducts(search?: string, categoryId?: number, page?: number, limit?: number): Promise<{
        products: any[];
        pagination: {
            totalItems: any;
            totalPages: number;
            currentPage: number;
            itemsPerPage: number;
        };
    }>;
    getProductById(id: number): Promise<any>;
    createProduct(productName: string, categoryId: number, price: number, inventory: number, imageUrl: string, ingredients?: string, description?: string): Promise<any>;
    updateProduct(id: number, productName: string, categoryId: number, price: number, inventory: number, imageUrl: string, ingredients?: string, description?: string): Promise<any>;
    toggleProductStatus(id: number, isActive: boolean): Promise<any>;
    getProductHistory(id: number): Promise<any[]>;
}
