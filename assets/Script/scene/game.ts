import { mgobexsCode } from "../../../serverless/mgobe-server/test_01/src/mgobexs";
import global from "../global";
import * as Util from "../util";
import {manager} from "./manager";
import {MapData,gameResult,gameInfo,gameMsg} from "./commonData";
const {ccclass, property} = cc._decorator;



@ccclass
export default class game extends cc.Component {
    @property({type:cc.Prefab, displayName:"cell",visible:true})
    private cell:cc.Prefab = null;
    @property({type:cc.Prefab, displayName:"black",visible:true})
    private black:cc.Prefab = null;
    @property({type:cc.Prefab, displayName:"white",visible:true})
    private white:cc.Prefab = null;
    @property({type:cc.Prefab, displayName:"overScenes",visible:true})
    private overScene:cc.Prefab = null;

    public matching = null;

    private main:cc.Node = null;
    private checkerBoard:cc.Node = null;
    private pointer:cc.Node = null;
    private homeBtn:cc.Node = null;
    private player1:cc.Node = null;
    private player2:cc.Node = null;

    private gameMap:Array<Array<MapData>> = [];
    public currentPlayerIsSelf:boolean;     //房主先开始下子
    public myChess:number;                  //棋子类型，1是黑旗，-1是白棋
    private currentChess:cc.Node = null;

    private CHECKER_BOARD_COLUMMN:number = 4;
    private CHECKER_BOARD_CROSS:number = 4;   
    private POINT_LEFT_BOTTOM:cc.Vec2 = cc.v2(-190,-190);
    private POINT_RIGHT_TOP:cc.Vec2 = cc.v2(185,185);
    private BOARD_OFFSET:number = 125;
    private GRID_SIZE:number = 130;
    private CHESS_SIZE:number = 100;
    public BLACK_TYPE:number = 1;
    public WHITE_TYPE:number = -1;

    onEnable(){
        manager.getInstance().setGameScene(this);
        this.initNode();
        this.initMap();
    }
    onDisable(){
        //this.dismissRoom();
    }
    private initNode(){
        this.main = this.node.getChildByName("gameLayer");
        this.checkerBoard = this.main.getChildByName("checkerBoard");
        this.pointer = this.checkerBoard.getChildByName("pointer");
        this.homeBtn = this.main.getChildByName("homeBtn");
        this.player1 = this.main.getChildByName("player1");
        this.player2 = this.main.getChildByName("player2");
    }
    
