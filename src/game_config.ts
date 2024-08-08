
export const _GAME_CONFIG = {
    server_port: 3000,
};

export type NetMessages = {
    CS_Connect: { nick: string, id_room: number, id_session: string },
    SC_Init: { server_time: number, id_user: number, data: string },
    SC_Close: {},
    SC_Join: { id_user: number, nick: string },
    SC_Leave: { id_user: number },
    CS_Ping: { client_time: number },
    SC_Pong: { client_time: number, server_time: number },
    CS_Send_Chat: { text: string },
    SC_Chat_Message: { nick: string, text: string }
    SC_Chat_Messages: { nick: string, text: string }[]
};

// пользовательские сообщения под конкретный проект, доступны типы через глобальную тип-переменную UserMessages
export type _UserMessages = {
    START_GAME: {}

};