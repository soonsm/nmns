const util = require('./util');
const sha256 = require('js-sha256');
const moment = require('moment');
const userStatus = require('./userStatus');

var AWS = require("aws-sdk");
AWS.config.update({
    region: "ap-northeast-2"
});

var docClient = new AWS.DynamoDB.DocumentClient();

function get(param) {
    return new Promise((resolve) => {
        docClient.get(param, (err, data) => {
            if (!err) {
                console.log("GetItem succeeded:", JSON.stringify(data.Item, null, 2));
                resolve(data.Item);
            } else {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                resolve();
            }
        });
    });
}

function getList(param) {
    return new Promise((resolve) => {
        docClient.scan(param, (err, data) => {
            if (!err) {
                console.log("Scan succeeded");
                resolve(data.Items);
            } else {
                console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
                resolve();
            }
        });
    });
}

function put(param) {
    return new Promise((resolve => {
        docClient.put(param, function (err, data) {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2), " param: ", param);
                resolve(false);
            } else {
                console.log("Added item:", JSON.stringify(param.Item));
                resolve(true);
            }
        });
    }));
}

function update(param){
    return new Promise((resolve => {
        docClient.update(param, function (err, data) {
            if (err) {
                console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2), " param: ", param);
                resolve(false);
            } else {
                console.log("Updated item:", JSON.stringify(param.Item));
                resolve(true);
            }
        })
    }));
}

function del(param) {
    return new Promise((resolve => {
        docClient.delete(param, function (err, data) {
            if (err) {
                console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2), " param: ", param);
                resolve(false);
            } else {
                console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
                resolve(true);
            }
        });
    }));
}

function newUser(userKey){
    return {
        userKey: userKey,
        isFriend: 0,
        userStatus: 0,
        lastVisitDate: util.getToday(),
        registerCount: 0,
        registerTryCount: 0,
        searchCount: 0,
        searchTryCount: 0,
        sendConfirmTryCount: 0,
        sendConfirmCount: 0,
        sendCancelCount: 0,
        hasRightToSendConfirm: 0,
        messageWithConfirm: undefined,
        userPhone: undefined,
        shopName: undefined,
        cancelDue: 0,
        onGoingAlrimTalkKey: undefined
    };
}

function newAlrimTalk(reservationKey, userKey, phone, date, time){
    return {
        reservationKey: reservationKey,
        userKey: userKey,
        registerDate: moment().format('YYYYMMDD'),
        receiverPhone: phone,
        reservationDate: date,
        reservationTime: time,
        isConfirmed: false,
        isSent: false,
        isCanceled: false
    }
}

function newNoShow(key){
    return {
        noShowKey: key,
        lastNoShowDate: util.getToday(),
        noShowCount: 0
    };
}

exports.getUser = async function(userKey){
  return await get({
     TableName: 'KaKaoUserList',
     Key: {
         'userKey': userKey
     }
  });
};

exports.getAlrimTalkUserList = async function(){
    return await getList({
        TableName: 'AlrimTalkUser'
    });
};

exports.getNoShow = async function(phoneNumber){
    let key = sha256(phoneNumber);
    return await get({
        TableName: 'NoShowList',
        Key: {
            'noShowKey': key
        }
    });
};

exports.getAlrimTalk = async function(reservationKey){
    return await get({
        TableName: 'AlrimTalk',
        Key: {
            'reservationKey': reservationKey
        }
    });
};

exports.addToNoShowList = async function(phoneNumber){
    let key = sha256(phoneNumber);
    let noShow = await exports.getNoShow(phoneNumber);
    if(!noShow){
        noShow = newNoShow(key);
    }
    noShow.noShowCount += 1;
    noShow.lastNoShowDate = util.getToday();
    return await put({
        TableName: 'NoShowList',
        Item: noShow
    });
}

exports.setUserStatus = async function(userKey, userStatus, propertyToIncrement){
    let user = await exports.getUser(userKey);
    if(!user){
        user = newUser(userKey);
    }
    user.userStatus = userStatus;
    user.lastVisitDate = util.getToday();
    if(propertyToIncrement){
        user[propertyToIncrement] = (user[propertyToIncrement]||0) + 1;
    }

    return await put({
        TableName: 'KaKaoUserList',
        Item: user
    });
};

exports.setUserAlrimTalkSend = async function(user){
  if(user){
      user.userStatus = userStatus.beforeSelection;
      let today = util.getToday();
      user.lastVisitDate = today;
      user.sendConfirmCount = (user.sendConfirmCount||0) + 1;
      let log = user['sendConfirmCountDayLog'] || {};
      log[today] = (log[today] ||0) +1;
      user['sendConfirmCountDayLog'] = log;

      return await put({
          TableName: 'KaKaoUserList',
          Item: user
      });
  }
};

exports.saveUser = async function(user){
    return await put({
        TableName: 'KaKaoUserList',
        Item: user
    });
};

exports.deleteFriend = async function(userKey){
    let user = await exports.getUser(userKey);
    if(user){
        user.isFriend = 0;
        put({
            TableName: 'KaKaoUserList',
            Item: user
        });
    }
};

exports.addFriend = async function(userKey){
    let user = await exports.getUser(userKey);
    if(!user){
        user = newUser(userKey);
    }
    user.isFriend = 1;
    put({
        TableName: 'KaKaoUserList',
        Item: user
    });
};

exports.addAlrimTalk = async function(userKey, phone, date, time){
    let user = await exports.getUser(userKey);
    if(user){
        let reservationKey = moment().format('YYYYMMDDhhmmss.SSS') + userKey + sha256(phone);
        const alrimTalk = newAlrimTalk(reservationKey, userKey, phone, date, time);
        await put({
            TableName: 'AlrimTalk',
            Item: alrimTalk
        });
        user.onGoingAlrimTalkKey = reservationKey;
        put({
            TableName: 'KaKaoUserList',
            Item: user
        });
    }else{
        console.error(`등록되지 않은 사용자가 알림톡 전송을 합니다. ${userKey}`);
    }
};

exports.saveAlrimTalk = async function(alrimTalk){
    await put({
        TableName: 'AlrimTalk',
        Item: alrimTalk
    });
};

exports.cancelReservation = async function(alrimTalk, user){
    if(!user.sendCancelCount){
        user.sendCancelCount = 0;
    }
    user.sendCancelCount += 1;

    let today = util.getToday();
    let log = user['sendCancelCountDayLog'] || {};
    log[today] = (log[today] ||0) +1;
    user['sendCancelCountDayLog'] = log;

    await put({
        TableName: 'KaKaoUserList',
        Item: user
    });

    alrimTalk.isCanceled = true;
    await put({
        TableName: 'AlrimTalk',
        Item: alrimTalk
    });

}