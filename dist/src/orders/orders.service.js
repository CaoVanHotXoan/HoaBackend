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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const events_gateway_1 = require("../gateway/events.gateway");
let OrdersService = class OrdersService {
    constructor(dbService, eventsGateway) {
        this.dbService = dbService;
        this.eventsGateway = eventsGateway;
    }
    async createOrder(userId, shippingAddress, latitude, longitude, paymentMethod, promoCode, shippingFee = 0) {
        try {
            const inputs = [
                { name: 'UserID', value: userId },
                {
                    name: 'ShippingAddress',
                    value: shippingAddress,
                },
                { name: 'Latitude', value: latitude || null },
                {
                    name: 'Longitude',
                    value: longitude || null,
                },
                { name: 'PaymentMethod', value: paymentMethod },
                { name: 'PromoCode', value: promoCode || null },
                { name: 'ShippingFee', value: shippingFee },
            ];
            const result = await this.dbService.executeProcedure('sp_TaoHoaDon', inputs);
            if (result.recordset && result.recordset.length > 0) {
                return result.recordset[0];
            }
            throw new common_1.BadRequestException('Không thể hoàn tất tạo đơn hàng.');
        }
        catch (err) {
            throw new common_1.BadRequestException(err.message || 'Lỗi khi đặt hàng.');
        }
    }
    async getClientOrders(userId) {
        const result = await this.dbService.query(`SELECT o.OrderID, o.OrderDate, o.TotalAmount, o.DiscountAmount, o.ShippingFee, o.FinalAmount, 
              o.Status, o.PaymentMethod, o.PaymentStatus, o.ShippingAddress, o.CallCount, p.PromoCode
       FROM Orders o
       LEFT JOIN Promotions p ON o.PromotionID = p.PromotionID
       WHERE o.UserID = @UserID
       ORDER BY o.OrderDate DESC`, [{ name: 'UserID', value: userId }]);
        return result.recordset;
    }
    async getOrderDetails(userId, orderId, isAdmin = false) {
        const orderResult = await this.dbService.query(`SELECT o.*, u.FullName, u.Email, u.Phone, p.PromoCode
       FROM Orders o
       INNER JOIN Users u ON o.UserID = u.UserID
       LEFT JOIN Promotions p ON o.PromotionID = p.PromotionID
       WHERE o.OrderID = @OrderID`, [{ name: 'OrderID', value: orderId }]);
        if (orderResult.recordset.length === 0) {
            throw new common_1.NotFoundException('Đơn hàng không tồn tại.');
        }
        const order = orderResult.recordset[0];
        require('fs').writeFileSync('debug_order.json', JSON.stringify(order, null, 2));
        console.log('DEBUG_ORDER:', order);
        console.log('DEBUG_ORDER:', order);
        if (!isAdmin && order.UserID !== userId) {
            throw new common_1.ForbiddenException('Bạn không có quyền truy cập thông tin đơn hàng này.');
        }
        const itemsResult = await this.dbService.query(`SELECT od.OrderDetailID, od.ProductID, od.Quantity, od.UnitPrice, p.ProductName, p.ImageURL
       FROM OrderDetails od
       INNER JOIN Products p ON od.ProductID = p.ProductID
       WHERE od.OrderID = @OrderID`, [{ name: 'OrderID', value: orderId }]);
        return {
            ...order,
            items: itemsResult.recordset,
        };
    }
    async getAllOrders() {
        const result = await this.dbService.query(`SELECT o.OrderID, o.OrderDate, o.TotalAmount, o.DiscountAmount, o.ShippingFee, o.FinalAmount, 
              o.Status, o.PaymentMethod, o.PaymentStatus, o.ShippingAddress, o.CallCount, u.FullName, u.Email
       FROM Orders o
       INNER JOIN Users u ON o.UserID = u.UserID
       LEFT JOIN Promotions p ON o.PromotionID = p.PromotionID
       ORDER BY o.OrderDate DESC`);
        return result.recordset;
    }
    async updateOrderStatus(orderId, status, cancelReason) {
        const orderResult = await this.dbService.query(`SELECT OrderID, UserID, Latitude, Longitude, PaymentMethod FROM Orders WHERE OrderID = @OrderID`, [{ name: 'OrderID', value: orderId }]);
        if (orderResult.recordset.length === 0) {
            throw new common_1.NotFoundException('Đơn hàng không tồn tại.');
        }
        let paymentStatusQuery = '';
        const params = [
            { name: 'OrderID', value: orderId },
            { name: 'Status', value: status },
        ];
        if (status === 'Hoàn thành') {
            paymentStatusQuery = `, PaymentStatus = 'Đã thanh toán'`;
        }
        await this.dbService.query(`UPDATE Orders 
       SET Status = @Status ${paymentStatusQuery}
       WHERE OrderID = @OrderID`, params);
        this.eventsGateway.notifyOrderStatusUpdate(orderResult.recordset[0].UserID, orderId, status, cancelReason);
        if (status === 'Đang giao') {
            const { UserID, Latitude, Longitude } = orderResult.recordset[0];
            if (Latitude && Longitude) {
                const storeLat = 21.0285;
                const storeLng = 105.8542;
                this.eventsGateway.startDeliverySimulation(orderId, UserID, storeLat, storeLng, Latitude, Longitude);
            }
        }
        return {
            success: true,
            message: `Cập nhật đơn hàng sang "${status}" thành công.`,
        };
    }
    async simulateShipperCall(orderId) {
        const orderResult = await this.dbService.query(`SELECT OrderID, UserID, Status, CallCount FROM Orders WHERE OrderID = @OrderID`, [{ name: 'OrderID', value: orderId }]);
        if (orderResult.recordset.length === 0) {
            throw new common_1.NotFoundException('Đơn hàng không tồn tại.');
        }
        const order = orderResult.recordset[0];
        if (order.Status !== 'Đang giao') {
            throw new common_1.BadRequestException('Chỉ có thể gọi điện khi đơn hàng ở trạng thái Đang giao.');
        }
        const newCallCount = (order.CallCount || 0) + 1;
        if (newCallCount > 3) {
            await this.dbService.query(`UPDATE Orders SET CallCount = @CallCount WHERE OrderID = @OrderID`, [
                { name: 'CallCount', value: newCallCount },
                { name: 'OrderID', value: orderId },
            ]);
            this.eventsGateway.server
                .to(`room_user_${order.UserID}`)
                .emit('shipperCalling', { orderId, callCount: newCallCount });
            return {
                success: true,
                message: 'Shipper đã gọi quá 3 lần. Hệ thống đã gửi cảnh cáo đến khách hàng (không tự động hủy đơn).',
                callCount: newCallCount,
            };
        }
        else {
            await this.dbService.query(`UPDATE Orders SET CallCount = @CallCount WHERE OrderID = @OrderID`, [
                { name: 'CallCount', value: newCallCount },
                { name: 'OrderID', value: orderId },
            ]);
            this.eventsGateway.server
                .to(`room_user_${order.UserID}`)
                .emit('shipperCalling', { orderId, callCount: newCallCount });
            return {
                success: true,
                message: `Đã mô phỏng Shipper gọi điện (Lần ${newCallCount}/3).`,
                callCount: newCallCount,
            };
        }
    }
    async getActivePromotions() {
        const result = await this.dbService.query(`SELECT PromotionID, PromoCode, Description, DiscountPercentage, MaxDiscountAmount, MinOrderValue, UsageLimit, UsedCount, StartDate, EndDate
       FROM Promotions
       WHERE CURRENT_TIMESTAMP BETWEEN StartDate AND EndDate
         AND UsedCount < UsageLimit`);
        return result.recordset;
    }
    async validatePromotion(code, orderTotal) {
        require('fs').appendFileSync('C:\\\\Users\\\\Admin\\\\Desktop\\\\DoAn\\\\backend\\\\promo_debug.log', 'Validate called with: "' + code + '"\\n');
        const result = await this.dbService.query(`SELECT PromotionID, PromoCode, DiscountPercentage, MaxDiscountAmount, MinOrderValue, UsageLimit, UsedCount, StartDate, EndDate
       FROM Promotions
       WHERE PromoCode = @Code`, [{ name: 'Code', value: code }]);
        if (result.recordset.length === 0) {
            require('fs').appendFileSync('C:\\\\Users\\\\Admin\\\\Desktop\\\\DoAn\\\\backend\\\\promo_debug.log', 'Result 0 rows for: "' + code + '"\\n');
            return { valid: false, message: 'Mã giảm giá không tồn tại.' };
        }
        const promo = result.recordset[0];
        const now = new Date();
        if (now < new Date(promo.StartDate) || now > new Date(promo.EndDate)) {
            return {
                valid: false,
                message: 'Mã giảm giá đã hết hạn hoặc chưa được kích hoạt.',
            };
        }
        if (promo.UsedCount >= promo.UsageLimit) {
            return {
                valid: false,
                message: 'Mã giảm giá đã hết lượt sử dụng trên hệ thống.',
            };
        }
        if (orderTotal < promo.MinOrderValue) {
            return {
                valid: false,
                message: `Đơn hàng tối thiểu phải đạt ${promo.MinOrderValue.toLocaleString('vi-VN')} đ để sử dụng mã.`,
            };
        }
        let discountAmount = (orderTotal * promo.DiscountPercentage) / 100;
        if (discountAmount > promo.MaxDiscountAmount) {
            discountAmount = promo.MaxDiscountAmount;
        }
        return {
            valid: true,
            discountAmount,
            promoCode: promo.PromoCode,
            message: 'Áp dụng mã giảm giá thành công!',
        };
    }
    async cancelOrder(userId, orderId) {
        const orderResult = await this.dbService.query(`SELECT UserID, Status FROM Orders WHERE OrderID = @OrderID`, [{ name: 'OrderID', value: orderId }]);
        if (orderResult.recordset.length === 0) {
            throw new common_1.NotFoundException('Đơn hàng không tồn tại.');
        }
        const order = orderResult.recordset[0];
        if (order.UserID !== userId) {
            throw new common_1.ForbiddenException('Bạn không có quyền hủy đơn hàng này.');
        }
        if (order.Status !== 'Chờ xác nhận') {
            throw new common_1.BadRequestException('Chỉ có thể hủy đơn hàng ở trạng thái "Chờ xác nhận".');
        }
        await this.dbService.query(`UPDATE Orders 
       SET Status = 'Đã hủy'
       WHERE OrderID = @OrderID`, [{ name: 'OrderID', value: orderId }]);
        return { success: true, message: 'Hủy đơn hàng thành công.' };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        events_gateway_1.EventsGateway])
], OrdersService);
//# sourceMappingURL=orders.service.js.map