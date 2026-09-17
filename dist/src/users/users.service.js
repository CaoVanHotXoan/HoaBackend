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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let UsersService = class UsersService {
    constructor(dbService) {
        this.dbService = dbService;
    }
    async findByEmail(email) {
        const result = await this.dbService.query(`SELECT u.*, r.RoleName 
       FROM Users u 
       INNER JOIN Roles r ON u.RoleID = r.RoleID 
       WHERE u.Email = @Email`, [{ name: 'Email', value: email }]);
        return result.recordset[0] || null;
    }
    async findById(id) {
        const result = await this.dbService.query(`SELECT u.UserID, u.FullName, u.Email, u.Phone, u.IsLocked, u.CreatedAt, r.RoleName 
       FROM Users u 
       INNER JOIN Roles r ON u.RoleID = r.RoleID 
       WHERE u.UserID = @UserID`, [{ name: 'UserID', value: id }]);
        return result.recordset[0] || null;
    }
    async createUser(fullName, email, phone, passwordHash, roleName = 'Client') {
        const roleResult = await this.dbService.query(`SELECT RoleID FROM Roles WHERE RoleName = @RoleName`, [{ name: 'RoleName', value: roleName }]);
        let roleId = roleResult.recordset[0]?.RoleID;
        if (!roleId) {
            const insertRole = await this.dbService.query(`INSERT INTO Roles (RoleName) VALUES (@RoleName) RETURNING RoleID`, [{ name: 'RoleName', value: roleName }]);
            roleId = insertRole.recordset[0].RoleID;
        }
        const result = await this.dbService.query(`INSERT INTO Users (FullName, Email, Phone, PasswordHash, RoleID, IsLocked) 
       VALUES (@FullName, @Email, @Phone, @PasswordHash, @RoleID, false)
       RETURNING UserID, FullName, Email, Phone`, [
            { name: 'FullName', value: fullName },
            { name: 'Email', value: email },
            { name: 'Phone', value: phone },
            { name: 'PasswordHash', value: passwordHash },
            { name: 'RoleID', value: roleId },
        ]);
        return result.recordset[0];
    }
    async updateProfile(id, fullName, phone) {
        const result = await this.dbService.query(`UPDATE Users 
       SET FullName = @FullName, Phone = @Phone 
       WHERE UserID = @UserID
       RETURNING UserID, FullName, Email, Phone`, [
            { name: 'UserID', value: id },
            { name: 'FullName', value: fullName },
            { name: 'Phone', value: phone },
        ]);
        return result.recordset[0] || null;
    }
    async updatePassword(id, passwordHash) {
        await this.dbService.query(`UPDATE Users 
       SET PasswordHash = @PasswordHash 
       WHERE UserID = @UserID`, [
            { name: 'UserID', value: id },
            { name: 'PasswordHash', value: passwordHash },
        ]);
        return true;
    }
    async getUsers(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const result = await this.dbService.query(`SELECT u.UserID, u.FullName, u.Email, u.Phone, u.IsLocked, u.CreatedAt, r.RoleName, COUNT(*) OVER() as TotalCount
       FROM Users u
       INNER JOIN Roles r ON u.RoleID = r.RoleID
       ORDER BY u.UserID DESC
       LIMIT @Limit OFFSET @Offset`, [
            { name: 'Offset', value: offset },
            { name: 'Limit', value: limit },
        ]);
        const users = result.recordset;
        const totalCount = users.length > 0 ? users[0].TotalCount : 0;
        const totalPages = Math.ceil(totalCount / limit);
        return {
            users,
            pagination: {
                totalItems: totalCount,
                totalPages,
                currentPage: page,
                itemsPerPage: limit,
            },
        };
    }
    async toggleLock(id, isLocked) {
        const result = await this.dbService.query(`UPDATE Users 
       SET IsLocked = @IsLocked 
       WHERE UserID = @UserID
       RETURNING UserID, FullName, Email, IsLocked`, [
            { name: 'UserID', value: id },
            { name: 'IsLocked', value: isLocked },
        ]);
        return result.recordset[0] || null;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], UsersService);
//# sourceMappingURL=users.service.js.map