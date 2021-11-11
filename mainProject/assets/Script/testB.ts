// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class testB extends cc.Component {

    private button:cc.Node = null;
    onLoad(){
        console.log("12");
        this.button = this.node.getChildByName("button");
        console.log("2");
        this.button.on(cc.Node.EventType.TOUCH_START,()=>{
            console.log("切换2");
            cc.director.loadScene("testA");
        },this);
    }
}
