import { BaseRoom, IBaseRoom } from "./base_room";
import { ExtWebSocket, WsClient } from "./modules/types";
import { WsServer } from "./modules/WsServer";
import { NetMessages } from "./game_config";
import { GameRoom } from "./GameRoom";

export function GameServer(server_port: number) {
    const rooms: { [k: string]: IBaseRoom } = {};
    const data_sessions: { [k: string]: any } = {};
    let id_user_counter = 0;


    const ws_server = WsServer<ExtWebSocket>(server_port,
        // on_data
        (client, data) => {
            log('client data', client.data, data);
            try {
                if (!verify_message(client.data, data as string))
                    return;
                const pack = json.decode(data as string);
                on_message(client, pack.id as any, pack.message as any);
            }
            catch (e: any) {
                Log.error("Ошибка при парсинге: " + e.message + "\nid_user=", client.data, 'данные:', data, '\nстек:', e.stack);
            }

        },
        //on_client_connected, 
        (client) => {
            log('client connected', client.data);
            on_connect(client);
        }
        //on_client_disconnected
        , (client) => {
            log('client disconnected', client.data);
            on_disconnect(client);
        }
    );
    log("Запущен сервер на порту " + server_port);

    function start() {
        const room = GameRoom();
        add_room(1, room);
        update();
    }

    function add_room(id: number, room: IBaseRoom) {
        rooms[id] = room;
    }

    function update() {
        for (const rid in rooms) {
            const room = rooms[rid];
            room.update();
        }
        setTimeout(() => update(), 1000);
    }


    function on_connect(socket: WsClient) {
        //
    }

    function on_disconnect(socket: WsClient) {
        //
        if (socket.data.id_user !== undefined && socket.data.id_room !== undefined) {
            const rid = socket.data.id_room;
            const room = rooms[rid];
            if (room != undefined)
                room.on_leave(socket);
        }
    }

    function get_session_data(id_session: string) {
        return data_sessions[id_session];
    }

    function set_session_data(id_session: string, key: string, data: any) {
        if (data_sessions[id_session] == undefined)
            data_sessions[id_session] = {};
        data_sessions[id_session][key] = data;
    }


    function verify_message(client_data: ExtWebSocket, data: string) {
        try {
            const msg = json.decode(data);
            if (!('id' in msg)) {
                Log.error("Ошибка verify_message: не найден ID сообщения");
                return false;
            }
            if (!('message' in msg)) {
                Log.error("Ошибка verify_message: не найдено тело сообщения message");
                return false;
            }
        }
        catch (e: any) {
            Log.error("Ошибка verify_message: " + e.message + "\nid_user=", client_data, 'данные:', data, '\nстек:', e.stack);
            return false;
        }
        return true;
    }

    function on_message<T extends keyof NetMessages>(socket: WsClient, id_message: T, _message: NetMessages[T]) {
        //log('on_message', id_message, _message);
        if (id_message == 'CS_Connect') {
            const message = _message as NetMessages['CS_Connect'];
            socket.data.id_session = message.id_session; // add session
            const id_session = socket.data.id_session;
            let session_data = get_session_data(id_session);
            if (session_data == undefined) {
                //log('Сессия не считана:', id_session);
                set_session_data(id_session, 'id_user', id_user_counter++);
                set_session_data(id_session, 'id_room', -1);
                session_data = get_session_data(id_session);
            }
            const id_user = session_data['id_user'];
            socket.data.id_room = session_data['id_room'];
            socket.data.id_user = session_data['id_user'];
            let nick = message.nick;

            const info = { nick };
            // уже был подключен к какой-то другой комнате
            if (socket.data.id_room !== undefined && socket.data.id_room != message.id_room) {
                const room = rooms[socket.data.id_room];
                if (room != undefined) {
                    log('Комната уже была', socket.data.id_room, socket.data.id_user);
                    room.on_leave(socket);
                }
            }
            // ищем комнату в которую просится
            const room = rooms[message.id_room];
            if (room != undefined) {
                socket.data.id_room = message.id_room;
                set_session_data(id_session, 'id_user', socket.data.id_user);
                set_session_data(id_session, 'id_room', socket.data.id_room);
                // другой сокет подключен с таким id_user, надо разорвать
                if (room.connected_users[id_user] != undefined && room.connected_users[id_user]) {
                    const sck = room.connected_users[id_user];
                    room.on_reconnect(room.connected_users[id_user]);
                    sck.close(); // намеренно рвем сами соединение
                }
                const is_join = room.on_join(socket, info);
                if (!is_join)
                    Log.warn("не удалось войти в комнату", id_user, message.id_room);
            }
            else
                Log.warn('комната еще не создана, попробуйте позднее', id_user, message.id_room);
            return;
        }
        if (socket.data.id_user === undefined)
            return Log.warn("сокет не имеет id_user");

        if (socket.data.id_room === undefined)
            return Log.warn("сокет не закреплен за комнатой");

        const room = rooms[socket.data.id_room];
        if (!room)
            return Log.warn('пакет cs -> комната не существует:', socket.data.id_room);
        room.on_message(socket, id_message, _message);
    }


    return { start, add_room };
}