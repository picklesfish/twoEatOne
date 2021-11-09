export class gameMsg{
    type:RoomMessageType = 0;
    gameinfo:gameInfo = null;
    gameResult:gameResult = null;
}
export class gameInfo{
    nextStepCross:number;
    nextStepColumn:number;
    playerId:string = null;
    oldStepCross:number;
    oldStepColumn:number;
}
export class gameResult{
    winChessType:number;
}
enum RoomMessageType{
    gameinfo = 0,       //表示游戏中的交互信息
    gameBegin = 1,
    gameOver = 2,
    gameAgain = 3,
    playerLeave = 4,
}
export class MapData{
    public column:number = -1;
    public cross:number = -1;
    public type:number = 0;     //0表示此处无棋子，1表示黑子，-1表示白子
    public PosX:number;
    public PosY:number;
    public size:number;
    public node:cc.Node = null;
}
export class WXInviteInfo{
    roomId = null;
    avatarUrl = null;
    type:number = 0;        //1是对战
}

