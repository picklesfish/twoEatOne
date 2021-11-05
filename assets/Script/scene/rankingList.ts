import { manager } from "./manager";
const {ccclass, property} = cc._decorator;

@ccclass
export default class rankingList extends cc.Component {
    private main:cc.Node = null;
    private back:cc.Node = null;

    onEnable(){
        this.main = this.node.getChildByName("gameLayer");
        this.back = this.main.getChildByName("back");
        this.back.on(cc.Node.EventType.TOUCH_START,this.goHome,this);
    }
    private goHome(){
        this.back.off(cc.Node.EventType.TOUCH_START,this.goHome,this);
        manager.getInstance().getHomeScene().removeRankingList();
    }

    //向子域发送消息
    
    
}
