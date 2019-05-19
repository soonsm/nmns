'user strict';

const logger = global.nmns.LOGGER;

const moment = require('moment');
const sha256 = require('js-sha256');
const util = require('util');
const nmnsUtil = require('./util');

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
                logger.log("GetItem succeeded:", JSON.stringify(data.Item, null, 2));
                resolve(data.Item);
            } else {
                logger.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                resolve();
            }
        });
    });
}


function put(param) {
    return new Promise((resolve => {
        docClient.put(param, function (err, data) {
            if (err) {
                logger.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2), " param: ", param);
                resolve(null);
            } else {
                logger.log("Added item:", JSON.stringify(param.Item));
                resolve(param.Item);
            }
        });
    }));
}

function queryRaw(params) {
    return new Promise((resolve => {
        docClient.query(params, function (err, data) {
            if (err) {
                logger.log("Unable to query. Error:", JSON.stringify(err, null, 2));
                resolve(null);
            } else {
                logger.log("Query succeeded. Data:", util.format(data.Items));
                resolve(data);
            }
        });
    }));
};

async function query(params){
    let items = [];
    let lastEvaluatedKey;

    do{
        let data = await queryRaw(params);
        items = items.concat(data.Items);

        lastEvaluatedKey = data.LastEvaluatedKey;
        if(lastEvaluatedKey){
            params.ExclusiveStartKey = lastEvaluatedKey;
        }
    }while(lastEvaluatedKey);

    return items;
}



function scanRaw(params) {
    return new Promise((resolve => {
        docClient.scan(params, function (err, data) {
            if (err) {
                logger.log("Unable to scan. Error:", JSON.stringify(err, null, 2));
                resolve(null);
            } else {
                logger.log("Scan succeeded. Data:", util.format(data.Items));
                resolve(data.Items);
            }
        });
    }));
}

async function scan(params){
    let items = [];
    let lastEvaluatedKey;

    do{
        let data = await scanRaw(params);
        items = items.concat(data.Items);

        lastEvaluatedKey = data.LastEvaluatedKey;
        if(lastEvaluatedKey){
            params.ExclusiveStartKey = lastEvaluatedKey;
        }
    }while(lastEvaluatedKey);

    return items;
}

function update(params) {
    return new Promise((resolve => {
        docClient.update(params, function (err, data) {
            if (err) {
                logger.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                resolve(false);
            } else {
                logger.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
                resolve(true);
            }
        });
    }));
}

function del(param) {
    return new Promise((resolve => {
        param.ReturnValues = 'ALL_OLD'
        docClient.delete(param, function (err, data) {
            if (err) {
                logger.error("Unable to delete item. Error JSON:", JSON.stringify(err), " param: ", param);
                resolve(false);
            } else {
                logger.log("DeleteItem succeeded:", JSON.stringify(data));
                resolve(data.Attributes);
            }
        });
    }));
};

/**
 * NoShow(노쇼 리스트)
 * noShowKey: Partition Key, 전화번호 해쉬 값
 * timestamp: Range Key, YYYYMMDDhhmmssSSS
 * date: YYYYMMDD, 노쇼한 날짜
 * email
 * noShowCase
 * id: NoShowId 테이블의 Partition Key
 * name
 * 
 * NoShowId(노쇼 매핑 아이디)
 * id: Partition Key
 * noShowKey: NoShow 테이블의 Partition Key
 * timestamp: NoShow 테이블의 Range Key
 **/
exports.addNoShow = async function(email, phone, noShowDate, noShowCase, id, name){

    if(!nmnsUtil.phoneNumberValidation(phone)){
        throw `전화번호가 올바르지 않습니다.(${phone})`;
    }

    if(!noShowDate){
        noShowDate = moment().format('YYYYMMDD');
    }

    if(!moment(noShowDate, 'YYYYMMDD').isValid()){
        throw `노쇼 날짜가 올바르지 않습니다.(${noShowDate})`;
    }

    if(!id){
        id = email + moment().format('YYYYMMDDhhmmssSSS') + Math.random() * 100;
    }

    let noShowKey = sha256(phone);
    let timestamp = moment().format('YYYYMMDDhhmmssSSS');

    let oldOne = await get({
        TableName: process.nmns.TABLE.NoShowId,
        Key: {
            'id': id
        }
    });

    if(oldOne){
        return false;
    }

    await put({
        TableName: process.nmns.TABLE.NoShowId,
        Item: {
            id: id,
            noShowKey: noShowKey,
            timestamp: timestamp,
        }
    });

    return await put({
        TableName: process.nmns.TABLE.NoShow,
        Item: {
            noShowKey: noShowKey,
            timestamp: timestamp,
            date: noShowDate,
            email: email,
            noShowCase: noShowCase,
            id: id,
            name: name
        }
    });
};

