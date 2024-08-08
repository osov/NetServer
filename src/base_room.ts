import { NetMessages } from "./game_config";
import { ProtocolWrapper, WsClient } from "./modules/types";

export function BaseRoom() {
    const connected_users: { [k: number]: WsClient } = {};
    const buffer_messages: ProtocolWrapper[] = [];
    function now() {
        return Date.now();
    }

    // -----------------------------------------------------------------------
    // network
    // -----------------------------------------------------------------------

    // добавляет сообщение в буфер
    function add_message<T extends keyof NetMessages>(id_message: T, message: NetMessages[T]) {
        buffer_messages.push({ id: id_message, message: json.decode(json.encode(message)) });
    }

    function make_message<T extends keyof NetMessages>(id_message: T, message: NetMessages[T]) {
        return json.encode({ id: id_message, message });
    }

    // отправить конкретному сокету
    function send_message_socket<T extends keyof NetMessages>(socket: WsClient, id_message: T, message: NetMessages[T]) {
        if (socket.readyState === WebSocket.OPEN)
            socket.send(make_message(id_message, message));
    }

    // отправить всем
    function send_message_all<T extends keyof NetMessages>(id_message: T, message: NetMessages[T], except_socket?: WsClient) {
        const pack = make_message(id_message, message);
        for (const id_user in connected_users) {
            const user = connected_users[id_user];
            if (user && user != except_socket && user.readyState === WebSocket.OPEN) {
                user.send(pack);
            }
        }
    }

    // отправить всем собранный буффер
    function send_full_buffer() {
        const buf = buffer_messages.slice(0);
        buffer_messages.splice(0, buffer_messages.length);
        for (let i = 0; i < buf.length; i++) {
            send_message_all(buf[i].id as keyof NetMessages, buf[i].message);
        }
    }

    // -----------------------------------------------------------------------
    // Room events
    // -----------------------------------------------------------------------

    // подключился, авторизован
    function on_join(socket: WsClient, info: any) {
        const id_user = socket.data.id_user;
        connected_users[id_user] = socket;
        // юзеру - инфу о соединении
        send_message_socket(socket, 'SC_Init', { server_time: now(), id_user, data: json.encode(info, {}) });
        return true;
    }

    // переподключился
    function on_reconnect(socket: WsClient) {
        const id_user = socket.data.id_user;
        log("переподключение id_user:", id_user);
        send_message_socket(socket, 'SC_Close', {});
        if (connected_users[id_user])
            on_leave(socket);
    }

    // отключился
    function on_leave(socket: WsClient) {
        delete connected_users[socket.data.id_user];
        log("отключился id_user:", socket.data.id_user);
        add_message('SC_Leave', { id_user: socket.data.id_user });
    }

    function on_message<T extends keyof NetMessages>(socket: WsClient, id_message: T, _message: NetMessages[T]) {
        if (id_message == 'CS_Ping') {
            const message = _message as NetMessages['CS_Ping'];
            send_message_socket(socket, 'SC_Pong', { client_time: message.client_time, server_time: now() });
        }
    }

    function update() {
        send_full_buffer();
    }

    return { on_join, on_leave, on_reconnect, on_message, add_message, make_message, send_message_socket, send_message_all, send_full_buffer, update, connected_users };
}

type IRoom = ReturnType<typeof BaseRoom>;


export interface IBaseRoom {
    on_join: IRoom['on_join'];
    on_leave: IRoom['on_leave'];
    on_reconnect: IRoom['on_reconnect'];
    on_message: IRoom['on_message'];
    update: IRoom['update'];
    connected_users: IRoom['connected_users'];
}
