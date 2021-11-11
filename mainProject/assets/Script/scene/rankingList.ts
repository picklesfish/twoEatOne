import { manager } from "./manager";
import { WXAuth } from "./wxSDK";
const {ccclass, property} = cc._decorator;

@ccclass
export default class rankingList extends cc.Component {
    private main:cc.Node = null;
    private back:cc.Node = null;
    private subContextView:cc.Node = null;

    onEnable(){
        console.log("ranking初始化节点");
        this.main = this.node.getChildByName("gameLayer");
        this.back = this.main.getChildByName("back");
        this.subContextView = this.main.getChildByName("SubContext");

        this.back.on(cc.Node.EventType.TOUCH_START,this.goHome,this);
    }
    onDisable(){
    }
    private goHome(){
        this.subContextView.active = false;

        this.back.off(cc.Node.EventType.TOUCH_START,this.goHome,this);
        manager.getInstance().getHomeScene().removeRankingList();
        manager.getInstance().getHomeScene().showScene();
    }
}
