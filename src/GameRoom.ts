import { BaseRoom } from "./base_room";
import { NetMessages } from "./game_config";
import { WsClient } from "./modules/types";

type ChatMessage = NetMessages['SC_Chat_Message'];

export function GameRoom() {
    const base = BaseRoom();
    const connected_users = base.connected_users;
    const users_data: { [id_user: number]: { nick: string } } = {};
    let chat_messages: ChatMessage[] = [];

    function on_join(socket: WsClient, info: { nick: string }) {
        if (!base.on_join(socket, {}))
            return false;
        const id_user = socket.data.id_user;
        users_data[id_user] = { nick: info.nick };
        base.add_message('SC_Join', { id_user, nick: info.nick });
        log("подключился:", socket.data.id_user);
        base.send_message_socket(socket, 'SC_Chat_Messages', chat_messages);
        return true;
    }

    function on_reconnect(socket: WsClient) {
        base.on_reconnect(socket);
    }

    function on_leave(socket: WsClient) {
        const user = connected_users[socket.data.id_user];
        if (!user)
            return;
        base.on_leave(socket);
    }


    function on_message<T extends keyof NetMessages>(socket: WsClient, id_message: T, _message: NetMessages[T]) {
        base.on_message(socket, id_message, _message);
        if (id_message == 'CS_Send_Chat') {
            const message = _message as NetMessages['CS_Send_Chat'];
            const chat_message = { nick: users_data[socket.data.id_user].nick, text: message.text };
            chat_messages.push(chat_message);
            if (chat_messages.length > 10)
                chat_messages.shift();
            base.send_message_all('SC_Chat_Message', chat_message);
        }

    }

    function update() {
        base.update();
    }

    return { update, on_join, on_leave, on_message, on_reconnect, connected_users, };
}

export type IGameRoom = ReturnType<typeof GameRoom>;