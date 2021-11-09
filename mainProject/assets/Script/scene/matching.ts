import configs from "../config";
import * as Util from "../util";
import global from "../global";
import {manager} from "./manager";
import home from "./home";
import {MapData,gameResult,gameInfo,gameMsg} from "./commonData";
import { share } from "./wxSDK";
import {mgobeSDK} from "./mgobeSDK";

const {ccclass, property} = cc._decorator;

@ccclass
export default class matching extends cc.Component {
    private main:cc.Node = null;
    private player1:cc.Node = null;
    private player2:cc.Node = null;
    private matchOnline:cc.Node = null;
    private btnInvite:cc.Node = null;
    private btnMatching:cc.Node = null;
    private matching:cc.Node = null;
    private btnCancel:cc.Node = null;
    private friendBittle:cc.Node = null;
    private inviteAgain:cc.Node = null;
    private inviteleave:cc.Node = null;
    private inviteBegin:cc.Node = null;

    private btnBack:cc.Node = null;
    private headIconBg:cc.Node = null;
    private seaarchIcon:cc.Node = null;

    private angle:number = 225;
    private radius:number = 30;

    //微信邀请好友信息
    private invitaInfo:string = null;
    private canTouch_invite:boolean = true;
    onEnable(){
        manager.getInstance().setMatchingScene(this);
        this.init();
    }
    onDisable() {
        // 场景销毁时一定要清理回调，避免引用UI时报错
        global.room && (global.room.onUpdate = null);
    }
    private init(){
        this.initNode();
        console.log("manager.userInfo.isRoomOwner:" + manager.getInstance().getHomeScene().isRoomOwner);
        if(manager.getInstance().getHomeScene().isRoomOwner == true){
            this.initScene();
        }else{
            this.joinFriendRoom();
        }
        this.registerListener();
    }
    private initNode(){
        this.main = this.node.getChildByName("gameLayer");
        this.player1 = this.main.getChildByName("player1");
        this.player2 = this.main.getChildByName("player2");
        this.matchOnline = this.main.getChildByName("matchOnline");
        this.btnInvite = this.matchOnline.getChildByName("btn_invite");
        this.btnMatching = this.matchOnline.getChildByName("btn_matching");
        this.matching = this.main.getChildByName("matching");
        this.friendBittle = this.main.getChildByName("friendBittle");
        this.inviteAgain = this.friendBittle.getChildByName("btn_again");
        this.inviteBegin = this.friendBittle.getChildByName("btn_begin");
        this.inviteleave = this.friendBittle.getChildByName("btn_leave");
        
        this.btnBack = this.main.getChildByName("back");
        this.headIconBg = this.player2.getChildByName("headIconBg");
        this.seaarchIcon = this.headIconBg.getChildByName("icon_search");
        this.btnCancel = this.matching.getChildByName("btn_cancel");
    }
    private registerListener(){
        this.btnMatching.on(cc.Node.EventType.TOUCH_START,this.match,this);
        this.btnInvite.on(cc.Node.EventType.TOUCH_START,this.inviteFriend,this);
        this.btnBack.on(cc.Node.EventType.TOUCH_START,()=>{
            if(this.matching.active == true){
                const cancelMatchPara = {
                    matchType:MGOBE.ENUM.MatchType.PLAYER_COMPLEX,
                };
                global.room.cancelPlayerMatch(cancelMatchPara,(event)=>{
                    console.log("取消匹配：", event);
                });
            }
            manager.getInstance().getHomeScene().removeMatching();
            manager.getInstance().getHomeScene().showScene();
        },this);
        this.btnCancel.on(cc.Node.EventType.TOUCH_START,()=>{
            this.btnInvite.active = true;
            this.btnMatching.active = true;
            this.matching.active = false;
            this.unscheduleAllCallbacks();
            this.seaarchIcon.x = -25;
            this.seaarchIcon.y = -25;
            const cancelMatchPara = {
                matchType:MGOBE.ENUM.MatchType.PLAYER_COMPLEX,
            };
            global.room.cancelPlayerMatch(cancelMatchPara,(event)=>{
                console.log("取消匹配：", event);
            });
        },this);
        this.inviteAgain.on(cc.Node.EventType.TOUCH_START,()=>{
            share({
                title:'敢与我一战否？',
                query:this.invitaInfo,
            })
        },this);
        this.inviteleave.on(cc.Node.EventType.TOUCH_START,()=>{
            // global.room.dismissRoom({},event =>{
            //     if(event.code === 0){
            //         console.log("解散成功");
            //     }
            // });
            // this.matchOnline.active = true;
            // this.friendBittle.active = false;
            // this.canTouch_invite = true;
            // manager.getInstance().getHomeScene().removeMatching();
            // manager.getInstance().getHomeScene().showScene();
        },this);
        this.inviteBegin.on(cc.Node.EventType.TOUCH_START, ()=>{
            //发送消息让对方也进入对战页面
            let info = new gameMsg();
            info.type = 1;
            manager.getInstance().getMgobeSDK().sendToGameInfo(info);
            this.toGameRoom();
        },this);
    }
    private initScene(){
        let url = manager.userInfo.info.avatarUrl;
        let nickName = this.player1.getChildByName("nickName").getChildByName("text");
        nickName.getComponent(cc.Label).string = manager.userInfo.info.nickName;
        cc.loader.load({url,type:'jpg'},function(err,text){
            if(!err){
                console.log("图片加载成功");
                let icon = manager.getInstance().getMatchingScene().player1.getChildByName("headIconBg").getChildByName("icon");
                icon.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(text);
            }else{
                console.log("图片加载失败" , err);
            }
        });
    }
    private setHeadIcon(){
        const roomInfo = global.room && global.room.roomInfo || { playerList: [], owner: undefined } as MGOBE.types.RoomInfo;
        console.log("房间信息：" , roomInfo);

        for(let i = 0; i < roomInfo.playerList.length; i++){
            if(roomInfo.playerList[i].id != roomInfo.owner){
                console.log("非房主");
                this.player2.getChildByName("headIconBg").getChildByName("icon_search").active = false;
                let nickName = this.player2.getChildByName("nickName").getChildByName("text");
                nickName.getComponent(cc.Label).string = roomInfo.playerList[i].name;
                //头像
                let url = roomInfo.playerList[i].customProfile;
                cc.loader.load({url,type:'jpg'},function(err,text){
                    if(!err){
                        console.log("图片加载成功1");
                        let icon = manager.getInstance().getMatchingScene().player2.getChildByName("headIconBg").getChildByName("icon");
                        icon.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(text);
                    }else{
                        console.log("图片加载失败" , err);
                    }
                });
            }else{
                console.log("房主");
                let nickName = this.player1.getChildByName("nickName").getChildByName("text");
                nickName.getComponent(cc.Label).string = roomInfo.playerList[i].name;
                //头像
                let url = roomInfo.playerList[i].customProfile;
                cc.loader.load({url,type:'jpg'},function(err,text){
                    if(!err){
                        console.log("图片加载成功2");
                        let icon = manager.getInstance().getMatchingScene().player1.getChildByName("headIconBg").getChildByName("icon");
                        icon.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(text);
                    }else{
                        console.log("图片加载失败" , err);
                    }
                });
            }
        }
    }

