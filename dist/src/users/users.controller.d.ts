import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getUsers(page?: string, limit?: string): Promise<{
        users: any[];
        pagination: {
            totalItems: any;
            totalPages: number;
            currentPage: number;
            itemsPerPage: number;
        };
    }>;
    toggleLock(id: number, isLocked: boolean): Promise<{
        message: string;
        user: any;
    }>;
}
