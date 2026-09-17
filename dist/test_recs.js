"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const sql = __importStar(require("mssql"));
const config = {
    user: 'sa',
    password: '123456',
    server: 'localhost',
    database: 'DOAN_H',
    options: { encrypt: false, trustServerCertificate: true },
};
async function test() {
    const pool = await new sql.ConnectionPool(config).connect();
    const userId = 2;
    const searchIntentQuery = `
    SELECT DISTINCT SearchQuery 
    FROM UserActionLogs 
    WHERE UserID = @UserID AND ActionType = 'SEARCH' 
      AND CreatedAt >= DATEADD(DAY, -7, GETDATE()) 
      AND SearchQuery IS NOT NULL
  `;
    const searchResult = await pool.request().input('UserID', sql.Int, userId).query(searchIntentQuery);
    const searchQueries = searchResult.recordset.map(r => r.SearchQuery).filter(q => q && q.trim().length > 0);
    console.log('Search Queries:', searchQueries);
    let searchScoreSql = '0';
    if (searchQueries.length > 0) {
        const likeConditions = searchQueries.map(q => `p.ProductName LIKE N'%${q.replace(/'/g, "''")}%'`).join(' OR ');
        searchScoreSql = `CASE WHEN (${likeConditions}) THEN 5 ELSE 0 END`;
    }
    console.log('Search Score SQL:', searchScoreSql);
    const personalQuery = `
    WITH RecentLogs AS (
        SELECT ProductID, ActionType
        FROM UserActionLogs
        WHERE UserID = @UserID AND CreatedAt >= DATEADD(DAY, -7, GETDATE()) AND ProductID IS NOT NULL
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
    SELECT TOP 10 
        p.ProductID, p.ProductName, p.Price, p.ImageURL, c.CategoryName, 
        (ISNULL(cs.BaseScore, 0) + ${searchScoreSql}) AS TotalScore
    FROM Products p
    LEFT JOIN CombinedScores cs ON p.ProductID = cs.ProductID
    INNER JOIN Categories c ON p.CategoryID = c.CategoryID
    WHERE p.IsActive = 1 AND (ISNULL(cs.BaseScore, 0) + ${searchScoreSql}) > 0
    ORDER BY TotalScore DESC
  `;
    console.log('Final SQL:', personalQuery);
    const personalResult = await pool.request().input('UserID', sql.Int, userId).query(personalQuery);
    console.log('Recommended Products:', personalResult.recordset);
    await pool.close();
}
test().catch(console.error);
//# sourceMappingURL=test_recs.js.map