exports.getNoShow = async function(phone, email){
    if(!nmnsUtil.phoneNumberValidation(phone)){
        throw `전화번호가 올바르지 않습니다.(${phone})`;
    }

    let param = {
        TableName: process.nmns.TABLE.NoShow,
        KeyConditionExpression: "#key = :key",
        ExpressionAttributeNames: {
            "#key": "noShowKey"
        },
        ExpressionAttributeValues: {
            ":key": sha256(phone)
        }
    };

    if(email){
        param.FilterExpression = '#email = :email';
        param.ExpressionAttributeNames['#email'] = 'email';
        param.ExpressionAttributeValues[':email'] = email;
    }

    let list = await query(param);
    list.sort((a, b) => {
        return a.date - b.date;
    });

    return list;

}

exports.delNoShow = async function(id){
    if(!id){
        throw '노쇼 아이디가 필요합니다.';
    }

    let noShowId = await del({
        TableName: process.nmns.TABLE.NoShowId,
        Key: {
            'id': id
        }
    });

    if(noShowId){
        let noShowKey = noShowId.noShowKey;
        let timestamp = noShowId.timestamp;

        return await del({
            TableName: process.nmns.TABLE.NoShow,
            Key: {
                'noShowKey': noShowKey,
                'timestamp' : timestamp
            }
        });

    }
}

exports.delNoShowWithPhone = async function(phone, email){
    if(!nmnsUtil.phoneNumberValidation(phone)){
        throw `전화번호가 올바르지 않습니다.(${phone})`;
    }

    if(!email){
        throw 'email이 필요합니다.';
    }

    let noShowList = await exports.getNoShow(phone, email);

    if(noShowList.length > 0){
        let lastOne = noShowList[noShowList.length - 1];

        await del({
            TableName: process.nmns.TABLE.NoShowId,
            Key: {
                'id': lastOne.id
            }
        });

        return await del({
            TableName: process.nmns.TABLE.NoShow,
            Key: {
                'noShowKey': sha256(phone),
                'timestamp' : lastOne.timestamp
            }
        });
    }

    return false;
}

exports.delAllNoShowWithPhone = async function(phone){
    if(!nmnsUtil.phoneNumberValidation(phone)){
        throw `전화번호가 올바르지 않습니다.(${phone})`;
    }

    let list = await exports.getNoShow(phone);

    for(const noShow of list){
        await del({
            TableName: process.nmns.TABLE.NoShow,
            Key: {
                'noShowKey': noShow.noShowKey,
                'timestamp': noShow.timestamp
            }
        });

        await del({
            TableName: process.nmns.TABLE.NoShowId,
            Key: {
                'id': noShow.id
            }
        });
    }

    return true;
}

/**
 * VisitLog(방문기록)
 * email: Partition Key
 * startTimestamp: Range Key, YYYYMMDDhhmmss
 * endTimestamp: YYYYMMDDhhmmss
 * device: device 종류
 **/
exports.visitLog = async function(email, device){
    try{
        if(!email){
            throw 'email이 필요합니다.';
        }

        let timestamp = moment().format('YYYYMMDDhhmmssSSS');

        return await put({
            TableName: process.nmns.TABLE.VisitLog,
            Item: {
                email: email,
                timestamp: timestamp,
                device: device
            }
        });
    }catch(e){
        logger.error(e);
    }
}

exports.exitLog = async function(visitLog){
    try{
        if(!visitLog){
            throw 'visitLog가 필요합니다.';
        }
        if(!visitLog.email || !visitLog.timestamp || !moment(visitLog.timestamp, 'YYYYMMDDhhmmssSSS').isValid()){
            return `visitLog가 올바르지 않습니다. ${JSON.stringify(visitLog)}`;
        }

        let exitTimestamp = moment().format('YYYYMMDDhhmmssSSS');
        visitLog.exitTimestamp = exitTimestamp;

        let diff = moment(exitTimestamp,'YYYYMMDDhhmmssSSS').diff(moment(visitLog.timestamp,'YYYYMMDDhhmmssSSS'), 's');
        visitLog.diff = diff;

        return await put({
            TableName: process.nmns.TABLE.VisitLog,
            Item: visitLog
        });
    }catch(e){
        logger.error(e);
    }
}