    private initMap(){
        this.initPalyerInfo();
        this.initCheckerBoard();
        this.initChess();
        this.pointer.on(cc.Node.EventType.TOUCH_START,this.LuoZi,this);
        this.homeBtn.on(cc.Node.EventType.TOUCH_START,this.goHome,this);
    }
    private initPalyerInfo(){
        const roomInfo = global.room && global.room.roomInfo || { playerList: [], owner: undefined } as MGOBE.types.RoomInfo;
        
        console.log("房间信息：" , roomInfo);
        for(let i = 0; i < roomInfo.playerList.length; i++){
            if(roomInfo.playerList[i].id != MGOBE.Player.id){
                this.player2.getChildByName("playerID").getComponent(cc.Label).string = roomInfo.playerList[i].name;
                //头像
                let url = roomInfo.playerList[i].customProfile;
                cc.loader.load({url,type:'jpg'},function(err,text){
                    if(!err){
                        console.log("图片加载成功,头像");
                        manager.getInstance().getGameScene().player2.getChildByName("iconBG").getChildByName("icon").getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(text);
                    }else{
                        console.log("图片加载失败" , err);
                    }
                });
            }else{
                this.player1.getChildByName("playerID").getComponent(cc.Label).string = roomInfo.playerList[i].name;
                let url = roomInfo.playerList[i].customProfile;
                cc.loader.load({url,type:'jpg'},function(err,text){
                    if(!err){
                        console.log("图片加载成功,头像");
                        manager.getInstance().getGameScene().player1.getChildByName("iconBG").getChildByName("icon").getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(text);
                    }else{
                        console.log("图片加载失败" , err);
                    }
                });
            }
            
        }
        if(roomInfo.owner === MGOBE.Player.id){
            //房主，先下
            this.player1.getChildByName("circle").active = true;
            this.player2.getChildByName("circle").active = false;
            this.currentPlayerIsSelf = true;
            this.myChess = 1;

        }else{
            this.player1.getChildByName("circle").active = false;
            this.player2.getChildByName("circle").active = true;
            this.currentPlayerIsSelf = false;
            this.myChess = -1;
        }
    } 
    private initCheckerBoard(){
        for(let i = 0; i < 3; i++){
            for(let j = 0; j < 3; j++){
                let newCell = cc.instantiate(this.cell);
                this.checkerBoard.addChild(newCell);
                newCell.active = true;
                newCell.anchorX = 0;
                newCell.anchorY = 0;
                newCell.x = this.POINT_LEFT_BOTTOM.x + this.BOARD_OFFSET*j;
                newCell.y = this.POINT_LEFT_BOTTOM.y + this.BOARD_OFFSET*i;
                newCell.width = this.GRID_SIZE;
                newCell.height = this.GRID_SIZE;
                newCell.getChildByName("grid").width = this.GRID_SIZE;
                newCell.getChildByName("grid").height = this.GRID_SIZE;
                newCell.getChildByName("egg").active = false;
            }
        }
    }
    private initChess(){
        for(let i = 0; i < this.CHECKER_BOARD_CROSS; i++){
            let array:Array<MapData> = [];
            for(let j = 0; j < this.CHECKER_BOARD_COLUMMN; j++){
                let map = new MapData();
                map.cross = i;
                map.column = j;
                map.size = this.GRID_SIZE;
                if(this.myChess == 1){
                    map.PosX = i*this.BOARD_OFFSET + this.POINT_LEFT_BOTTOM.x;
                    map.PosY = j*this.BOARD_OFFSET + this.POINT_LEFT_BOTTOM.y;
                }else{
                    map.PosX = this.POINT_RIGHT_TOP.x - i*this.BOARD_OFFSET;
                    map.PosY = this.POINT_RIGHT_TOP.y - j*this.BOARD_OFFSET;
                }
                
                let node = null;
                if((j == 0) || ((j == 1) && ((i ==0) || (i == 3)))){  //黑子
                    map.type = this.BLACK_TYPE;
                    node = cc.instantiate(this.black);
                    node.getComponent("chess").type = this.BLACK_TYPE;
                }else if((j == 3) || ((j == 2) && ((i ==0) || (i == 3)))){  //白子
                    map.type = this.WHITE_TYPE;
                    node = cc.instantiate(this.white);
                    node.getComponent("chess").type = this.WHITE_TYPE;
                }else{
                    map.type = 0;
                }
                if(node != null){
                    node.getComponent("chess").main = this;
                    this.checkerBoard.addChild(node);
                    node.anchorX = 0.5;
                    node.anchorY = 0.5;
                    if(this.myChess == 1){
                        node.x = i*this.BOARD_OFFSET + this.POINT_LEFT_BOTTOM.x;
                        node.y = j*this.BOARD_OFFSET + this.POINT_LEFT_BOTTOM.y;
                    }else{
                        node.x = this.POINT_RIGHT_TOP.x - i*this.BOARD_OFFSET;
                        node.y = this.POINT_RIGHT_TOP.y - j*this.BOARD_OFFSET;
                    }
                    node.width = this.CHESS_SIZE;
                    node.height = this.CHESS_SIZE;
                    node.getChildByName("checked").active = false;
                    map.node = node; 
                }
                array.push(map);
            }
            this.gameMap.push(array);
        }
    }

    /**
     * 棋子被点击后设置为当前棋子
    */
    public setCurrentChess(chess:cc.Node){
        this.currentChess = chess;
        this.checkerBoard.on(cc.Node.EventType.TOUCH_START,this.check,this);
    }
    /**
     * 清除选中标记
     */
    public cleanCheckedState(){
         for(let i = 0; i < this.gameMap.length; i++){
            for(let j = 0; j < this.gameMap[i].length; j++){
                if(this.gameMap[i][j].node != null){   
                    this.gameMap[i][j].node.getChildByName("checked").active = false;
                }
            }
         }
         this.pointer.active = false;
    }

