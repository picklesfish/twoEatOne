import { manager } from "./manager";
import { WXAuth } from "./wxSDK";
const {ccclass, property} = cc._decorator;

@ccclass
export default class rankingList extends cc.Component {
    private main:cc.Node = null;
    private back:cc.Node = null;

    onEnable(){
        console.log("ranking初始化节点");
        this.main = this.node.getChildByName("gameLayer");
        this.back = this.main.getChildByName("back");
        this.back.on(cc.Node.EventType.TOUCH_START,this.goHome,this);
        this.sentMessage();
    }
    private goHome(){
        this.back.off(cc.Node.EventType.TOUCH_START,this.goHome,this);
        manager.getInstance().getHomeScene().removeRankingList();
        manager.getInstance().getHomeScene().showScene();
    }

    //向子域发送消息
    private sendToSubfield(){
        let openDataContext = wx.getOpenDataContext();
        openDataContext.postMessage({
            text:'hello zhm',
            year:(new Date()).getFullYear();
        })
    }

    private sentMessage(){
        //let wx = window['wx'];
        if((typeof(wx) == undefined) || (typeof(wx) == null)){
            console.log("wx无效");
            return ;
        }
        let gameScoreData = {
            wxgame:{
                gameNum:63,
                update_time:new Date().getTime(),
            },
            cost_ms:36500
        }
        let userKVData = {
            key:"score",
            value:JSON.stringify(gameScoreData),
        }
        wx.setUserCloudStorage({
            KVDataList:[userKVData],
            success:function(res){
                console.log("success123",res);
            },
            fail:function(res){
                console.log("fail123",res);
            },
        });
        wx.getOpenDataContext().postMessage({
            keyName:"num",
            shareTicket:null,
            keyWin:'winRate',
        });
    }
    
}
