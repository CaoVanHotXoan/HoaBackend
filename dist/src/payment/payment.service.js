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
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const database_service_1 = require("../database/database.service");
const vnpay_1 = require("vnpay");
let PaymentService = class PaymentService {
    constructor(dbService, configService) {
        this.dbService = dbService;
        this.configService = configService;
        const tmnCode = this.configService.get('VNP_TMN_CODE')?.trim() || '';
        const secureSecret = this.configService.get('VNP_HASH_SECRET')?.trim() || '';
        this.vnpayInstance = new vnpay_1.VNPay({
            tmnCode: tmnCode,
            secureSecret: secureSecret,
            vnpayHost: 'https://sandbox.vnpayment.vn',
            testMode: true,
            enableLog: true,
        });
    }
    async createPaymentUrl(userId, orderId, ipAddr) {
        const orderResult = await this.dbService.query(`SELECT OrderID, UserID, FinalAmount, PaymentStatus, Status FROM Orders WHERE OrderID = @OrderID`, [{ name: 'OrderID', value: orderId }]);
        if (orderResult.recordset.length === 0) {
            throw new common_1.NotFoundException('Đơn hàng không tồn tại.');
        }
        const order = orderResult.recordset[0];
        if (order.UserID !== userId) {
            throw new common_1.BadRequestException('Bạn không có quyền thanh toán cho đơn hàng này.');
        }
        if (order.PaymentStatus === 'Đã thanh toán') {
            throw new common_1.BadRequestException('Đơn hàng này đã được thanh toán trước đó.');
        }
        if (order.Status === 'Đã hủy') {
            throw new common_1.BadRequestException('Không thể thanh toán đơn hàng đã hủy.');
        }
        const returnUrl = this.configService.get('VNP_RETURN_URL')?.trim() ||
            'http://localhost:5173/';
        const date = new Date();
        const yyyy = date.getFullYear().toString();
        const MM = (date.getMonth() + 1).toString().padStart(2, '0');
        const dd = date.getDate().toString().padStart(2, '0');
        const HH = date.getHours().toString().padStart(2, '0');
        const mm = date.getMinutes().toString().padStart(2, '0');
        const ss = date.getSeconds().toString().padStart(2, '0');
        const createDate = Number(yyyy + MM + dd + HH + mm + ss);
        const finalUrl = this.vnpayInstance.buildPaymentUrl({
            vnp_Amount: Math.round(order.FinalAmount),
            vnp_IpAddr: ipAddr || '127.0.0.1',
            vnp_ReturnUrl: returnUrl,
            vnp_TxnRef: orderId.toString() + '_' + Date.now(),
            vnp_OrderInfo: `Thanh_toan_don_hang_${orderId}`,
            vnp_OrderType: vnpay_1.ProductCode.Other,
            vnp_CreateDate: createDate,
        });
        return finalUrl;
    }
    async processReturn(queryParams) {
        let verify;
        try {
            verify = this.vnpayInstance.verifyReturnUrl(queryParams);
        }
        catch (err) {
            return {
                success: false,
                message: 'Chữ ký giao dịch không hợp lệ.',
                orderId: queryParams['vnp_TxnRef']
                    ? parseInt(queryParams['vnp_TxnRef'].split('_')[0], 10)
                    : 0,
            };
        }
        const txnRef = queryParams['vnp_TxnRef'] || '';
        const orderId = parseInt(txnRef.split('_')[0], 10);
        const responseCode = queryParams['vnp_ResponseCode'];
        if (!verify.isSuccess) {
            return {
                success: false,
                message: 'Chữ ký giao dịch không hợp lệ.',
                orderId,
            };
        }
        if (responseCode === '00') {
            const transactionNo = queryParams['vnp_TransactionNo'];
            const vnpAmount = parseInt(queryParams['vnp_Amount'] || '0', 10) / 100;
            await this.dbService.query(`UPDATE Orders SET PaymentStatus = 'Đã thanh toán' WHERE OrderID = @OrderID`, [{ name: 'OrderID', value: orderId }]);
            await this.dbService.query(`IF NOT EXISTS (SELECT 1 FROM Transactions WHERE OrderID = @OrderID)
         BEGIN
           INSERT INTO Transactions (OrderID, PaymentGateway, TransactionNo, Amount, Status, ResponseCode, CreatedAt)
           VALUES (@OrderID, 'VNPAY', @TransactionNo, @Amount, 'Thanh cong', @ResponseCode, CURRENT_TIMESTAMP)
         END`, [
                { name: 'OrderID', value: orderId },
                {
                    name: 'TransactionNo',
                    value: transactionNo || `VNP_${Date.now()}`,
                },
                { name: 'Amount', value: vnpAmount },
                { name: 'ResponseCode', value: responseCode },
            ]);
            return {
                success: true,
                orderId,
                message: 'Thanh toán thành công qua VNPay.',
            };
        }
        else {
            return {
                success: false,
                orderId,
                message: `Thanh toán thất bại hoặc bị hủy.`,
            };
        }
    }
    async processIpn(queryParams) {
        try {
            let verify;
            try {
                verify = this.vnpayInstance.verifyIpnCall(queryParams);
            }
            catch (err) {
                return { RspCode: '97', Message: 'Invalid signature' };
            }
            if (!verify.isSuccess) {
                return { RspCode: '97', Message: 'Invalid signature' };
            }
            const txnRef = queryParams['vnp_TxnRef'] || '';
            const orderId = parseInt(txnRef.split('_')[0], 10);
            const responseCode = queryParams['vnp_ResponseCode'];
            const vnpAmount = parseInt(queryParams['vnp_Amount'], 10) / 100;
            const transactionNo = queryParams['vnp_TransactionNo'];
            const orderResult = await this.dbService.query(`SELECT OrderID, FinalAmount, PaymentStatus FROM Orders WHERE OrderID = @OrderID`, [{ name: 'OrderID', value: orderId }]);
            if (orderResult.recordset.length === 0) {
                return { RspCode: '01', Message: 'Order not found' };
            }
            const order = orderResult.recordset[0];
            if (Math.round(order.FinalAmount) !== Math.round(vnpAmount)) {
                return { RspCode: '04', Message: 'Amount mismatch' };
            }
            if (order.PaymentStatus === 'Đã thanh toán') {
                return { RspCode: '02', Message: 'Order already confirmed' };
            }
            const isSuccess = responseCode === '00';
            const paymentStatus = isSuccess ? 'Đã thanh toán' : 'Thất bại';
            const transactionStatus = isSuccess ? 'Thanh cong' : 'That bai';
            await this.dbService.query(`UPDATE Orders SET PaymentStatus = @PaymentStatus WHERE OrderID = @OrderID`, [
                {
                    name: 'PaymentStatus',
                    value: paymentStatus,
                },
                { name: 'OrderID', value: orderId },
            ]);
            await this.dbService.query(`INSERT INTO Transactions (OrderID, PaymentGateway, TransactionNo, Amount, Status, ResponseCode, CreatedAt)
         VALUES (@OrderID, 'VNPAY', @TransactionNo, @Amount, @Status, @ResponseCode, CURRENT_TIMESTAMP)`, [
                { name: 'OrderID', value: orderId },
                {
                    name: 'TransactionNo',
                    value: transactionNo || `VNP_${Date.now()}`,
                },
                { name: 'Amount', value: vnpAmount },
                { name: 'Status', value: transactionStatus },
                { name: 'ResponseCode', value: responseCode },
            ]);
            return { RspCode: '00', Message: 'Confirm success' };
        }
        catch (err) {
            console.error('Lỗi xử lý VNPay IPN:', err);
            return {
                RspCode: '99',
                Message: 'Input required data invalid / System error',
            };
        }
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        config_1.ConfigService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map