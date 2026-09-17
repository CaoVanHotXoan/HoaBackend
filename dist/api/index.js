"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const serverless_http_1 = __importDefault(require("serverless-http"));
let serverPromise;
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.setGlobalPrefix('api');
    await app.init();
    const expressApp = app.getHttpAdapter().getInstance();
    return (0, serverless_http_1.default)(expressApp);
}
async function handler(req, res) {
    if (!serverPromise) {
        serverPromise = bootstrap();
    }
    try {
        const server = await serverPromise;
        return server(req, res);
    }
    catch (error) {
        serverPromise = undefined;
        console.error('NestJS bootstrap failed:', error);
        res.statusCode = 500;
        return res.end('Application failed to start');
    }
}
//# sourceMappingURL=index.js.map