    private check(e:cc.Event.EventTouch){
        if(this.currentChess == null){
            return ;
        }
        let pos = this.checkerBoard.convertToNodeSpaceAR(e.getLocation());
        let posx = Math.trunc( (pos.x - this.POINT_LEFT_BOTTOM.x + this.BOARD_OFFSET/2)/this.BOARD_OFFSET )*this.BOARD_OFFSET + this.POINT_LEFT_BOTTOM.x;
        let posy = Math.trunc( (pos.y - this.POINT_LEFT_BOTTOM.y + this.BOARD_OFFSET/2)/this.BOARD_OFFSET )*this.BOARD_OFFSET + this.POINT_LEFT_BOTTOM.y;
        console.log("posx:" + pos.x + ",posy:" + pos.y);
        console.log("x:" + posx + ",y:" + posy);
        if(this.canLuoZi(posx,posy)){
            this.pointer.x = posx;
            this.pointer.y = posy;
            this.pointer.active = true;
        }
    }
    /**
     * 判断此位置是否可落子
    */
    private canLuoZi(posx:number,posy:number){
        let map1 = this.getMapByPosition(posx,posy);
        let map2 = this.getMapByPosition(this.currentChess.x,this.currentChess.y);
        if((map1.cross == map2.cross) && (Math.abs(map1.column - map2.column) == 1)){
            if(map1.type == 0){
                return true;
            }
        }
        if((map1.column == map2.column) && (Math.abs(map1.cross - map2.cross) == 1)){
            if(map1.type == 0){
                return true;
            }
        }
        return false;
    }
    /**
     * 根据位置返回MapData对象
    */
    private getMapByPosition(x:number,y:number){
        for(let i = 0; i < this.gameMap.length; i++){
            for(let j = 0; j < this.gameMap[i].length; j++){
                if((this.gameMap[i][j].PosX == x) && (this.gameMap[i][j].PosY == y)){
                    return this.gameMap[i][j];
                }
            }
        }
        return null;
    }
    private LuoZi(e:cc.Event.EventTouch){
        this.checkerBoard.off(cc.Node.EventType.TOUCH_START,this.check,this);
        let map1 = this.getMapByPosition(this.pointer.x,this.pointer.y);
        let map2 = this.getMapByPosition(this.currentChess.x,this.currentChess.y);
        this.pointer.active = false;
        
        let info = new gameInfo();
        info.oldStepCross = map2.cross;
        info.oldStepColumn = map2.column;
        info.nextStepColumn = map1.column;
        info.nextStepCross = map1.cross;
        info.playerId = MGOBE.Player.id;
        let msg = new gameMsg();
        msg.type = 0;
        msg.gameinfo = info;

        manager.getInstance().getMgobeSDK().sendToGameInfo(msg);
        this.currentChess = null;
    }
    /**
     * 吃子
     * 当前棋子落下的地方，一条线上只有三个棋子且相连，并且己方两个棋子且相连，则吃对方棋子
     * 返回被吃的棋子的MapData对象
    */
    private captureChess(){
        let self = this.getMapByPosition(this.currentChess.x,this.currentChess.y);
        //纵向检查
        if(this.gameMap[1][self.column].type == self.type){
            if(this.gameMap[2][self.column].type == (-self.type)){
                if((this.gameMap[0][self.column].type == self.type) && (this.gameMap[3][self.column].type == 0)){
                    this.eatChess(this.gameMap[2][self.column]);    //1,1,-1,0
                }
            }else if(this.gameMap[2][self.column].type == self.type){
                if((this.gameMap[3][self.column].type == (-self.type)) && (this.gameMap[0][self.column].type == 0)){
                    this.eatChess(this.gameMap[3][self.column]);    //0,1,1,-1
                }else if(this.gameMap[0][self.column].type == (-self.type) && (this.gameMap[3][self.column].type == 0)){
                    this.eatChess(this.gameMap[0][self.column]);    //-1,1,1,0
                }
            }
        }else if(this.gameMap[1][self.column].type == (-self.type)){
            if((this.gameMap[2][self.column].type == self.type) && (this.gameMap[3][self.column].type == self.type)){
                if(this.gameMap[0][self.column].type == 0){
                    this.eatChess(this.gameMap[1][self.column]);    //0,-1,1,1
                }
            }
        }
        //横向检查
        if(this.gameMap[self.cross][1].type == self.type){
            if(this.gameMap[self.cross][2].type == (-self.type)){
                if((this.gameMap[self.cross][0].type == self.type) && (this.gameMap[self.cross][3].type == 0)){
                    this.eatChess(this.gameMap[self.cross][2]);    //1,1,-1,0
                }
            }else if(this.gameMap[self.cross][2].type == self.type){
                if((this.gameMap[self.cross][3].type == (-self.type)) && (this.gameMap[self.cross][0].type == 0)){
                    this.eatChess(this.gameMap[self.cross][3]);    //0,1,1,-1
                }else if(this.gameMap[self.cross][0].type == (-self.type) && (this.gameMap[self.cross][3].type == 0)){
                    this.eatChess(this.gameMap[self.cross][0]);    //-1,1,1,0
                }
            }
        }else if(this.gameMap[self.cross][1].type == (-self.type)){
            if((this.gameMap[self.cross][2].type == self.type) && (this.gameMap[self.cross][3].type == self.type)){
                if(this.gameMap[self.cross][0].type == 0){
                    this.eatChess(this.gameMap[self.cross][1]);    //0,-1,1,1
                }
            }
        }
    }
    private eatChess(chess:MapData){
        chess.node.active = false;
        chess.type = 0;
        chess.node = null;
    }
    private isGameOver(){
        let blackNum = 0;
        let whiteNum = 0;
        for(let i = 0; i < this.gameMap.length; i++){
            for(let j = 0; j < this.gameMap[i].length; j++){
                if(this.gameMap[i][j].type == this.BLACK_TYPE){
                    blackNum++;
                }else if(this.gameMap[i][j].type == this.WHITE_TYPE){
                    whiteNum++;
                }
            }
        }  
        if(blackNum < 2){
            let msg = new gameMsg();
            msg.type = 2;
            let result = new gameResult();
            result.winChessType = this.WHITE_TYPE;
            msg.gameResult = result;
            manager.getInstance().getMgobeSDK().sendToGameInfo(msg);
            return true;
        }else if(whiteNum < 2){
            let msg = new gameMsg();
            msg.type = 2;
            let result = new gameResult();
            result.winChessType = this.BLACK_TYPE;
            msg.gameResult = result;
            manager.getInstance().getMgobeSDK().sendToGameInfo(msg);
            return true;
        }
        return false;
    }

