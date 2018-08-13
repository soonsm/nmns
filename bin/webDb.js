const util = require('./db');
const moment = require('moment');
const sha256 = require('js-sha256');

var AWS = require("aws-sdk");

if (process.env.NODE_ENV == process.nmns.MODE.PRODUCTION) {
    AWS.config.update({
        region: "ap-northeast-2"
    });
} else if (process.env.NODE_ENV == process.nmns.MODE.DEVELOPMENT) {
    AWS.config.update({
        region: "ap-northeast-2",
        endpoint: "http://localhost:8000"
    });
}

var docClient = new AWS.DynamoDB.DocumentClient({
    convertEmptyValues: true
});

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

function query(params) {
    return new Promise((resolve => {
        docClient.query(params, function (err, data) {
            if (err) {
                console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
                resolve(null);
            } else {
                console.log("Query succeeded. Data:", data);
                resolve(data.Items);
            }
        });
    }));
}

function update(params) {
    return new Promise((resolve => {
        docClient.update(params, function (err, data) {
            if (err) {
                console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                resolve(false);
            } else {
                console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
                resolve(true);
            }
        });
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

exports.newWebUser = function (user) {
    return {
        email: user.email,
        authStatus: user.authStatus || process.nmns.AUTH_STATUS.BEFORE_EMAIL_VERIFICATION, //BEFORE_EMAIL_VERIFICATION(인증전), EMAIL_VERIFICATED(인증됨)
        emailAuthToken: user.emailAuthToken || null,
        password: user.password,
        numOfWrongPassword: 0,
        bizBeginTime: user.bizBeginTime || '0900',
        bizEndTime: user.bizEndTime || '2300',
        accountStatus: 0, //0 - 정상, 1 - 비밀번호 오류 초과로 인한 lock
        signUpDate: moment().format('YYYYMMDD'),
        shopName: user.shopName || null,
        bizType: user.bizType || null,
        staffList: [{
            id: user.email + moment().format('YYYYMMDDHHmmssSSS'),
            name: '기본관리자',
            color: '#ff00ff'
        }],
        alrimTalkInfo: {
            useYn: 'N',
            callbackPhone: null,
            cancelDue: '3시간',
            notice: '예약시간을 지켜주세요.'
        },
        noShowList: [],
        visitLog: [],
        reservationList: [],
        memberList: [],
        reservationConfirmAlrimTalkList: [],
        cancelAlrimTalkList: [],
        pushList: [],
        isFirstVisit: true
    };
};

exports.signUp = async function (newUser) {

    let newWebUser = exports.newWebUser(newUser);

    return await put({
        TableName: process.nmns.TABLE.WebSecheduler,
        Item: newWebUser
    });
};

exports.getWebUser = async function (email) {
    let items = await query({
        TableName: process.nmns.TABLE.WebSecheduler,
        ProjectionExpression: "email, authStatus, emailAuthToken, password, numOfWrongPassword, bizBeginTime, bizEndTime, accountStatus, signUpdate, shopName, bizType, alrimTalkInfo, memberList",
        KeyConditionExpression: "#key = :val",
        ExpressionAttributeNames: {
            "#key": "email"
        },
        ExpressionAttributeValues: {
            ":val": email
        }
    });

    return items[0];
};

exports.updateWebUser = async function (email, properties) {
    let params = {
        TableName: process.nmns.TABLE.WebSecheduler,
        Key: {
            'email': email
        },
        ExpressionAttributeValues: {},
        ReturnValues: "NONE"
    };
    let updateExpression = 'set ';
    let propertyNames = Object.getOwnPropertyNames(properties);
    for (let i = 0; i < propertyNames.length; i++) {
        let property = propertyNames[i];
        updateExpression += `${property} = :${property}`;
        if (i < propertyNames.length - 1) {
            updateExpression += ',';
        }

        params.ExpressionAttributeValues[`:${property}`] = properties[property];
    }
    params.UpdateExpression = updateExpression;

    return await update(params);
};

exports.newReservation = function (reservation) {
    return {
        id: reservation.id,
        type: reservation.type || 'R',
        name: reservation.name || null,
        start: reservation.start,
        end: reservation.end,
        isAllDay: reservation.isAllDay || false,
        contents: reservation.contents || null,
        manager: reservation.manager || null,
        etc: reservation.etc || null,
        contact: reservation.contact,
        status: reservation.status || process.nmns.RESERVATION_STATUS.RESERVED,
        cancelDate: null
    };
}

exports.addNewReservation = async function (email, newReservation) {
    return await update({
        TableName: process.nmns.TABLE.WebSecheduler,
        Key: {
            'email': email,
        },
        UpdateExpression: "set reservationList = list_append(reservationList, :newReservation)",
        ExpressionAttributeValues: {
            ":newReservation": [newReservation]
        },
        ReturnValues: "NONE"
    });
};

exports.updateReservation = async function (email, reservationList) {
    
    return await update({
        TableName: process.nmns.TABLE.WebSecheduler,
        Key: {
            'email': email
        },
        UpdateExpression: "set reservationList = :reservation",
        ExpressionAttributeValues: {
            ":reservation": reservationList
        },
        ReturnValues: "NONE"
    });
}

exports.getReservationSummaryList = async function (email, data) {
    let items = await query({
        TableName: process.nmns.TABLE.WebSecheduler,
        ProjectionExpression: "reservationList",
        KeyConditionExpression: "#key = :val",
        ExpressionAttributeNames: {
            "#key": "email"
        },
        ExpressionAttributeValues: {
            ":val": email
        }
    });

    if (items.length === 0) {
        return [];
    } else {
        let list = items[0].reservationList;
        let filteredList = [];
        for (var i = 0; i < list.length; i++) {
            let reservation = list[i];
            if(reservation.status !== process.nmns.RESERVATION_STATUS.DELETED){
                filteredList.push(reservation);
                if(data.start && reservation.start < data.start){
                    filteredList.length -= 1;
                }else if(data.end && reservation.end > data.end){
                    filteredList.length -= 1;
                }else if(data.contact && reservation.contact !== data.contact){
                    filteredList.length -= 1;
                }else if(data.name && reservation.name !== data.name){
                    filteredList.length -= 1;
                }else if(reservation.type == 'T'){
                    filteredList.length -= 1;
                }
            }
        }
        return filteredList;
    }
}

exports.getReservationList = async function (email, start, end) {
    let items = await query({
        TableName: process.nmns.TABLE.WebSecheduler,
        ProjectionExpression: "reservationList",
        KeyConditionExpression: "#key = :val",
        ExpressionAttributeNames: {
            "#key": "email"
        },
        ExpressionAttributeValues: {
            ":val": email
        }
    });

    if (items.length === 0) {
        return [];
    } else {
        let list = items[0].reservationList;
        if (start && end) {
            let filteredList = [];
            for (var i = 0; i < list.length; i++) {
                let reservation = list[i];
                if (reservation.start >= start && reservation.end <= end) {
                    filteredList.push(reservation);
                }
            }
            return filteredList;
        } else {
            return list;
        }
    }
};

exports.newStaff = function (staff) {
    return {
        id: staff.id,
        name: staff.name,
        color: staff.color || '#ff00ff' //TODO: Default color 값 확인
    };
}
exports.getStaffList = async function (email) {
    let items = await query({
        TableName: process.nmns.TABLE.WebSecheduler,
        ProjectionExpression: "staffList",
        KeyConditionExpression: "#key = :val ",
        ExpressionAttributeNames: {
            "#key": "email"
        },
        ExpressionAttributeValues: {
            ":val": email,
        }
    });
    if (items.length === 0) {
        return [];
    }

    return items[0].staffList;
};
exports.addNewStaff = async function (email, staff) {
    return await update({
        TableName: process.nmns.TABLE.WebSecheduler,
        Key: {
            'email': email,
        },
        UpdateExpression: "set staffList = list_append(staffList, :newStaff)",
        ExpressionAttributeValues: {
            ":newStaff": [staff]
        },
        ReturnValues: "NONE"
    });
};
exports.updateStaffList = async function (email, staffList) {
    return await update({
        TableName: process.nmns.TABLE.WebSecheduler,
        Key: {
            'email': email
        },
        UpdateExpression: "set staffList = :staffList",
        ExpressionAttributeValues: {
            ":staffList": staffList
        },
        ReturnValues: "NONE"
    });
}

exports.newNoShow = function (phone, noShowCase, date) {
    let key = sha256(phone);
    let newNoShow = {
        noShowKey: key,
        noShowCount: 1,
        lastNoShowDate: date || moment().format('YYYYMMDD'),
        noShowCaseList: []
    };

    if (noShowCase) {
        newNoShow.noShowCaseList.push(noShowCase);
    }
    return newNoShow;
}
exports.newMyNoShow = function (id, phone, noShowCase, date) {
    let key = sha256(phone);
    let newNoShow = {
        id: id,
        noShowKey: key,
        noShowCount: 1,
        date: date || moment().format('YYYYMMDD'),
    };

    if (noShowCase) {
        newNoShow.noShowCase = noShowCase;
    }
    return newNoShow;
}
exports.getMyNoShow = async function (email) {
    let items = await query({
        TableName: process.nmns.TABLE.WebSecheduler,
        ProjectionExpression: "noShowList",
        KeyConditionExpression: "#key = :val ",
        ExpressionAttributeNames: {
            "#key": "email"
        },
        ExpressionAttributeValues: {
            ":val": email,
        }
    });
    if (items.length === 0) {
        return [];
    }else{
        return items[0].noShowList;
    }
}
exports.getNoShow = async function (phoneNumber) {
    let key = sha256(phoneNumber);
    return await get({
        TableName: process.nmns.TABLE.NoShowList,
        Key: {
            'noShowKey': key
        }
    });

};

exports.getNoShowWithKey = async function (key) {
    return await get({
        TableName: process.nmns.TABLE.NoShowList,
        Key: {
            'noShowKey': key
        }
    });
};

exports.addToNoShowList = async function (email, phone, noShowCase, date, id) {
    let noShow = await exports.getNoShow(phone);
    let lastNoShowDate = date || moment().format('YYYYMMDD');
    if (!noShow) {
        noShow = exports.newNoShow(phone, noShowCase, lastNoShowDate);
    } else {
        noShow.noShowCount += 1;
        noShow.lastNoShowDate = lastNoShowDate;
        if (noShowCase) {
            noShow.noShowCaseList.push(noShowCase);
        }
    }
    await put({
        TableName: process.nmns.TABLE.NoShowList,
        Item: noShow
    });

    noShow = exports.newMyNoShow(id, phone, noShowCase, lastNoShowDate);

    await update({
        TableName: process.nmns.TABLE.WebSecheduler,
        Key: {
            'email': email,
        },
        UpdateExpression: "set noShowList = list_append(noShowList, :noShow)",
        ExpressionAttributeValues: {
            ":noShow": [noShow]
        },
        ReturnValues: "NONE"
    });

    return noShow;

}
exports.deleteNoShow = async function (email, id) {
    let isItMine = false;
    let delIndex = -1, noShowToDelete;
    let myNoShowList = await exports.getMyNoShow(email);
    for (var i = 0; i < myNoShowList.length; i++) {
        let myNoShow = myNoShowList[i];
        if (myNoShow.id === id) {
            isItMine = true;
            noShowToDelete = myNoShow;
            break;
        }
    }
    if (isItMine) {
        myNoShowList.splice(delIndex, 1);
        //WebScheudler update
        await update({
            TableName: process.nmns.TABLE.WebSecheduler,
            Key: {
                'email': email
            },
            UpdateExpression: "set noShowList = :newNoShowList",
            ExpressionAttributeValues: {
                ":newNoShowList": myNoShowList
            },
            ReturnValues: "NONE"
        });
        //NoShowList update
        let noShow = await exports.getNoShowWithKey(noShowToDelete.noShowKey);
        if (noShow) {
            noShow.noShowCount -= 1;
            if (noShow.noShowCount === 0) {
                await del({
                    TableName: process.nmns.TABLE.NoShowList,
                    Key: {
                        "noShowKey": noShowToDelete.noShowKey
                    }
                });
            } else {
                await put({
                    TableName: process.nmns.TABLE.NoShowList,
                    Item: noShow
                });
            }
        }
        return true;
    } else {
        return false;
    }
}


function newAlrimTalk(reservationKey, userKey, phone, date, time) {
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


exports.getUser = async function (userKey) {
    return await get({
        TableName: 'KaKaoUserList',
        Key: {
            'userKey': userKey
        }
    });
};

exports.getAlrimTalkUserList = async function () {
    return await getList({
        TableName: 'AlrimTalkUser'
    });
};

exports.getAlrimTalk = async function (reservationKey) {
    return await get({
        TableName: 'AlrimTalk',
        Key: {
            'reservationKey': reservationKey
        }
    });
};

exports.setUserStatus = async function (userKey, userStatus, propertyToIncrement) {
    let user = await exports.getUser(userKey);
    if (!user) {
        user = newUser(userKey);
    }
    user.userStatus = userStatus;
    user.lastVisitDate = util.getToday();
    if (propertyToIncrement) {
        user[propertyToIncrement] = (user[propertyToIncrement] || 0) + 1;
    }

    return await put({
        TableName: 'KaKaoUserList',
        Item: user
    });
};

exports.setUserAlrimTalkSend = async function (user) {
    if (user) {
        user.userStatus = userStatus.beforeSelection;
        let today = util.getToday();
        user.lastVisitDate = today;
        user.sendConfirmCount = (user.sendConfirmCount || 0) + 1;
        let log = user['sendConfirmCountDayLog'] || {};
        log[today] = (log[today] || 0) + 1;
        user['sendConfirmCountDayLog'] = log;

        return await put({
            TableName: 'KaKaoUserList',
            Item: user
        });
    }
};

exports.saveUser = async function (user) {
    return await put({
        TableName: 'KaKaoUserList',
        Item: user
    });
};

exports.deleteFriend = async function (userKey) {
    let user = await exports.getUser(userKey);
    if (user) {
        user.isFriend = 0;
        put({
            TableName: 'KaKaoUserList',
            Item: user
        });
    }
};

exports.addFriend = async function (userKey) {
    let user = await exports.getUser(userKey);
    if (!user) {
        user = newUser(userKey);
    }
    user.isFriend = 1;
    put({
        TableName: 'KaKaoUserList',
        Item: user
    });
};

exports.addAlrimTalk = async function (userKey, phone, date, time) {
    let user = await exports.getUser(userKey);
    if (user) {
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
    } else {
        console.error(`등록되지 않은 사용자가 알림톡 전송을 합니다. ${userKey}`);
    }
};

exports.saveAlrimTalk = async function (alrimTalk) {
    await put({
        TableName: 'AlrimTalk',
        Item: alrimTalk
    });
};

exports.cancelReservation = async function (alrimTalk, user) {
    if (!user.sendCancelCount) {
        user.sendCancelCount = 0;
    }
    user.sendCancelCount += 1;

    let today = util.getToday();
    let log = user['sendCancelCountDayLog'] || {};
    log[today] = (log[today] || 0) + 1;
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