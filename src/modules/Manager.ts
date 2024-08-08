/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { _GAME_CONFIG, _UserMessages } from "../game_config";
import { register_system } from "./System";
import { register_log } from "./Log";
import { register_event_bus } from "./EventBus";
import { register_lua_types } from "./lua_types";


/*
    Основной модуль для подгрузки остальных, доступен по объекту Manager
    также глобально доступна функция to_hash которая ограничит список доступных для отправки сообщений
    при проверке в on_message, например  if (message_id == to_hash('MANAGER_READY'))
*/

declare global {
    const Manager: ReturnType<typeof ManagerModule>;
    type UserMessages = _UserMessages;
    const GAME_CONFIG: typeof _GAME_CONFIG;
}


export function register_manager() {
    register_lua_types();
    (global as any).GAME_CONFIG = _GAME_CONFIG;
    (global as any).Manager = ManagerModule();
}


function ManagerModule() {

    function init() {
        register_system();
        register_log();
        register_event_bus();
    }
    init();

    return { init, };
}