    public updateView(msg:gameMsg){
        if(msg == null){
            return;
        }
        console.log("广播信息：" , msg);
        if(msg.type == 0){
            let info:any = msg.gameinfo;
            this.cleanCheckedState();
            if(info != null){
                let map1 = this.gameMap[info.oldStepCross][info.oldStepColumn];
                let map2 = this.gameMap[info.nextStepCross][info.nextStepColumn];
                this.currentChess = map1.node;
                this.currentChess.getChildByName("checked").active = true;
                if(this.currentChess != null){
                    this.currentChess.x = map2.PosX;
                    this.currentChess.y = map2.PosY;
                    map2.type = map1.type;
                    map2.node = map1.node;
                    map1.type = 0;
                    map1.node = null;
                    this.captureChess();
                    if(this.isGameOver()){
                        return ;
                    }
                    this.currentChess = null;
                }else{
                    console.log("出错啦");
                }
                if(info.playerId == MGOBE.Player.id){
                    this.currentPlayerIsSelf = false;
                    this.player1.getChildByName("circle").active = false;
                    this.player2.getChildByName("circle").active = true;
                }else{
                    this.currentPlayerIsSelf = true;
                    this.player1.getChildByName("circle").active = true;
                    this.player2.getChildByName("circle").active = false;
                }
            }
        }else if(msg.type == 2){
            let result = msg.gameResult;
            if(result != null){
                let over = cc.instantiate(this.overScene);
                over.getComponent("gameOver").game = this;
                this.node.addChild(over);
                if(result.winChessType == this.myChess){
                    over.getComponent("gameOver").youWin();
                }else{
                    over.getComponent("gameOver").youFail();
                }
            }
        }
    }
    public gameAgain(){
        if(this.node){
            this.node.destroy();
        }
        manager.getInstance().getHomeScene().addMatching();
        let matching = manager.getInstance().getMatchingScene();
        if(matching != null){
            matching.match();
        }
    }
    public goHome(){
        const roomInfo = global.room && global.room.roomInfo || { playerList: [], owner: undefined } as MGOBE.types.RoomInfo;
        // if(roomInfo.owner === MGOBE.Player.id){
        //     this.dismissRoom();
        // }else{
        manager.getInstance().getMgobeSDK().leaveRoom();
        manager.getInstance().getHomeScene().removeGameScene();
        manager.getInstance().getHomeScene().showScene();
    }


    public playerLeave(){
        if(this.node){
            let over = cc.instantiate(this.overScene);
            over.getComponent("gameOver").game = this;
            this.node.addChild(over);
            over.getComponent("gameOver").youWin();
        }
        const roomInfo = global.room && global.room.roomInfo || { playerList: [], owner: undefined } as MGOBE.types.RoomInfo;
        if(roomInfo.owner === MGOBE.Player.id){
            manager.getInstance().getMgobeSDK().dismissRoom();
        }
    }
}



