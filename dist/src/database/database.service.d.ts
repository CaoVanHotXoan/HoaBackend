import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
export declare class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private configService;
    private readonly logger;
    private pool;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    getPool(): Pool;
    query(queryText: string, params?: {
        name: string;
        type?: any;
        value: any;
    }[]): Promise<{
        recordset: any[];
        rowsAffected: (number | null)[];
    }>;
    executeProcedure(procedureName: string, inputs?: {
        name: string;
        type?: any;
        value: any;
    }[], outputs?: {
        name: string;
        type?: any;
    }[]): Promise<{
        recordset: any[];
        rowsAffected: (number | null)[];
    }>;
}
