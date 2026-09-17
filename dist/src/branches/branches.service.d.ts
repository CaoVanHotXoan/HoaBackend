import { DatabaseService } from '../database/database.service';
export declare class BranchesService {
    private readonly databaseService;
    private readonly logger;
    constructor(databaseService: DatabaseService);
    findAll(): Promise<any[]>;
    create(createBranchDto: any): Promise<any>;
    update(id: number, updateBranchDto: any): Promise<any>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
