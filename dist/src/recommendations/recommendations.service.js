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
var RecommendationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let RecommendationsService = RecommendationsService_1 = class RecommendationsService {
    constructor(databaseService) {
        this.databaseService = databaseService;
        this.logger = new common_1.Logger(RecommendationsService_1.name);
    }
    async getRecommendations(userId) {
        try {
            let recommendedProducts = [];
            if (userId) {
                const searchIntentQuery = `
          SELECT DISTINCT SearchQuery 
          FROM useractionlogs 
          WHERE UserID = @UserID AND ActionType = 'SEARCH' 
            AND CreatedAt >= CURRENT_TIMESTAMP - INTERVAL '7 days'
            AND SearchQuery IS NOT NULL
        `;
                const searchResult = await this.databaseService.query(searchIntentQuery, [{ name: 'UserID', value: userId }]);
                const searchQueries = searchResult.recordset
                    .map((r) => r.SearchQuery)
                    .filter((q) => q && q.trim().length > 0);
                let searchScoreSql = '0';
                if (searchQueries.length > 0) {
                    const likeConditions = searchQueries
                        .map((q) => `p.ProductName LIKE '%${q.replace(/'/g, "''")}%'`)
                        .join(' OR ');
                    searchScoreSql = `CASE WHEN (${likeConditions}) THEN 5 ELSE 0 END`;
                }
                const personalQuery = `
          WITH RecentLogs AS (
              SELECT ProductID, ActionType
              FROM useractionlogs
              WHERE UserID = @UserID AND CreatedAt >= CURRENT_TIMESTAMP - INTERVAL '7 days' AND ProductID IS NOT NULL
          ),
          ActionScores AS (
              SELECT ProductID,
                     SUM(CASE ActionType
                         WHEN 'VIEW_PRODUCT' THEN 1
                         WHEN 'ADD_TO_CART' THEN 2
                         WHEN 'FAVORITE_PRODUCT' THEN 3
                         ELSE 0 END) AS Score
              FROM RecentLogs
              GROUP BY ProductID
          ),
          PurchaseScores AS (
              SELECT ProductID, TotalQuantityOrdered * 2 AS Score -- Trọng số cho món đã từng mua
              FROM v_RecommendedProducts
              WHERE UserID = @UserID
          ),
          CombinedScores AS (
              SELECT ProductID, SUM(Score) AS BaseScore
              FROM (
                  SELECT ProductID, Score FROM ActionScores
                  UNION ALL
                  SELECT ProductID, Score FROM PurchaseScores
              ) t
              GROUP BY ProductID
          )
          SELECT 
              p.ProductID, p.ProductName, p.Price, p.ImageURL, c.CategoryName, p.Inventory, 
              (COALESCE(cs.BaseScore, 0) + ${searchScoreSql}) AS TotalScore
          FROM products p
          LEFT JOIN CombinedScores cs ON p.ProductID = cs.ProductID
          INNER JOIN categories c ON p.CategoryID = c.CategoryID
          WHERE p.IsActive = true AND p.Inventory > 0 AND (COALESCE(cs.BaseScore, 0) + ${searchScoreSql}) > 0
          ORDER BY TotalScore DESC
          LIMIT 10
        `;
                const personalResult = await this.databaseService.query(personalQuery, [
                    { name: 'UserID', value: userId },
                ]);
                recommendedProducts = personalResult.recordset;
            }
            let recommendationType = 'personalized';
            if (recommendedProducts.length === 0) {
                const topSellingQuery = `
          SELECT p.ProductID, p.ProductName, p.Price, p.ImageURL, c.CategoryName, p.Inventory, v.TotalSold
          FROM v_SanPhamBanChay v
          INNER JOIN products p ON v.ProductID = p.ProductID
          INNER JOIN categories c ON p.CategoryID = c.CategoryID
          WHERE p.IsActive = true AND p.Inventory > 0
          ORDER BY v.TotalSold DESC
          LIMIT 10
        `;
                const topSellingResult = await this.databaseService.query(topSellingQuery);
                recommendedProducts = topSellingResult.recordset;
                recommendationType = 'top_selling';
            }
            if (recommendedProducts.length === 0) {
                const randomQuery = `
          SELECT p.ProductID, p.ProductName, p.Price, p.ImageURL, c.CategoryName, p.Inventory
          FROM products p
          INNER JOIN categories c ON p.CategoryID = c.CategoryID
          WHERE p.IsActive = true AND p.Inventory > 0
          ORDER BY RANDOM()
          LIMIT 10
        `;
                const randomResult = await this.databaseService.query(randomQuery);
                recommendedProducts = randomResult.recordset;
                recommendationType = 'random';
            }
            return { items: recommendedProducts, type: recommendationType };
        }
        catch (error) {
            this.logger.error('Error fetching recommendations', error);
            require('fs').writeFileSync('recs_error.log', (error ? error.stack : 'Unknown error') + '');
            throw error;
        }
    }
};
exports.RecommendationsService = RecommendationsService;
exports.RecommendationsService = RecommendationsService = RecommendationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], RecommendationsService);
//# sourceMappingURL=recommendations.service.js.map