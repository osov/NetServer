import { register_manager } from "./modules/Manager";
import { GameServer } from "./game_server";

register_manager();

const server = GameServer(GAME_CONFIG.server_port);
server.start();