    //在线匹配
    public match(){
        console.log("开始游戏");
        this.btnInvite.active = false;
        this.btnMatching.active = false;
        this.matching.active = true;
        this.matchPlayers();
        this.schedule(this.searchAction,0.1);
    }
    private matchPlayers() {
        let matchCode = manager.matchCode;
        if (!matchCode) {
            return Util.appendLog(`请输入正确的匹配 Code`);
        }
        // 注意：这里没有使用匹配属性，如果匹配规则中有设置匹配属性，这里需要做调整
        const matchAttributes: MGOBE.types.MatchAttribute[] = [];

        const playerInfo: MGOBE.types.MatchPlayerInfoPara = {
            name: "未知用户",
            customPlayerStatus: 0,
            customProfile: "",
            matchAttributes,
        };
        console.log("manager.userInfo.info:" , manager.userInfo.info);
        if(manager.userInfo.info){
            playerInfo.name = manager.userInfo.info.nickName;
            playerInfo.customProfile = manager.userInfo.info.avatarUrl;
        }

        const matchPlayersPara: MGOBE.types.MatchPlayersPara = {
            matchCode,
            playerInfo,
        };

        global.room.initRoom();
        global.room.matchPlayers(matchPlayersPara, event => {
            if (event.code === MGOBE.ErrCode.EC_OK) {
                Util.appendLog(`随机匹配成功，房间ID：${event.data.roomInfo.id}`);
                console.log("匹配成功");
                this.toGameRoom();
            } else {
                Util.appendLog(`随机匹配失败，错误码：${event.code}`);
            }
        });
    }
    private searchAction(){
        this.angle += 10;
        if(this.angle > 360){
            this.angle = this.angle - 360;
        }
        let posX = this.radius*Math.cos((this.angle/180)*3.14);
        let posY = this.radius*Math.sin((this.angle/180)*3.14);
        this.seaarchIcon.x = posX;
        this.seaarchIcon.y = posY;
    }


