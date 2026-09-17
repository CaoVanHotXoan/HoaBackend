import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
export declare class AuthController {
    private authService;
    private usersService;
    constructor(authService: AuthService, usersService: UsersService);
    register(body: any): Promise<{
        message: string;
        user: any;
    }>;
    login(body: any): Promise<{
        message: string;
        accessToken: string;
        user: {
            userId: any;
            fullName: any;
            email: any;
            role: any;
        };
    }>;
    getProfile(req: any): {
        message: string;
        user: any;
    };
    updateProfile(req: any, body: any): Promise<{
        message: string;
        user: any;
    }>;
    changePassword(req: any, body: any): Promise<{
        message: string;
    }>;
}