/**
 * Customer(고객 리스트)
 * email: Partition Key
 * id: Range Key, moment().format('YYYYMMDDhhmmssSSS') + Math.random() * 100;
 * contact
 * name
 * etc: 고객 메모
 * managerId: 담당 매니저 아이디
 */

/**
 * 고객 추가 및 업데이트
 */
exports.saveCustomer = async function(email, id, name, contact, managerId, etc){

    if(!email || !id ){
        throw 'email, 고객 아이디는 필수입니다.';
    }

    if(!contact && !name){
        throw '이름과 연락처 둘 중 하나는 필수입니다.';
    }

    if(contact && !nmnsUtil.phoneNumberValidation(contact)){
        throw `연락처가 올바르지 않습니다.(${contact})`;
    }

    return await put({
        TableName: process.nmns.TABLE.Customer,
        Item: {
            email: email,
            id: id,
            contact: contact,
            name: name,
            etc: etc,
            managerId: managerId
        }
    });
};

exports.getCustomerList = async function(email, contact, name){

    if(!email){
        throw 'email이 필요합니다.';
    }

    if(contact && !nmnsUtil.phoneNumberValidation(contact)){
        throw `전화번호가 올바르지 않습니다.(${contact})`;
    }

    let param = {
        TableName: process.nmns.TABLE.Customer,
        KeyConditionExpression: "#email = :email",
        ExpressionAttributeNames: {
            "#email": "email"
        },
        ExpressionAttributeValues: {
            ":email": email
        }
    };

    if(contact){
        param.FilterExpression = '#contact = :contact';
        param.ExpressionAttributeNames['#contact'] = 'contact';
        param.ExpressionAttributeValues[':contact'] = contact;
    }
    if(name){
        let fe = '';
        if(contact){
            fe = param.FilterExpression + ' and ';
        }
        param.FilterExpression = fe + '#name = :name';
        param.ExpressionAttributeNames['#name'] = 'name';
        param.ExpressionAttributeValues[':name'] = name;
    }

    return await query(param);
};

exports.deleteCustomer = async function(email, id){
    if(!email || !id){
        throw 'email, 고객 아이디가 필요합니다.';
    }

    return await del({
        TableName: process.nmns.TABLE.Customer,
        Key: {
            'email': email,
            'id': id
        }
    });
};

exports.deleteAllCustomer = async function(email){
    if(!email){
        throw 'email이 필요합니다.';
    }

    let list = await query({
        TableName: process.nmns.TABLE.Customer,
        KeyConditionExpression: "#email = :email",
        ExpressionAttributeNames: {
            "#email": "email"
        },
        ExpressionAttributeValues: {
            ":email": email
        }
    });

    for(const customer of list){
        await del({
            TableName: process.nmns.TABLE.Customer,
            Key: {
                'email': customer.email,
                'id': customer.id
            }
        });
    }
}

/**
 * AlrimTalkHist(알림톡 사용 내역)
 * email: Partition Key
 * sendDate: YYYYMMDDhhmmssSSS
 * isCancel: boolean, 취소알림톡여부
 * contact: 전화번호
 * name: 고객 이름
 * msg: 내용
 * reservationKey: 예약키
 **/

/**

 *
 * PushList(푸쉬 리스트)
 * email: Partition Key
 * pushId: Range Key, moment().format('YYYYMMDDHHmmssSSS')
 * title
 * contents
 * data: {type: 'cancel reserv', id: reservation.id, manager: reservation.manager}
 * confirmed
 *
 * ReservationList(예약 리스트)
 * email: Partition Key
 * reservationKey: Range Key, Client 생성
 * type: 'R',
 * memberId: 고객 아이디,
 * name: 고객 혹은 일정 이름,
 * start: reservation.start,
 * end: reservation.end,
 * isAllDay: YYYYMMDDHHmm,
 * contents: YYYYMMDDHHmm,
 * manager: 담당 매니저 아이디,
 * etc: 메모,
 * contact: 연락처,
 * status: 예역 상태,
 * cancelDate: null
 *
 * SalesHist(매출내역) 미정
 * PointHist(포인트 내역) 미정
 **/