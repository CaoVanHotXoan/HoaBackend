"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DatabaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const pg_1 = require("pg");
const keyMapping = {
    productid: 'ProductID',
    productname: 'ProductName',
    categoryid: 'CategoryID',
    categoryname: 'CategoryName',
    price: 'Price',
    unitprice: 'UnitPrice',
    inventory: 'Inventory',
    imageurl: 'ImageURL',
    ingredients: 'Ingredients',
    isactive: 'IsActive',
    description: 'Description',
    roleid: 'RoleID',
    rolename: 'RoleName',
    userid: 'UserID',
    fullname: 'FullName',
    email: 'Email',
    passwordhash: 'PasswordHash',
    phone: 'Phone',
    islocked: 'IsLocked',
    createdat: 'CreatedAt',
    orderid: 'OrderID',
    orderdate: 'OrderDate',
    shippingaddress: 'ShippingAddress',
    status: 'Status',
    latitude: 'Latitude',
    longitude: 'Longitude',
    totalamount: 'TotalAmount',
    cartid: 'CartID',
    cartitemid: 'CartItemID',
    quantity: 'Quantity',
    subtotal: 'Subtotal',
    conversationdata: 'ConversationData',
    reviewid: 'ReviewID',
    rating: 'Rating',
    comment: 'Comment',
    ishidden: 'IsHidden',
    promocode: 'PromoCode',
    discountpercentage: 'DiscountPercentage',
    maxdiscountamount: 'MaxDiscountAmount',
    minordervalue: 'MinOrderValue',
    usagelimit: 'UsageLimit',
    usedcount: 'UsedCount',
    startdate: 'StartDate',
    enddate: 'EndDate',
    totalcount: 'TotalCount',
    soldcount: 'SoldCount',
    averagerating: 'AverageRating',
    reviewcount: 'ReviewCount',
    messageid: 'MessageID',
    senderid: 'SenderID',
    receiverid: 'ReceiverID',
    messagetext: 'MessageText',
    sentat: 'SentAt',
    isread: 'IsRead',
    actionid: 'ActionID',
    actiontype: 'ActionType',
    searchquery: 'SearchQuery',
    promotionid: 'PromotionID',
    branchid: 'BranchID',
    branchname: 'BranchName',
    sysstarttime: 'SysStartTime',
    sysendtime: 'SysEndTime',
    count: 'count',
    valid: 'valid',
    discountamount: 'DiscountAmount',
    shippingfee: 'ShippingFee',
    finalamount: 'FinalAmount',
    paymentmethod: 'PaymentMethod',
    paymentstatus: 'PaymentStatus',
    callcount: 'CallCount',
};
let DatabaseService = DatabaseService_1 = class DatabaseService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(DatabaseService_1.name);
    }
    async onModuleInit() {
        const connectionString = this.configService.get('DATABASE_URL');
        const config = {
            user: this.configService.get('DB_USER') || 'postgres',
            password: this.configService.get('DB_PASSWORD') || '',
            host: this.configService.get('DB_HOST') || '127.0.0.1',
            database: this.configService.get('DB_NAME') || 'postgres',
            port: parseInt(this.configService.get('DB_PORT') || '5432', 10),
            max: 10,
            idleTimeoutMillis: 60000,
            connectionTimeoutMillis: 15000,
        };
        if (connectionString) {
            config.connectionString = connectionString;
        }
        if (this.configService.get('DB_ENCRYPT') === 'true' ||
            config.host?.includes('supabase.co')) {
            config.ssl = { rejectUnauthorized: false };
        }
        const maxRetries = 5;
        const retryDelayMs = 5000;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                this.logger.log(`Connecting to PostgreSQL (attempt ${attempt}/${maxRetries})...`);
                this.pool = new pg_1.Pool(config);
                await this.pool.query('SELECT 1');
                this.logger.log('Connected to PostgreSQL successfully (Database: ' +
                    config.database +
                    ').');
                return;
            }
            catch (err) {
                this.logger.warn(`Connection attempt ${attempt} failed: ${err.message}`);
                if (attempt === maxRetries) {
                    this.logger.error('All connection attempts failed. Could not connect to PostgreSQL.');
                    throw err;
                }
                this.logger.log(`Retrying in ${retryDelayMs / 1000}s...`);
                await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
            }
        }
    }
    async onModuleDestroy() {
        if (this.pool) {
            await this.pool.end();
            this.logger.log('PostgreSQL connection pool closed.');
        }
    }
    getPool() {
        return this.pool;
    }
    async query(queryText, params) {
        try {
            let pgQueryText = queryText;
            const pgParams = [];
            if (params && params.length > 0) {
                params.forEach((p, index) => {
                    const paramRegex = new RegExp(`@${p.name}\\b`, 'g');
                    pgQueryText = pgQueryText.replace(paramRegex, `$${index + 1}`);
                    pgParams.push(p.value);
                });
            }
            const result = await this.pool.query(pgQueryText, pgParams);
            const mappedRows = result.rows.map((row) => {
                const newRow = {};
                for (const key in row) {
                    const pascalKey = keyMapping[key] || key;
                    let val = row[key];
                    if ((pascalKey === 'Price' ||
                        pascalKey === 'TotalAmount' ||
                        pascalKey === 'FinalAmount' ||
                        pascalKey === 'DiscountAmount' ||
                        pascalKey === 'ShippingFee' ||
                        pascalKey === 'Subtotal' ||
                        pascalKey === 'MaxDiscountAmount' ||
                        pascalKey === 'MinOrderValue' ||
                        pascalKey === 'Latitude' ||
                        pascalKey === 'Longitude' ||
                        pascalKey === 'UnitPrice') &&
                        typeof val === 'string') {
                        val = Number(val);
                    }
                    newRow[pascalKey] = val;
                }
                return newRow;
            });
            return { recordset: mappedRows, rowsAffected: [result.rowCount] };
        }
        catch (err) {
            this.logger.error(`Query execution failed: ${queryText}`, err);
            throw err;
        }
    }
    async executeProcedure(procedureName, inputs, outputs) {
        try {
            let queryText = `SELECT * FROM ${procedureName}()`;
            const pgParams = [];
            if (inputs && inputs.length > 0) {
                const placeholders = inputs.map((_, i) => `$${i + 1}`).join(', ');
                queryText = `SELECT * FROM ${procedureName}(${placeholders})`;
                inputs.forEach((p) => {
                    pgParams.push(p.value);
                });
            }
            const result = await this.pool.query(queryText, pgParams);
            const mappedRows = result.rows.map((row) => {
                const newRow = {};
                for (const key in row) {
                    const pascalKey = keyMapping[key] || key;
                    let val = row[key];
                    if ((pascalKey === 'Price' ||
                        pascalKey === 'TotalAmount' ||
                        pascalKey === 'FinalAmount' ||
                        pascalKey === 'DiscountAmount' ||
                        pascalKey === 'ShippingFee' ||
                        pascalKey === 'Subtotal' ||
                        pascalKey === 'MaxDiscountAmount' ||
                        pascalKey === 'MinOrderValue' ||
                        pascalKey === 'Latitude' ||
                        pascalKey === 'Longitude' ||
                        pascalKey === 'UnitPrice') &&
                        typeof val === 'string') {
                        val = Number(val);
                    }
                    newRow[pascalKey] = val;
                }
                return newRow;
            });
            return { recordset: mappedRows, rowsAffected: [result.rowCount] };
        }
        catch (err) {
            this.logger.error(`Function execution failed: ${procedureName}`, err);
            throw err;
        }
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = DatabaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DatabaseService);
//# sourceMappingURL=database.service.js.map