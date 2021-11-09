
'use strict';
const app = require('tcb-admin-node');
const tcb_config = {env: 'test1-4gvbm18a9a10ad1e'};
app.init(tcb_config).auth();
exports.main = async (event, context, callback) => {
  console.log("Hello World");
  console.log(event);
  console.log(event["non-exist"]);
  console.log(context);
  callback(null, event);
};

//初始化
//this.app = cc.cloud && cc.cloud.initialize();
