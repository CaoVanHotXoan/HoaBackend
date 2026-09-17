import { DatabaseService } from '../database/database.service';
export declare class UsersService {
    private dbService;
    constructor(dbService: DatabaseService);
    findByEmail(email: string): Promise<any>;
    findById(id: number): Promise<any>;
    createUser(fullName: string, email: string, phone: string, passwordHash: string, roleName?: string): Promise<any>;
    updateProfile(id: number, fullName: string, phone: string): Promise<any>;
    updatePassword(id: number, passwordHash: string): Promise<boolean>;
    getUsers(page?: number, limit?: number): Promise<{
        users: any[];
        pagination: {
            totalItems: any;
            totalPages: number;
            currentPage: number;
            itemsPerPage: number;
        };
    }>;
    toggleLock(id: number, isLocked: boolean): Promise<any>;
}
