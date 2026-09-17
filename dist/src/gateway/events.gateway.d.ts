import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { ChatService } from '../chat/chat.service';
export declare class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private configService;
    private dbService;
    private chatService;
    server: Server;
    private lastAutoReplyTime;
    constructor(jwtService: JwtService, configService: ConfigService, dbService: DatabaseService, chatService: ChatService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    startDeliverySimulation(orderId: number, userId: number, startLat: number, startLng: number, endLat: number, endLng: number): void;
    notifyOrderStatusUpdate(userId: number, orderId: number, status: string, cancelReason?: string): void;
    handleSendMessage(client: Socket, payload: {
        receiverId: number;
        text: string;
    }): Promise<void>;
    handleTyping(client: Socket, payload: {
        receiverId: number;
        isTyping: boolean;
    }): Promise<void>;
}
