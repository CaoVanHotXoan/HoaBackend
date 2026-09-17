import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    register(fullName: string, email: string, phone: string, password: string): Promise<{
        message: string;
        user: any;
    }>;
    login(email: string, password: string): Promise<{
        message: string;
        accessToken: string;
        user: {
            userId: any;
            fullName: any;
            email: any;
            role: any;
        };
    }>;
    changePassword(userId: number, oldPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
}
