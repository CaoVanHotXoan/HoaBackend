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
var ReviewsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let ReviewsService = ReviewsService_1 = class ReviewsService {
    constructor(databaseService) {
        this.databaseService = databaseService;
        this.logger = new common_1.Logger(ReviewsService_1.name);
    }
    async getReviewsByProduct(productId) {
        try {
            const queryReviews = `
        SELECT r.ReviewID, r.Rating, r.Comment, r.CreatedAt, u.FullName 
        FROM Reviews r
        INNER JOIN Users u ON r.UserID = u.UserID
        WHERE r.ProductID = @ProductID AND r.IsHidden = false
        ORDER BY r.CreatedAt DESC
      `;
            const reviewsResult = await this.databaseService.query(queryReviews, [
                { name: 'ProductID', value: productId },
            ]);
            const queryStats = `
        SELECT 
          COALESCE(AVG(CAST(Rating AS FLOAT)), 0) AS AvgRating, 
          COUNT(*) AS TotalReviews 
        FROM Reviews 
        WHERE ProductID = @ProductID AND IsHidden = false
      `;
            const statsResult = await this.databaseService.query(queryStats, [
                { name: 'ProductID', value: productId },
            ]);
            return {
                reviews: reviewsResult.recordset,
                stats: statsResult.recordset[0],
            };
        }
        catch (error) {
            this.logger.error('Error fetching reviews', error);
            throw error;
        }
    }
    async addReview(userId, productId, orderId, rating, comment) {
        try {
            if (rating < 1 || rating > 5) {
                throw new common_1.BadRequestException('Điểm đánh giá phải từ 1 đến 5 sao.');
            }
            const checkEligibilityQuery = `
        SELECT 1 
        FROM Orders o
        INNER JOIN OrderDetails od ON o.OrderID = od.OrderID
        WHERE o.OrderID = @OrderID 
          AND o.UserID = @UserID 
          AND od.ProductID = @ProductID 
          AND o.Status = 'Hoàn thành'
      `;
            const checkEligibility = await this.databaseService.query(checkEligibilityQuery, [
                { name: 'OrderID', value: orderId },
                { name: 'UserID', value: userId },
                { name: 'ProductID', value: productId },
            ]);
            if (checkEligibility.recordset.length === 0) {
                throw new common_1.BadRequestException('Bạn không đủ điều kiện đánh giá sản phẩm này. Đơn hàng chưa hoàn thành hoặc sản phẩm không nằm trong đơn hàng.');
            }
            const checkDuplicateQuery = `
        SELECT 1 FROM Reviews 
        WHERE OrderID = @OrderID AND ProductID = @ProductID
      `;
            const checkDuplicate = await this.databaseService.query(checkDuplicateQuery, [
                { name: 'OrderID', value: orderId },
                { name: 'ProductID', value: productId },
            ]);
            if (checkDuplicate.recordset.length > 0) {
                throw new common_1.ConflictException('Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi.');
            }
            const insertQuery = `
        INSERT INTO Reviews (UserID, ProductID, OrderID, Rating, Comment)
        VALUES (@UserID, @ProductID, @OrderID, @Rating, @Comment)
      `;
            await this.databaseService.query(insertQuery, [
                { name: 'UserID', value: userId },
                { name: 'ProductID', value: productId },
                { name: 'OrderID', value: orderId },
                { name: 'Rating', value: rating },
                { name: 'Comment', value: comment || '' },
            ]);
            return { success: true, message: 'Cảm ơn bạn đã gửi đánh giá!' };
        }
        catch (error) {
            this.logger.error('Error adding review', error);
            throw error;
        }
    }
    async getAllReviewsForAdmin() {
        try {
            const query = `
        SELECT r.ReviewID, r.Rating, r.Comment, r.CreatedAt, r.IsHidden, 
               u.FullName, p.ProductName
        FROM Reviews r
        INNER JOIN Users u ON r.UserID = u.UserID
        INNER JOIN Products p ON r.ProductID = p.ProductID
        ORDER BY r.CreatedAt DESC
      `;
            const result = await this.databaseService.query(query);
            return result.recordset;
        }
        catch (error) {
            this.logger.error('Error fetching all reviews for admin', error);
            throw error;
        }
    }
    async toggleReviewVisibility(reviewId) {
        try {
            const checkQuery = `SELECT IsHidden FROM Reviews WHERE ReviewID = @ReviewID`;
            const checkResult = await this.databaseService.query(checkQuery, [
                { name: 'ReviewID', value: reviewId },
            ]);
            if (checkResult.recordset.length === 0) {
                throw new common_1.BadRequestException('Đánh giá không tồn tại');
            }
            const currentStatus = checkResult.recordset[0].IsHidden;
            const newStatus = currentStatus ? 0 : 1;
            const updateQuery = `
        UPDATE Reviews 
        SET IsHidden = @NewStatus 
        WHERE ReviewID = @ReviewID
      `;
            await this.databaseService.query(updateQuery, [
                { name: 'NewStatus', value: newStatus },
                { name: 'ReviewID', value: reviewId },
            ]);
            return {
                success: true,
                isHidden: newStatus === 1,
                message: newStatus ? 'Đã ẩn đánh giá' : 'Đã hiển thị đánh giá',
            };
        }
        catch (error) {
            this.logger.error('Error toggling review visibility', error);
            throw error;
        }
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = ReviewsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map