    //邀请好友
    public inviteFriend(){
        if(this.canTouch_invite == false){
            return ;
        }
        this.canTouch_invite = false;
        console.log("邀请好友");
        // 注意：这里没有使用匹配属性，如果匹配规则中有设置匹配属性，这里需要做调整
        const matchAttributes: MGOBE.types.MatchAttribute[] = [];
        const playerInfo: MGOBE.types.MatchPlayerInfoPara = {
            name: "未知用户",
            customPlayerStatus: 0,
            customProfile: "",
            matchAttributes,
        };
        if(manager.userInfo.info){
            playerInfo.name = manager.userInfo.info.nickName;
            playerInfo.customProfile = manager.userInfo.info.avatarUrl;
        }
        let createRoomPara = {
            roomName:"FriendRoom",
            maxPlayers:2,
            roomType:"1v1",
            isPrivate:false,
            customProperties:'WAIT',
            playerInfo,
            teamNumber:2,
        }
        global.room.initRoom();
        global.room.createRoom(createRoomPara, event => {
            if(event.code === 0){
                console.log("create success",event);
                const roomId = event.data.roomInfo.id;
                this.invitaInfo = `roomId=${roomId}&hostId=${global.room.roomInfo.owner}&type=1`;
                share({
                    title:'敢与我一战否？',
                    query:this.invitaInfo,
                })
            }
        });
        global.room.onJoinRoom = (event)=>{
            if(event.data.joinPlayerId == global.room.roomInfo.owner){
                console.log("自己进入房间");
                return ;
            }
            console.log("有人进入了房间");
            this.setHeadIcon();
            //this.toGameRoom();
        }
        global.room.onRecvFromGameSvr = event =>{
            let data:any = event.data.data;
            let msg:any = null;
            if((data) && (data.actionData)){
                msg = data.actionData.msg;
            }
            if(msg == null){
                return;
            }
            console.log("广播信息1：" , msg);
            manager.getInstance().getMgobeSDK().receiveMessageCallBack(msg);
        }
        cc.game.on(cc.game.EVENT_SHOW,()=>{
            this.showFriendView();
        });
    }
    private showFriendView(){
        manager.getInstance().getMatchingScene().matchOnline.active = false;
        manager.getInstance().getMatchingScene().friendBittle.active = true;
        cc.game.off(cc.game.EVENT_SHOW,this.showFriendView);
    }
    //受邀请进入此页面
    public joinFriendRoom(){
        console.log("进入组队页面");
        this.matchOnline.active = false;
        this.friendBittle.active = true;
        this.inviteBegin.active = false;
        this.inviteAgain.active = false;
        this.inviteleave.active = true;
        this.setHeadIcon();
        let info = new gameMsg();
        info.type = 7;
        manager.getInstance().getMgobeSDK().sendToGameInfo(info);
    }
    

    public toGameRoom(){
        manager.getInstance().getHomeScene().removeMatching();
        manager.getInstance().getHomeScene().addGameScene();
    }
}

