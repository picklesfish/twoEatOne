import { manager } from "./manager";
import { uploadScore } from "./wxSDK";

const {ccclass, property} = cc._decorator;
@ccclass
class gameOver extends cc.Component {
    private main:cc.Node = null;
    private win:cc.Node = null;
    private fail:cc.Node = null;
    private again:cc.Node = null;
    private home:cc.Node = null;

    onEnable(){
        this.initNode();
        this.again.on(cc.Node.EventType.TOUCH_START,()=>{
            let game = manager.getInstance().getGameScene();
            if(game != null){
                game.gameAgain();
            }
            this.node.destroy();
        },this);
        this.home.on(cc.Node.EventType.TOUCH_START,()=>{
            let game = manager.getInstance().getGameScene();
            if(game != null){
                game.goHome();
            }
            this.node.destroy();
        },this);
    }
    private initNode(){
        this.main = this.node.getChildByName("gameLayer");
        this.win = this.main.getChildByName("win");
        this.fail = this.main.getChildByName("fail");
        this.again = this.main.getChildByName("again");
        this.home = this.main.getChildByName("home");
    }
    public youWin(){
        this.win.active = true;
        this.fail.active = false;
        uploadScore(1);
    }
    public youFail(){
        this.win.active = false;
        this.fail.active = true;
        uploadScore(-1);
    }
}