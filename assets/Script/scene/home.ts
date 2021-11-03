import configs from "../config";
import * as Util from "../util";
import global from "../global";
import { manager } from "./manager";
import { WXAuth } from "./wxSDK";

const { ccclass, property } = cc._decorator;
@ccclass
export default class home extends cc.Component {
    private main: cc.Node = null;
    private matchingBtn: cc.Node = null;
    private AIBtn: cc.Node = null;
    private rankingListBtn: cc.Node = null;
    private introduceBtn: cc.Node = null;
    private shade: cc.Node = null;

    @property({ type: cc.Prefab, displayName: "matchingScene", visible: true })
    private matchingPrefab: cc.Prefab = null;
    @property({ type: cc.Prefab, displayName: "gameScene", visible: true })
    private gamePrefab: cc.Prefab = null;
    @property({ type: cc.Prefab, displayName: "AIScene", visible: true })
    private AIPrefab: cc.Prefab = null;
    @property({ type: cc.Prefab, displayName: "rankingScene", visible: true })
    private rankingPrefab: cc.Prefab = null;
    @property({ type: cc.Prefab, displayName: "introduceScene", visible: true })
    private introducePrefab: cc.Prefab = null;

    private matchingScene: cc.Node = null;
    private gameScene: cc.Node = null;
    private introduceScene: cc.Node = null;
    public isRoomOwner:boolean = true;  //是否为房主，受邀请进入的玩家则不是房主

    start() {
        if (!manager.gameId) {
            manager.gameId = configs.gameId;
            manager.secretKey = configs.secretKey;
            manager.url = configs.url;
            manager.matchCode = configs.matchCode;
        }
        manager.getInstance().setHomeScene(this);
        this.init();
    }
    private init(){
        this.initNode();
        this.wxLogin();
        manager.getInstance().initMgobeSDK();
        this.checkToPlay();
    }
    private checkToPlay() {
        let wx = window['wx'];
        const options = wx.getLaunchOptionsSync();
        console.log("分享信息：", options);
        
        if (options.query.roomId) {
            console.log("受到邀请");
            if(manager.userInfo.canTouch == false){
                this.wxLogin();
                console.log("未登录不可进入房间");
                this.scheduleOnce(this.checkToPlay,1);
            }else{
                if (options.query.type == 1) {
                    this.isRoomOwner = false;
                    this.joinFriendPvp(options);
                }else{  //纯分享不是对战邀请
                    this.registerListener();
                }
            }
        }else{  //自己进入
            this.registerListener();
        }
    }
    private joinFriendPvp(options) {
        // 注意：这里没有使用匹配属性，如果匹配规则中有设置匹配属性，这里需要做调整
        const matchAttributes: MGOBE.types.MatchAttribute[] = [];
        const playerInfo: MGOBE.types.MatchPlayerInfoPara = {
            name: "未知用户",
            customPlayerStatus: 0,
            customProfile: "",
            matchAttributes,
        };
        console.log("受邀用户manager.userInfo.info:", manager.userInfo.info);
        if (manager.userInfo.info) {
            playerInfo.name = manager.userInfo.info.nickName;
            playerInfo.customProfile = manager.userInfo.info.avatarUrl;
        }
        const joinRoomPara = {
            playerInfo,
        }
        console.log("roomID:",options.query.roomId);
        global.room.initRoom({ id: options.query.roomId });
        global.room.joinRoom(joinRoomPara, event => {
            if (event.code === 0) {
                console.log("success", event)
            }
            this.addMatching();
            //manager.getInstance().getMatchingScene().joinFriendRoom();
        });
        global.room.onRecvFromGameSvr = event =>{
            let data:any = event.data.data;
            let msg:any = null;
            if((data) && (data.actionData)){
                msg = data.actionData.msg;
            }
            if(msg == null){
                return;
            }
            console.log("广播信息：" , msg);
            manager.getInstance().getMgobeSDK().receiveMessageCallBack(msg);
        }
    }
    onDisable() {
        // 场景销毁时一定要清理回调，避免引用UI时报错
        global.room && (global.room.onUpdate = null);
    }
    private wxLogin(){
        WXAuth();
    }
    //微信登录成功回调
    public wxLoginSuccess(res){
        manager.userInfo.info = res.userInfo;
        manager.userInfo.canTouch = true;
        manager.getInstance().getHomeScene().shade.active = false;
    }
    
    private initNode() {
        this.main = this.node.getChildByName("gameLayer");
        this.matchingBtn = this.main.getChildByName("gameStart");
        this.AIBtn = this.main.getChildByName("AI");
        this.rankingListBtn = this.main.getChildByName("rankingList");
        this.introduceBtn = this.main.getChildByName("introduce");
        this.shade = this.main.getChildByName("shade");
    }
    private registerListener() {
        this.shade.on(cc.Node.EventType.TOUCH_START, () => {
            if (manager.userInfo.canTouch == false) {
                console.log("用户点击后获取权限");
                this.wxLogin();
            } else {
                this.shade.active = false;
            }
        }, this);
        if (manager.userInfo.canTouch == true) {
            this.shade.active = false;
        }
        this.matchingBtn.on(cc.Node.EventType.TOUCH_START, this.addMatching, this);
        this.introduceBtn.on(cc.Node.EventType.TOUCH_START, this.addIntroduce, this);
    }
    public addIntroduce() {
        this.hideScene();
        this.introduceScene = cc.instantiate(this.introducePrefab);
        cc.director.getScene().addChild(this.introduceScene);
    }
    public removeIntroduce() {
        if (this.introduceScene != null) {
            cc.director.getScene().removeChild(this.introduceScene);
            this.introduceScene.destroy();
            this.introduceScene = null;
        }
    }
    public hideScene() {
        this.matchingBtn.active = false;
        this.AIBtn.active = false;
        this.rankingListBtn.active = false;
        this.introduceBtn.active = false;
    }
    public showScene() {
        this.matchingBtn.active = true;
        this.AIBtn.active = true;
        this.rankingListBtn.active = true;
        this.introduceBtn.active = true;
    }
    public addMatching() {
        if (manager.userInfo.canTouch == false) {
            return;
        }
        this.hideScene();
        this.matchingScene = cc.instantiate(this.matchingPrefab);
        cc.director.getScene().addChild(this.matchingScene);
    }
    public removeMatching() {
        if (this.matchingScene != null) {
            cc.director.getScene().removeChild(this.matchingScene);
            this.matchingScene.destroy();
            this.matchingScene = null;
        }
    }
    public addGameScene() {
        this.gameScene = cc.instantiate(this.gamePrefab);
        cc.director.getScene().addChild(this.gameScene);
    }
    public removeGameScene() {
        if (this.gameScene != null) {
            cc.director.getScene().removeChild(this.gameScene);
            this.gameScene.destroy();
            this.gameScene = null;
        }
    }
    private toAI() {

    }
    private toRankingList() {

    }
    private itoIntroduce() {

    }
}


