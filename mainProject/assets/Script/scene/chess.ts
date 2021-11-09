const {ccclass, property} = cc._decorator;

@ccclass
export default class chess extends cc.Component {

    @property({type:cc.Node, displayName:"checked",visible:true})
    private checked:cc.Node = null;

    public main = null;
    public type:number = 1;    //棋子类型，1黑旗-1白棋

    onEnable(){
        this.node.on(cc.Node.EventType.TOUCH_START,()=>{
            if(this.main != null){
                if((this.main.currentPlayerIsSelf) && (this.main.myChess == this.type)){
                    this.main.cleanCheckedState();
                    this.main.setCurrentChess(this.node);
                    this.checked.active = true;
                }
            }
        },this);
    }
}
