import { manager } from "./manager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class introduce extends cc.Component {
    private main:cc.Node = null;
    private goHome:cc.Node = null;
    private back:cc.Node = null;
    private next:cc.Node = null;
    private stepListNode:cc.Node = null;
    private stepList:Array<cc.Node> = [];
    
    private currentStepIndex:number = 0;
    private canTouch:boolean = true;
    private CHESS_OLD_POSITION:Array<cc.Vec2> = [
        cc.v2(62.5,-62.5),cc.v2(62.5,62.5),cc.v2(-187.5,-187.5)
    ];
    private CHESS_NEW_POSITION:Array<cc.Vec2> = [
        cc.v2(-62.5,-62.5),cc.v2(-62.5,62.5),cc.v2(-62.5,-187.5)
    ];

    onEnable(){
        this.initNode();
        this.registerListener();
        this.scheduleOnce(this.showIntroduce,1);
    }

    private initNode(){
        this.main = this.node.getChildByName("gameLayer");
        this.goHome = this.main.getChildByName("goHome");
        this.back = this.main.getChildByName("back");
        this.next = this.main.getChildByName("next");
        this.stepListNode = this.main.getChildByName("stepList");
        this.stepList = this.stepListNode.children;
    }
    private registerListener(){
        this.goHome.on(cc.Node.EventType.TOUCH_START,()=>{
            this.unscheduleAllCallbacks();
            manager.getInstance().getHomeScene().removeIntroduce();
            manager.getInstance().getHomeScene().showScene();
        });
        this.back.on(cc.Node.EventType.TOUCH_START,()=>{
            this.unscheduleAllCallbacks();
            if(this.canTouch == false){
                return ;
            }
            this.canTouch = false;
            this.next.active = true;
            this.currentStepIndex --;
            cc.tween(this.stepListNode)
                .to(0.2,{x:this.stepListNode.x + 650})
                .call(()=>{
                    this.canTouch = true;
                })
                .start();
            this.showIntroduce();
            if(this.currentStepIndex == 0){
                this.back.active = false;
            }
        });
        this.next.on(cc.Node.EventType.TOUCH_START,()=>{
            this.unscheduleAllCallbacks();
            if(this.canTouch == false){
                return ;
            }
            this.back.active = true;
            this.canTouch = false;
            this.currentStepIndex ++;
            cc.tween(this.stepListNode)
                .to(0.2,{x:this.stepListNode.x - 650})
                .call(()=>{
                    this.canTouch = true;
                })
                .start();
            this.showIntroduce();
            if(this.currentStepIndex == 3){
                this.next.active = false;
            }
        });
    }

    private showIntroduce(){
        if(this.currentStepIndex > 2){
            return ;
        }
        let board = this.stepList[this.currentStepIndex].getChildByName("board");
        let chess = board.getChildByName("chess");
        chess.x = this.CHESS_OLD_POSITION[this.currentStepIndex].x;
        chess.y = this.CHESS_OLD_POSITION[this.currentStepIndex].y;
        let enemy:cc.Node = null;
        if(this.currentStepIndex == 0){
            enemy = board.getChildByName("enemy");
            enemy.active = true;
        }
        this.scheduleOnce(()=>{
            cc.tween(chess)
            .to(0.3,{x:this.CHESS_NEW_POSITION[this.currentStepIndex].x, y:this.CHESS_NEW_POSITION[this.currentStepIndex].y})
            .call(()=>{
                if(enemy != null){
                    enemy.active = false;
                }
            })
            .start();
        },0.7);
    }
}
