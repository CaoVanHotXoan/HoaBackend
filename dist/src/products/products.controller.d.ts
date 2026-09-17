import { ProductsService } from './products.service';
export declare class ProductsController {
    private productsService;
    constructor(productsService: ProductsService);
    getProducts(search?: string, categoryId?: string, page?: string, limit?: string): Promise<{
        products: any[];
        pagination: {
            totalItems: any;
            totalPages: number;
            currentPage: number;
            itemsPerPage: number;
        };
    }>;
    getCategories(): Promise<any[]>;
    getProductById(id: number): Promise<{
        message: string;
        product: any;
    }>;
    createCategory(body: any): Promise<any>;
    updateCategory(id: number, body: any): Promise<{
        message: string;
        category: any;
    }>;
    createProduct(body: any): Promise<any>;
    updateProduct(id: number, body: any): Promise<{
        message: string;
        product: any;
    }>;
    deleteProduct(id: number): Promise<{
        message: string;
        product: any;
    }>;
    toggleProductStatus(id: number, isActive: boolean): Promise<{
        message: string;
        product: any;
    }>;
    getProductHistory(id: number): Promise<{
        message: string;
        history: any[];
    }>;
}
