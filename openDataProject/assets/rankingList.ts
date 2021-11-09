const {ccclass, property} = cc._decorator;

@ccclass
class rankingList extends cc.Component {
    @property({type:cc.Node,name:'content',visible:true})
    private content:cc.Node = null;
    @property({type:cc.Prefab,name:'rankItem',visible:true})
    private rankItem:cc.Prefab = null;
    onEnable(){
        //this.initUserInfo();
        // engine.userCrossContextDataBus.addReceiver('test',(dataList:{data:number}[]) => {
        //     console.log(dataList);
        // })
        wx.onMessage(res => {
            console.log("接受到消息",res);
        });
        this.getFriendData();
        this.showView();
        //this.sendMessage();
    }

    onDestroy(){
        //cc.game.renderType
    }

    private showView(){
        for(let i = 0; i < 15; i++){
            let item = cc.instantiate(this.rankItem);
            this.content.addChild(item);
        }
    }

    private sendMessage(){
        // const context = wx.getOpenDataContext();
        // console.log("openData:",context);
    }
    
    private getFriendData(){
        console.log("获取数据");
        wx.getFriendCloudStorage({
            keyList:['score'],
            success:function(res){
                console.log('获取success',res);
            },
            fail:function(res){
                console.log('获取fail');
            },
            complete:function(res){
                console.log("请求发生完成");
            }
        })
    }

    // initUserInfo(){
    //     if(typeof(wx) === undefined){
    //         return ;
    //     }
    //     let sysinfo = wx.getSystemInfoSync();
    //     let width = sysinfo.screenWidth;
    //     let height = sysinfo.screenHeight;
    //     wx.getSetting({
    //         success(res) {
    //             console.log(res.authSetting);
    //             if (res.authSetting["scope.userInfo"]) {
    //                 console.log("用户已授权1");
    //                 wx.getUserInfo({
    //                     success(res) {
    //                         console.log("用户信息获取成功");
    //                         console.log(res);
    //                     },
    //                     fail(res) {
    //                         console.log("用户信息获取失败", res);
    //                     }
    //                 })
    //             } else {
    //                 console.log("用户未授权");
    //                 let button = wx.createUserInfoButton({
    //                     type: 'text',
    //                     text: "",
    //                     style: {
    //                         left: 0,
    //                         top: 0,
    //                         width: width,
    //                         height: height,
    //                         backgroundColor: '#00000000',
    //                         color: '#ffffff',
    //                         fontSize: 20,
    //                         textAlign: "center",
    //                         lineHeight: height,
    //                     }
    //                 });
    //                 button.onTap((res) => {
    //                     if (res.userInfo) {
    //                         console.log("用户授权");
    //                         button.destroy();
    //                     } else {
    //                         console.log("用户拒绝授权");
    //                     }
    //                 })
    //             }
    //         }
    //     });
    // }
}
