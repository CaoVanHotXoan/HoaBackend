import { BranchesService } from './branches.service';
export declare class BranchesController {
    private readonly branchesService;
    constructor(branchesService: BranchesService);
    findAll(): Promise<any[]>;
    create(createBranchDto: any): Promise<any>;
    update(id: string, updateBranchDto: any): Promise<any>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
