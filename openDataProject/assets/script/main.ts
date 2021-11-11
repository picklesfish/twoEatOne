import { manager } from "./manager";

const {ccclass, property} = cc._decorator;
@ccclass
export default class main extends cc.Component {
    private homeInfo:cc.Node = null;
    private matchInfo:cc.Node = null;
    private rankingList:cc.Node = null;
    private content:cc.Node = null;

    @property({type:cc.Prefab,displayName:"rankItem",visible:true})
    private rankItem:cc.Prefab = null;
    
    start(){
        this.initNode();
        manager.getInstance().initListenere();
        manager.getInstance().getUserInfo();
        console.log("开放域初始化");
    }
    onload(){
        console.log("开放域初始化加载");
    }
    private initNode(){
        manager.getInstance().homeInfo = this.node.getChildByName("homeInfo");
        manager.getInstance().matchInfo = this.node.getChildByName("matchInfo");
        manager.getInstance().rankingList = this.node.getChildByName("rankingList");
        manager.getInstance().content = this.node.getChildByName("rankingList").getChildByName("rankScrollView").getChildByName("view").getChildByName("content");
        
        manager.getInstance().rankItem = this.rankItem;
    }
}
