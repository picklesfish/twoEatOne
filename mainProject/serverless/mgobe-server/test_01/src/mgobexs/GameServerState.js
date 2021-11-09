"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearGameState = exports.initGameState = exports.setPlayer = exports.removePlayer = exports.initPlayer = exports.random = exports.StateSyncCmd = exports.SyncType = void 0;
var SyncType;
(function (SyncType) {
    SyncType["msg"] = "\u623F\u95F4\u5185\u53D1\u6D88\u606F";
    SyncType["state"] = "\u5B9E\u65F6\u670D\u52A1\u5668\u72B6\u6001\u540C\u6B65";
    SyncType["frame"] = "\u5E27\u540C\u6B65";
})(SyncType = exports.SyncType || (exports.SyncType = {}));
var StateSyncCmd;
(function (StateSyncCmd) {
    StateSyncCmd[StateSyncCmd["up"] = 1] = "up";
    StateSyncCmd[StateSyncCmd["down"] = 2] = "down";
    StateSyncCmd[StateSyncCmd["left"] = 3] = "left";
    StateSyncCmd[StateSyncCmd["right"] = 4] = "right";
})(StateSyncCmd = exports.StateSyncCmd || (exports.StateSyncCmd = {}));
const MAX_Y = 5;
const MIN_Y = 0;
const MAX_X = 12;
const MIN_X = 0;
function random(from, to, fixed) {
    return Math.round(Math.random() * (to - from) * Math.pow(10, fixed)) / (Math.pow(10, fixed));
}
exports.random = random;
function initPlayer(id, gameData, x, y) {
    if (gameData.players.find(p => p.id === id)) {
        // 已存在则不需要初始化
        return;
    }
    gameData.players.push({
        x: typeof x === "undefined" ? random(MIN_X, MAX_X, 0) : x,
        y: typeof y === "undefined" ? random(MIN_Y, MAX_Y, 0) : y,
        id,
    });
}
exports.initPlayer = initPlayer;
// 移除玩家。玩家退房时调用
function removePlayer(id, gameData) {
    const index = gameData.players.findIndex(p => p.id === id);
    if (index >= 0) {
        gameData.players.splice(index, 1);
    }
}
exports.removePlayer = removePlayer;
// 设置玩家状态
function setPlayer(id, cmd, gameData) {
    if (!gameData.players.find(p => p.id === id)) {
        // 添加一个玩家
        initPlayer(id, gameData);
    }
    const player = gameData.players.find(p => p.id === id);
    switch (cmd) {
        case StateSyncCmd.up:
            player.y++;
            break;
        case StateSyncCmd.down:
            player.y--;
            break;
        case StateSyncCmd.left:
            player.x--;
            break;
        case StateSyncCmd.right:
            player.x++;
            break;
        default: return;
    }
    player.x = Math.min(Math.max(player.x, MIN_X), MAX_X);
    player.y = Math.min(Math.max(player.y, MIN_Y), MAX_Y);
}
exports.setPlayer = setPlayer;
function initGameState(gameData, args) {
    gameData.syncType = SyncType.state;
    gameData.players = [];
    args.room && args.room.playerList && args.room.playerList.forEach((p, i) => initPlayer(p.id, gameData, 0, i));
    // 初始化后，开始定时向客户端推送游戏状态
    gameData.timer = setInterval(() => {
        args.SDK.sendData({ playerIdList: [], data: { players: gameData.players } });
    }, 1000 / 15);
}
exports.initGameState = initGameState;
function clearGameState(gameData) {
    gameData.syncType = SyncType.msg;
    clearInterval(gameData.timer);
    gameData.timer = undefined;
    gameData.players = [];
}
exports.clearGameState = clearGameState;
