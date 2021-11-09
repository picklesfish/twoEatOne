import * as Util from "../util";
import global from "../global";
import {manager} from "./manager";
import {gameMsg} from "./commonData";

export class mgobeSDK{
    public init(){
        this.initSDK();
        this.initSDKListener();
    }

    private initSDK() {
        if (Util.isInited()) {
            return Util.appendLog("SDK 已经初始化，无需重复操作");
        }

        if (!manager.gameId || !manager.secretKey || !manager.url) {
            return Util.appendLog("请在首页填入正确的 gameId、secretKey、url");
        }

        console.log("正在初始化 SDK");

        if (cc.sys.isNative && !manager.cacertNativeUrl) {
            // CA 根证书（Cocos Native 环境下 wss 需要此参数）
            return cc.loader.loadRes("/cacert", cc.Asset, (err, asset: cc.Asset) => {

                Util.appendLog("加载证书结束 " + (!err));
                console.log("加载证书结束 " + (!err));
                if (err) {
                    return;
                }
                manager.cacertNativeUrl = asset.nativeUrl;
                this.initSDK();
            });
        }
        console.log("初始化SDK");
        Util.initSDK(manager.gameId, manager.secretKey, manager.url, manager.cacertNativeUrl, event => {
            if (event.code === MGOBE.ErrCode.EC_OK) {
                console.log("初始化 SDK 成功");
            } else {
                console.log(`初始化 SDK 失败，错误码：${event.code}`);
            }
        });
    }
    private initSDKListener(){
        console.log("初始化实时服务器监听回调",global.room);
        // 广播回调
        Util.setBroadcastCallbacks(global.room, this, this as any);

        global.room.onRecvFromGameSvr = event =>{
            let data:any = event.data.data;
            let msg:any = null;
            if((data) && (data.actionData)){
                msg = data.actionData.msg;
            }
            if(msg == null){
                return;
            }
            console.log("广播信息：" , msg);
            switch(msg.type){
                case 0:
                    manager.getInstance().getGameScene().updateView(msg);
                    break;
                case 1:
                    manager.getInstance().getMatchingScene().toGameRoom();
                    break;
                case 2:
                    break;
                case 3:
                    break;
                case 4:
                    break;
                default:
                    console.log("无用信息");
                    break;
            }
        }
        global.room.onDismissRoom = event =>{
            console.log(`广播：房间解散`);
            // if(this.node){
            //     manager.getInstance().getHomeScene().removeGameScene();
            // }
        }
        global.room.onLeaveRoom = event =>{
            console.log(`广播：玩家退房`);
            manager.getInstance().getGameScene().playerLeave();
        }
    }
    public receiveMessageCallBack(msg){
        switch(msg.type){
            case 0:
                manager.getInstance().getGameScene().updateView(msg);
                break;
            case 1:
                manager.getInstance().getMatchingScene().toGameRoom();
                break;
            case 2:
                break;
            case 3:
                break;
            case 4:
                break;
            default:
                console.log("无用信息");
                break;
        }    
    }
    public sendToGameInfo(msg:gameMsg){
        const sendToGameSvrPara: MGOBE.types.SendToGameSvrPara = {
            data: {
                msg,
            },
        };
        global.room.sendToGameSvr(sendToGameSvrPara, event => {
            if (event.code === MGOBE.ErrCode.EC_OK) {
                console.log(`发送实时服务器消息成功`,sendToGameSvrPara);
            } else {
                console.log(`发送实时服务器消息失败，错误码：${event.code}`);
            }
        });
    }
    // SDK 解散房间
    public dismissRoom() {
        console.log(`正在解散房间`);
        global.room.dismissRoom({}, event => {
            if (event.code === MGOBE.ErrCode.EC_OK) {
                Util.appendLog(`解散房间成功`);
            } else {
                Util.appendLog(`解散房间失败，错误码：${event.code}`);
            }
        });
    }
    // SDK 退出房间
    public leaveRoom() {
        console.log(`正在退出房间`);
        global.room.leaveRoom({}, event => {
            if (event.code === MGOBE.ErrCode.EC_OK) {
                Util.appendLog(`退出房间成功`);
            } else {
                Util.appendLog(`退出房间失败，错误码：${event.code}`);
            }
        });
    }
    // SDK 修改房间自定义信息
    public changeCustomProperties(customProperties: any) {
        Util.appendLog(`正在修改房间自定义信息为：${customProperties}`);

        global.room.changeRoom({ customProperties }, event => {
            if (event.code === MGOBE.ErrCode.EC_OK) {
                Util.appendLog(`修改房间自定义信息成功`);
            } else {
                Util.appendLog(`修改房间自定义信息失败，错误码：${event.code}`);
            }
        });
    }
}

