import game from "./game";
import home from "./home";
import matching from "./matching";
import { mgobeSDK } from "./mgobeSDK";

class userInfo{
    public info:any;
    public canTouch:boolean = false;    //如果没有获取到信息，则不能进入游戏
}

export class manager{
    private static instance:manager = new manager();
    //构造函数私有，这样该类就不会被初始化了
    private manager(){}

    public static getInstance(){
        return this.instance;
    }

    // 首页游戏ID
    public static gameId: string = "";
    // 首页游戏Key
    public static secretKey: string = "";
    // 首页域名
    public static url: string = "";
    //匹配Code
    public static matchCode:string = "";
    public static cacertNativeUrl = "";
    
    public static userInfo:userInfo = new userInfo();

    private homeScene:home = null;
    private matchingScene:matching = null;
    private gameScene:game = null;
    private mgobeSDK:mgobeSDK = new mgobeSDK();
    public initMgobeSDK(){
        this.mgobeSDK.init();
    }
    public getMgobeSDK(){
        return this.mgobeSDK;
    }


    //首页
    public setHomeScene(home:home){
        this.homeScene = home;
    }
    public getHomeScene(){
        return this.homeScene;
    }
    //匹配页面
    public setMatchingScene(matching:matching){
        this.matchingScene = matching;
    }
    public getMatchingScene(){
        return this.matchingScene;
    }
    //游戏页面
    public setGameScene(game:game){
        this.gameScene = game;
    }
    public getGameScene(){
        return this.gameScene;
    }
    //结束页面
    
    
}