/* eslint-disable @typescript-eslint/no-explicit-any */

import { ServerWebSocket } from "bun";

export interface ExtWebSocket {
    id_user: number;
    id_room: number;
    id_session: string;
}

export type WsClient = ServerWebSocket<ExtWebSocket>;

export interface ConnectionData {
    id_entity: number;
    id_user: number;
    socket: WsClient;
}

export interface ProtocolWrapper {
    id: string;
    message: any;
}