/**
 * 随机产生 openId
 */
const mockOpenId = (): string => {
    let str = Date.now().toString(36);

    for (let i = 0; i < 7; i++) {
        str += Math.ceil(Math.random() * (10 ** 4)).toString(36);
    }

    return str;
};

export default {
    // MGOBE 游戏信息
    gameId: "obg-1ffbgo7t",
    secretKey: "43f8b0b4c4fbb5f236c5fe621ecd904b97ce8491",
    url: "1ffbgo7t.wxlagame.com",
    // 玩家 ID，建议使用真实的 openId
    openId: mockOpenId(),
    // 默认匹配 Code
    matchCode: "match-jrxkjpvi",
};