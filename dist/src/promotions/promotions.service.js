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
exports.PromotionsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let PromotionsService = class PromotionsService {
    constructor(dbService) {
        this.dbService = dbService;
    }
    async getAllPromotions() {
        const result = await this.dbService.query(`SELECT PromotionID, PromoCode, Description, DiscountPercentage, MaxDiscountAmount, MinOrderValue, UsageLimit, UsedCount, StartDate, EndDate
       FROM Promotions
       ORDER BY PromotionID DESC`);
        return result.recordset;
    }
    async createPromotion(data) {
        const { PromoCode, Description, DiscountPercentage, MaxDiscountAmount, MinOrderValue, UsageLimit, StartDate, EndDate, } = data;
        const checkResult = await this.dbService.query(`SELECT PromotionID FROM Promotions WHERE PromoCode = @PromoCode`, [{ name: 'PromoCode', value: PromoCode }]);
        if (checkResult.recordset.length > 0) {
            throw new common_1.BadRequestException('Mã giảm giá này đã tồn tại.');
        }
        const query = `
      INSERT INTO Promotions (PromoCode, Description, DiscountPercentage, MaxDiscountAmount, MinOrderValue, UsageLimit, UsedCount, StartDate, EndDate)
      VALUES (@PromoCode, @Description, @DiscountPercentage, @MaxDiscountAmount, @MinOrderValue, @UsageLimit, 0, @StartDate, @EndDate);
      SELECT SCOPE_IDENTITY() AS PromotionID;
    `;
        const result = await this.dbService.query(query, [
            { name: 'PromoCode', value: PromoCode },
            { name: 'Description', value: Description },
            {
                name: 'DiscountPercentage',
                value: DiscountPercentage,
            },
            {
                name: 'MaxDiscountAmount',
                value: MaxDiscountAmount || null,
            },
            {
                name: 'MinOrderValue',
                value: MinOrderValue || 0,
            },
            { name: 'UsageLimit', value: UsageLimit || null },
            { name: 'StartDate', value: new Date(StartDate) },
            { name: 'EndDate', value: new Date(EndDate) },
        ]);
        return {
            success: true,
            message: 'Tạo mã giảm giá thành công',
            promotionId: result.recordset[0].PromotionID,
        };
    }
    async updatePromotion(id, data) {
        const { PromoCode, Description, DiscountPercentage, MaxDiscountAmount, MinOrderValue, UsageLimit, StartDate, EndDate, } = data;
        const checkResult = await this.dbService.query(`SELECT PromotionID FROM Promotions WHERE PromoCode = @PromoCode AND PromotionID != @PromotionID`, [
            { name: 'PromoCode', value: PromoCode },
            { name: 'PromotionID', value: id },
        ]);
        if (checkResult.recordset.length > 0) {
            throw new common_1.BadRequestException('Mã giảm giá này đã tồn tại ở một chương trình khác.');
        }
        const query = `
      UPDATE Promotions
      SET PromoCode = @PromoCode,
          Description = @Description,
          DiscountPercentage = @DiscountPercentage,
          MaxDiscountAmount = @MaxDiscountAmount,
          MinOrderValue = @MinOrderValue,
          UsageLimit = @UsageLimit,
          StartDate = @StartDate,
          EndDate = @EndDate
      WHERE PromotionID = @PromotionID
    `;
        await this.dbService.query(query, [
            { name: 'PromoCode', value: PromoCode },
            { name: 'Description', value: Description },
            {
                name: 'DiscountPercentage',
                value: DiscountPercentage,
            },
            {
                name: 'MaxDiscountAmount',
                value: MaxDiscountAmount || null,
            },
            {
                name: 'MinOrderValue',
                value: MinOrderValue || 0,
            },
            { name: 'UsageLimit', value: UsageLimit || null },
            { name: 'StartDate', value: new Date(StartDate) },
            { name: 'EndDate', value: new Date(EndDate) },
            { name: 'PromotionID', value: id },
        ]);
        return { success: true, message: 'Cập nhật mã giảm giá thành công' };
    }
    async deletePromotion(id) {
        const checkOrder = await this.dbService.query(`SELECT  OrderID FROM Orders WHERE PromotionID = @PromotionID`, [{ name: 'PromotionID', value: id }]);
        if (checkOrder.recordset.length > 0) {
            throw new common_1.BadRequestException('Không thể xóa mã giảm giá này vì đã có đơn hàng sử dụng.');
        }
        await this.dbService.query(`DELETE FROM Promotions WHERE PromotionID = @PromotionID`, [{ name: 'PromotionID', value: id }]);
        return { success: true, message: 'Xóa mã giảm giá thành công' };
    }
};
exports.PromotionsService = PromotionsService;
exports.PromotionsService = PromotionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], PromotionsService);
//# sourceMappingURL=promotions.service.js.map