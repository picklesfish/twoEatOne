"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mgobexsCode = void 0;
const GameServerState_1 = require("./GameServerState");
const gameServer = {
    mode: 'async',
    onInitGameData: function () {
        return {
            syncType: GameServerState_1.SyncType.msg,
            timer: undefined,
            players: [],
        };
    },
    onRecvFromClient: function ({ actionData, sender, gameData, SDK, room, exports }) {
        //const cmd = actionData.cmd;
        // 更新玩家状态
        //setPlayer(sender, cmd, gameData as GameData);
        console.log("服务端接收到消息，转发");
        SDK.sendData({ playerIdList: [], data: { actionData, sender, gameData, room, exports } });
    },
    onJoinRoom: function ({ actionData, gameData, SDK, room, exports }) {
        // 初始化玩家到游戏数据中
        GameServerState_1.initPlayer(actionData.joinPlayerId, gameData, 0, room.playerList.findIndex(p => p.id === actionData.joinPlayerId));
        SDK.sendData({ playerIdList: [], data: { msg: "hello zhm" } });
    },
    onLeaveRoom: function ({ actionData, gameData, SDK, room, exports }) {
        if (!room || !room.playerList || room.playerList.length === 0) {
            // 房间无人，清理游戏数据
            return GameServerState_1.clearGameState(gameData);
        }
        SDK.sendData({ playerIdList: [], data: { msg: "hello zhm" } });
        // 移除
        GameServerState_1.removePlayer(actionData.leavePlayerId, gameData);
    },
    onDestroyRoom: function ({ actionData, gameData, SDK, room, exports }) {
        // 房间销毁，清理游戏数据
        GameServerState_1.clearGameState(gameData);
    },
    onChangeRoom: function (args) {
        if (args.gameData.timer && args.room && args.room.customProperties === GameServerState_1.SyncType.state) {
            return;
        }
        if (!args.room || args.room.customProperties !== GameServerState_1.SyncType.state) {
            // 不处于状态同步模式，清理游戏数据
            GameServerState_1.clearGameState(args.gameData);
        }
        if (args.room && args.room.customProperties === GameServerState_1.SyncType.state) {
            // 当前处于状态同步模式，初始化游戏数据
            GameServerState_1.initGameState(args.gameData, args);
        }
        args.SDK.sendData({ playerIdList: [], data: { msg: "hello zhm" } });
    },
};
// 服务器初始化时调用
function onInitGameServer(tcb) {
    // 如需要，可以在此初始化 TCB
    const tcbApp = tcb.init({
        secretId: "obg-1ffbgo7t",
        secretKey: "43f8b0b4c4fbb5f236c5fe621ecd904b97ce8491",
        env: "test1-4gvbm18a9a10ad1e",
        serviceUrl: 'http://tcb-admin.tencentyun.com/admin',
        timeout: 5000,
    });
    // ...
}
exports.mgobexsCode = {
    logLevel: 'error+',
    logLevelSDK: 'error+',
    gameInfo: {
        gameId: "obg-2btcw5wz",
        serverKey: "a8d2567589375821331d9c1e243a72d04d497751",
    },
    onInitGameServer,
    gameServer
};
