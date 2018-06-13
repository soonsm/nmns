const util = require('./db');
const moment = require('moment');
const sha256 = require('js-sha256');

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
                resolve(null);
            } else {
                console.log("Added item:", JSON.stringify(param.Item));
                resolve(param.Item);
            }
        });
    }));
}
function newWebUser(user){
    return {
        email: user.email,
        password: user.password,
        numOfWrongPassword: 0,
        bizBeginTime: user.bizBeginTime || '0900',
        bizEndTime: user.bizEndTime || '2300',
        accountStatus: 0, //0 - 정상, 1 - 비밀번호 오류 초과로 인한 lock
        signUpDate: moment().format('YYYYMMDD'),
        shopName: user.shopName || null ,
        shopType: user.shopType || null,
        staffList: [],
        alrimTalkInfo : {
            useYn: 'N',
            callbackPhone: '',
            cancelDue: '3시간',
            notice: '예약시간을 지켜주세요.'
        },
        noShowList: [],
        visitLog: [],
        reservationList: [],
        memberList: [],
        reservationConfirmAlrimTalkList: [],
        cancelAlrimTalkList: []
    };
}

function newStaff(staff){
    return {
        name: staff.name,
        color: staff.color || 'blue' //TODO: Default color 값 확인
    };
}

function newNoShow(key, noShowCase){
    let newNoShow = {
        key: key,
        numOfNoShow: 1,
        lastNoShowDate: moment.format('YYYYMMDD'),
        noShowCaseList: []
    };

    if(noShowCase){
        newNoShow.noShowCaseList.push(noShowCase);
    }
    return newNoShow;
}

function newReservation(reservation){
    return {
        staffName: reservation.staffName || null,
        reservationDate: reservation.reservationDate,
        reservationTime: reservation.reservationTime,
        elapsedTime: reservation.elapsedTime,
        phone: reservation.phone,
        name: reservation.name,
        program: reservation.program,
        memo: reservation.memo,
        isCanceled: false,
        cancelDate: null
    };
}


exports.signUp = async function(newUser){

    if(!newUser || !newUser.email || !newUser.password){
        //TODO: logging
        return false;
    }

    let newWebUser = newWebUser(newUser);

    return await put({
        TableName: 'WebSecheduler',
        Item: newWebUser
    });
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