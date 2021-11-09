import { WXInviteInfo } from "./commonData";
import {manager} from "./manager";
interface ShareParams {
    type?: string;
    title?: string;
    imageUrl?: string;
    query?: any;
};

export function share(params:ShareParams){
    let wx = window['wx'];
    wx.shareAppMessage(params);
}
//微信登录授权
export function WXAuth() {
    let wx = window['wx'];
    let sysinfo = wx.getSystemInfoSync();
    let width = sysinfo.screenWidth;
    let height = sysinfo.screenHeight;
    wx.getSetting({
        success(res) {
            console.log(res.authSetting);
            if (res.authSetting["scope.userInfo"]) {
                console.log("用户已授权1");
                wx.getUserInfo({
                    success(res) {
                        console.log("用户信息获取成功");
                        console.log(res);
                        manager.getInstance().getHomeScene().wxLoginSuccess(res);
                    },
                    fail(res) {
                        console.log("用户信息获取失败", res);
                    }
                })
            } else {
                console.log("用户未授权");
                let button = wx.createUserInfoButton({
                    type: 'text',
                    text: "",
                    style: {
                        left: 0,
                        top: 0,
                        width: width,
                        height: height,
                        backgroundColor: '#00000000',
                        color: '#ffffff',
                        fontSize: 20,
                        textAlign: "center",
                        lineHeight: height,
                    }
                });
                button.onTap((res) => {
                    if (res.userInfo) {
                        console.log("用户授权");
                        button.destroy();
                        manager.getInstance().getHomeScene().wxLoginSuccess(res);
                    } else {
                        console.log("用户拒绝授权");
                    }
                })
            }
        }
    });
}