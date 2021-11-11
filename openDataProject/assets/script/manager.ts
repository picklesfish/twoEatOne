import main from "./main"
export class manager{
    private static instance:manager = null;
    //构造函数私有，这样该类就不会被初始化了
    private manager(){}

    public static getInstance(){
        if (this.instance == null) {
            this.instance = new manager();
            console.log("初始化：" + this.instance.gameNum)
        }
        return this.instance;
    }

    public homeInfo:cc.Node = null;
    public matchInfo:cc.Node = null;
    public rankingList:cc.Node = null;
    public content:cc.Node = null;

    public rankItem:cc.Prefab = null;
    
    public currentType:number = 2;     //当前场景
    public winRate:number = 0;
    public score:number = 0;
    private gameNum:number = 0;
    public winNum:number = 0;

    public initListenere(){
        wx.onMessage(res => {
            console.log("接受到主域消息",res);
            if(manager.getInstance().currentType == res.type){
                console.log("重复信息");
                return ;
            }
            if((res.type == undefined) || (res.type == null)){
                console.log("空");
                return ;
            }
            switch(res.type){
                case 1:     //排行榜
                    manager.getInstance().currentType = 1;  
                    manager.getInstance().showRankingList();
                    break;
                case 2:     //首页
                    manager.getInstance().currentType = 2;
                    manager.getInstance().showHomeInfo();
                    break;
                case 3:     //在线匹配
                    manager.getInstance().currentType = 3;
                    manager.getInstance().showMatchInfo();
                    break;
                case 4:     //好友对战
                    manager.getInstance().currentType = 4;
                    manager.getInstance().showMatchInfo();
                    break;
                case 5:     //分数上传
                    manager.getInstance().currentType = 5;
                    manager.getInstance().uploadScore(res.data);
                    break;
                default:
                    console.log("未知类型");
                    break;
            }
        });
    }

    public getUserInfo(){
        wx.getUserCloudStorage({
            keyList:['score'],
            success:(res)=>{
                if(res.KVDataList[0].winRate){
                    manager.getInstance().winRate = res.KVDataList[0].winRate;
                }else{
                    console.log("无数据，初始为0");
                }
                if(res.KVDataList[0].score){
                    manager.getInstance().score = res.KVDataList[0].score;
                }
                if(res.KVDataList[0].gameNum){
                    manager.getInstance().gameNum = res.KVDataList[0].gameNum;
                }
            },
            fail:(res)=>{
                console.log('获取fail');
            }
        });
    }

    /***首页数据***/
    private showHomeInfo(){
        console.log("回首页");
        //manager.getInstance().content.removeAllChildren();
        manager.getInstance().homeInfo.active = true;
        manager.getInstance().rankingList.active = false;
        manager.getInstance().matchInfo.active = false;
        
        let infoNode = manager.getInstance().homeInfo.getChildByName("info");
        infoNode.getChildByName("winRate").getComponent(cc.Label).string = manager.getInstance().winRate.toString() + "%";
        infoNode.getChildByName("score").getComponent(cc.Label).string = manager.getInstance().score.toString();
        infoNode.getChildByName("gameNum").getComponent(cc.Label).string = manager.getInstance().gameNum.toString();
    }
    /***匹配数据***/
    private showMatchInfo(){
        manager.getInstance().matchInfo.active = true;
        manager.getInstance().homeInfo.active = false;
        manager.getInstance().rankingList.active = false;

        let infoNode = manager.getInstance().matchInfo.getChildByName("player1").getChildByName("info");
        infoNode.getChildByName("winRate").getComponent(cc.Label).string = manager.getInstance().winRate.toString() + "%";
        infoNode.getChildByName("score").getComponent(cc.Label).string = manager.getInstance().score.toString();
        infoNode.getChildByName("gameNum").getComponent(cc.Label).string = manager.getInstance().gameNum.toString();
    }

    /***排行榜***/
    private showRankingList(){
        manager.getInstance().rankingList.active = true;
        manager.getInstance().homeInfo.active = false;
        manager.getInstance().matchInfo.active = false;
        manager.getInstance().getFriendData();
        manager.getInstance().showView();
    }
    private getFriendData(){
        wx.getFriendCloudStorage({
            keyList:['score'],
            success:function(res){
                console.log('获取success',res);
                //manager.getInstance().handleData(res);
            },
            fail:function(res){
                console.log('获取fail');
            }
        })
    }
    public handleData(res){
        let data = res.data;
        for(let i = 0; i < data.length; i++){
            // data[i].KVDataList[0]  // key-value
            // data[i].nickName
            // data[i].openid
            // data[i].avatarUrl
        }
    }
    private showView(){
        for(let i = 0; i < 15; i++){
            let item = cc.instantiate(manager.getInstance().rankItem);
            manager.getInstance().content.addChild(item);
        }
    }
    /***分数上传***/
    private uploadScore(data:any){
        if((typeof(wx) == undefined) || (typeof(wx) == null)){
            console.log("wx无效");
            return ;
        }
        manager.getInstance().gameNum = manager.getInstance().gameNum + 1;
        if(data == 1){
            manager.getInstance().winNum = manager.getInstance().winNum + 1;
            manager.getInstance().score = manager.getInstance().score + 3
        }else{
            manager.getInstance().score = manager.getInstance().score - 1;
        }
        manager.getInstance().winRate = Math.round((manager.getInstance().winNum/manager.getInstance().gameNum)*100);

        let gameScoreData = {
            winRate:manager.getInstance().winRate.toString(),
            score:manager.getInstance().score.toString(),
            winNum:manager.getInstance().winNum.toString(),
            gameNum:manager.getInstance().gameNum.toString(),
        }
        let userKVData = {
            key:"score",
            value:JSON.stringify(gameScoreData),
        }
        wx.setUserCloudStorage({
            KVDataList:[userKVData],
            success:(res) =>{
                console.log("upload success",res);
            },
            fail:function(res){
                console.log("upload fail",res);
            },
        });
        manager.getInstance().showHomeInfo();
    }
}