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
                // logger.log("GetItem succeeded:", JSON.stringify(data.Item, null, 2));
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
                // logger.log("Added item:", JSON.stringify(param.Item));
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
                // logger.log("Query succeeded. Data:", util.format(data.Items));
                resolve(data);
            }
        });
    }));
};

async function query(params) {
    let items = [];
    let lastEvaluatedKey;

    do {
        let data = await queryRaw(params);
        items = items.concat(data.Items);

        lastEvaluatedKey = data.LastEvaluatedKey;
        if (lastEvaluatedKey) {
            params.ExclusiveStartKey = lastEvaluatedKey;
        }
    } while (lastEvaluatedKey);

    return items;
}

//page: 1~
async function queryPaging(params, pageSize, targetPage) {

    if (!pageSize || pageSize < 1 || !targetPage || targetPage < 1) {
        throw `pageSize/targetPage error(pageSize:${pageSize}, targetPage:${targetPage})`;
    }

    let lastEvaluatedKey;
    let currentPage = 0;

    params.Limit = pageSize;
    do {
        currentPage += 1;

        let data = await queryRaw(params);

        if (currentPage === targetPage) {
            return data.Items;
        }

        lastEvaluatedKey = data.LastEvaluatedKey;
        if (lastEvaluatedKey) {
            params.ExclusiveStartKey = lastEvaluatedKey;
        }
    } while (lastEvaluatedKey);

    return [];
}


function scanRaw(params) {
    return new Promise((resolve => {
        docClient.scan(params, function (err, data) {
            if (err) {
                logger.log("Unable to scan. Error:", JSON.stringify(err, null, 2));
                resolve(null);
            } else {
                // logger.log("Scan succeeded. Data:", util.format(data.Items));
                resolve(data);
            }
        });
    }));
}

async function scan(params) {
    let items = [];
    let lastEvaluatedKey;

    do {
        let data = await scanRaw(params);
        items = items.concat(data.Items);

        lastEvaluatedKey = data.LastEvaluatedKey;
        if (lastEvaluatedKey) {
            params.ExclusiveStartKey = lastEvaluatedKey;
        }
    } while (lastEvaluatedKey);

    return items;
}

async function scanPaging(params, pageSize, targetPage) {

    if (!pageSize || pageSize < 1 || !targetPage || targetPage < 1) {
        throw `pageSize/targetPage error(pageSize:${pageSize}, targetPage:${targetPage})`;
    }

    let lastEvaluatedKey;
    let currentPage = 0;

    params.Limit = pageSize;
    do {
        currentPage += 1;

        let data = await scanRaw(params);

        if (currentPage === targetPage) {
            return data.Items;
        }

        lastEvaluatedKey = data.LastEvaluatedKey;
        if (lastEvaluatedKey) {
            params.ExclusiveStartKey = lastEvaluatedKey;
        }
    } while (lastEvaluatedKey);

    return [];
}

function update(params) {
    return new Promise((resolve => {
        docClient.update(params, function (err, data) {
            if (err) {
                logger.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                resolve(false);
            } else {
                // logger.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
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
                // logger.log("DeleteItem succeeded:", JSON.stringify(data));
                resolve(data.Attributes);
            }
        });
    }));
};

/**
 * NoShow(노쇼 리스트)
 * noShowKey: Partition Key, 전화번호 해쉬 값
 * timestamp: Range Key, YYYYMMDDHHmmssSSS
 * date: YYYYMMDD, 노쇼한 날짜
 * email
 * date
 * id: NoShowId 테이블의 Partition Key
 * name
 *
 * NoShowId(노쇼 매핑 아이디)
 * id: Partition Key
 * noShowKey: NoShow 테이블의 Partition Key
 * timestamp: NoShow 테이블의 Range Key
 **/
exports.addNoShow = async function (email, phone, noShowDate, noShowCase, id, name) {

    if (!nmnsUtil.phoneNumberValidation(phone)) {
        throw `전화번호가 올바르지 않습니다.(${phone})`;
    }

    if (!noShowDate) {
        noShowDate = moment().format('YYYYMMDD');
    }

    if (!moment(noShowDate, 'YYYYMMDD').isValid()) {
        throw `노쇼 날짜가 올바르지 않습니다.(${noShowDate})`;
    }

    if (!id) {
        id = email + moment().format('YYYYMMDDHHmmssSSS') + Math.random() * 100;
    }

    let noShowKey = sha256(phone);
    let timestamp = moment().format('YYYYMMDDHHmmssSSS');

    let oldOne = await get({
        TableName: process.nmns.TABLE.NoShowId,
        Key: {
            'id': id
        }
    });

    if (oldOne) {
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

exports.getNoShow = async function (phone, email) {
    if (!nmnsUtil.phoneNumberValidation(phone)) {
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

    if (email) {
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

exports.delNoShow = async function (id) {
    if (!id) {
        throw '노쇼 아이디가 필요합니다.';
    }

    let noShowId = await del({
        TableName: process.nmns.TABLE.NoShowId,
        Key: {
            'id': id
        }
    });

    if (noShowId) {
        let noShowKey = noShowId.noShowKey;
        let timestamp = noShowId.timestamp;

        return await del({
            TableName: process.nmns.TABLE.NoShow,
            Key: {
                'noShowKey': noShowKey,
                'timestamp': timestamp
            }
        });

    }
}

exports.delNoShowWithPhone = async function (phone, email) {
    if (!nmnsUtil.phoneNumberValidation(phone)) {
        throw `전화번호가 올바르지 않습니다.(${phone})`;
    }

    if (!email) {
        throw 'email이 필요합니다.';
    }

    let noShowList = await exports.getNoShow(phone, email);

    if (noShowList.length > 0) {
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
                'timestamp': lastOne.timestamp
            }
        });
    }

    return false;
}

exports.delAllNoShowWithPhone = async function (phone) {
    if (!nmnsUtil.phoneNumberValidation(phone)) {
        throw `전화번호가 올바르지 않습니다.(${phone})`;
    }

    let list = await exports.getNoShow(phone);

    for (const noShow of list) {
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
 * startTimestamp: Range Key, YYYYMMDDHHmmss
 * endTimestamp: YYYYMMDDHHmmss
 * device: device 종류
 **/
exports.visitLog = async function (email, device) {
    try {
        if (!email) {
            throw 'email이 필요합니다.';
        }

        let timestamp = moment().format('YYYYMMDDHHmmssSSS');

        return await put({
            TableName: process.nmns.TABLE.VisitLog,
            Item: {
                email: email,
                timestamp: timestamp,
                device: device
            }
        });
    } catch (e) {
        logger.error(e);
    }
}

exports.exitLog = async function (visitLog) {
    try {
        if (!visitLog) {
            throw 'visitLog가 필요합니다.';
        }
        if (!visitLog.email || !visitLog.timestamp || !moment(visitLog.timestamp, 'YYYYMMDDHHmmssSSS').isValid()) {
            return `visitLog가 올바르지 않습니다. ${JSON.stringify(visitLog)}`;
        }

        let exitTimestamp = moment().format('YYYYMMDDHHmmssSSS');
        visitLog.exitTimestamp = exitTimestamp;

        let diff = moment(exitTimestamp, 'YYYYMMDDHHmmssSSS').diff(moment(visitLog.timestamp, 'YYYYMMDDHHmmssSSS'), 's');
        visitLog.diff = diff;

        return await put({
            TableName: process.nmns.TABLE.VisitLog,
            Item: visitLog
        });
    } catch (e) {
        logger.error(e);
    }
}

/**
 * Customer(고객 리스트)
 * email: Partition Key
 * id: Range Key, moment().format('YYYYMMDDHHmmssSSS') + Math.random() * 100;
 * contact
 * name
 * etc: 고객 메모
 * managerId: 담당 매니저 아이디
 * pointMembership: 보유 포인트
 * cardSales: 카드 매출 총액
 * cashSales: 현금 매출 총액
 * pointSales: 포인트 사용 총액
 */

/**
 * 고객 추가 및 업데이트
 */
exports.saveCustomer = async function (data) {

    let item = (({email, id, name, contact, managerId, etc, pointMembership, cardSales, cashSales, pointSales})=>({email, id, name, contact, managerId, etc, pointMembership, cardSales, cashSales, pointSales}))(data);

    if (!item.email || !item.id) {
        throw 'email, 고객 아이디는 필수입니다.';
    }

    if (!item.contact && !item.name) {
        throw '이름과 연락처 둘 중 하나는 필수입니다.';
    }

    if (item.contact && !nmnsUtil.phoneNumberValidation(item.contact)) {
        throw `연락처가 올바르지 않습니다.(${contact})`;
    }

    if(item.pointMembership && isNaN(item.pointMembership)){
        throw `pointMembership은 숫자만 가능합니다.(${item.pointMembership})`;
    }
    if(item.cardSales && isNaN(item.cardSales)){
        throw `cardSales은 숫자만 가능합니다.(${item.cardSales})`;
    }
    if(item.cashSales && isNaN(item.cashSales)){
        throw `cashSales은 숫자만 가능합니다.(${item.cashSales})`;
    }
    if(item.pointSales && isNaN(item.pointSales)){
        throw `pointSales은 숫자만 가능합니다.(${item.pointSales})`;
    }

    let old = await exports.getCustomer(item.email, item.id);
    if(old){
        for (let x in old) {
            if (!item.hasOwnProperty(x)) {
                item[x] = old[x];
            }
        }
    }

    if(!item.pointMembership){
        item.pointMembership = 0;
    }
    if(!item.cardSales){
        item.cardSales = 0;
    }
    if(!item.cashSales){
        item.cashSales = 0;
    }
    if(!item.pointSales){
        item.pointSales = 0;
    }

    return await put({
        TableName: process.nmns.TABLE.Customer,
        Item: item
    });
};

exports.getCustomer = async function(email, id){
    if (!email || !id) {
        throw 'email, id는 필수입니다';
    }

    return await get({
        TableName: process.nmns.TABLE.Customer,
        Key: {
            'email': email,
            'id': id
        }
    });
}

exports.getCustomerList = async function (email, contact, name) {

    if (!email) {
        throw 'email이 필요합니다.';
    }

    if (contact && !nmnsUtil.phoneNumberValidation(contact)) {
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

    if (contact) {
        param.FilterExpression = '#contact = :contact';
        param.ExpressionAttributeNames['#contact'] = 'contact';
        param.ExpressionAttributeValues[':contact'] = contact;
    }
    if (name) {
        let fe = '';
        if (contact) {
            fe = param.FilterExpression + ' and ';
        }
        param.FilterExpression = fe + '#name = :name';
        param.ExpressionAttributeNames['#name'] = 'name';
        param.ExpressionAttributeValues[':name'] = name;
    }

    return await query(param);
};

exports.deleteCustomer = async function (email, id) {
    if (!email || !id) {
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

exports.deleteAllCustomer = async function (email) {
    if (!email) {
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

    for (const customer of list) {
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
 * sendDate: YYYYMMDDHHmmssSSS,
 * date: YYYYMMDD
 * isCancel: boolean, 취소알림톡여부
 * contact: 전화번호
 * name: 고객 이름
 * contents: 내용
 * reservationKey: 예약키
 **/
exports.addAlrmTalkRaw = async function (data) {
    let alrimTalk = (({email, isCancel, contact, name, contents, date, sendDate, reservationKey}) => ({
        email,
        isCancel,
        contact,
        name,
        contents,
        date,
        sendDate,
        reservationKey
    }))(data);

    if (!alrimTalk.email) {
        throw 'email은 필수입니다.';
    }
    if (![undefined, false, true].includes(alrimTalk.isCancel)) {
        throw `isCancel은 true, false, undefined 값만 가질 수 있습니다.(${alrimTalk.isCancel})`;
    }
    if (!alrimTalk.contact || !nmnsUtil.phoneNumberValidation(alrimTalk.contact)) {
        throw `연락처가 올바르지 않습니다.(${contact})`;
    }
    if (!alrimTalk.reservationKey) {
        throw '예약키는 필수입니다.';
    }
    if (!alrimTalk.date || !moment(alrimTalk.date, 'YYYYMMDD').isValid()) {
        throw `date가 올바르지 않습니다.(${alrimTalk.date})`;
    }
    if (!alrimTalk.sendDate || !moment(alrimTalk.sendDate, 'YYYYMMDDHHmmssSSS').isValid()) {
        throw `sendDate가 올바르지 않습니다.(${alrimTalk.sendDate})`;
    }

    return await put({
        TableName: process.nmns.TABLE.AlrimTalkHist,
        Item: alrimTalk
    });
}

exports.addAlrmTalk = async function (data) {

    data.date = moment().format('YYYYMMDDHHmm');
    data.sendDate = moment().format('YYYYMMDDHHmmssSSS');

    return exports.addAlrmTalkRaw(data);
}

exports.getAlrimTalkList = async function (email, start, end, contact) {

    if (!email) {
        throw 'email은 필수입니다.';
    }

    if (start && !moment(start, 'YYYYMMDD').isValid()) {
        throw `start 날짜 형식이 맞지 않습니다.(${start})`;
    }
    if (end && !moment(end, 'YYYYMMDD').isValid()) {
        throw `end 날짜 형식이 맞지 않습니다.(${end})`;
    }
    if (contact && !nmnsUtil.phoneNumberValidation(contact)) {
        throw `contact 형식이 맞지 않습니다.(${contact})`;
    }

    if (start) {
        start += '000000000';
    } else {
        start = '20000101000000000';
    }
    if (end) {
        end += '235959999';
    } else {
        end = '29991231235959999';
    }

    let param = {
        TableName: process.nmns.TABLE.AlrimTalkHist,
        KeyConditionExpression: "email = :email and sendDate between :start and :end",
        ExpressionAttributeValues: {
            ":email": email,
            ':start': start,
            ':end': end
        },
        ScanIndexForward: false
    };
    if (contact) {
        param.FilterExpression = '#contact = :contact';
        param.ExpressionAttributeNames = {'#contact': 'contact'};
        param.ExpressionAttributeValues[':contact'] = contact;
    }

    return await query(param);
}

exports.deleteAllAlrimTalk = async function (email) {
    if (!email) {
        throw 'email이 필요합니다.';
    }

    let list = await query({
        TableName: process.nmns.TABLE.AlrimTalkHist,
        KeyConditionExpression: "#email = :email",
        ExpressionAttributeNames: {
            "#email": "email"
        },
        ExpressionAttributeValues: {
            ":email": email
        }
    });

    for (const alrimTalk of list) {
        await del({
            TableName: process.nmns.TABLE.AlrimTalkHist,
            Key: {
                'email': alrimTalk.email,
                'sendDate': alrimTalk.sendDate
            }
        });
    }
}
/**
 *
 * Notice(푸쉬 리스트)
 * email: Partition Key
 * id: Range Key, moment().format('YYYYMMDDHHmmssSSS')
 * registeredDate: YYYYMMDDHHmm
 * title
 * contents
 * data: {type: 'cancel reserv', id: reservation.id, manager: reservation.manager}
 * isRead
 * type: SCHEDULE_ADDED, SCHEDULE_CANCELED
 **/
exports.addPush = async function (data) {

    data.id = moment().format('YYYYMMDDHHmmssSSS');
    data.registeredDate = moment().format('YYYYMMDDHHmm');

    return await exports.savePush(data);
}
exports.savePush = async function (data) {
    let push = (({email, title, contents, data, type, isRead, id, registeredDate}) => ({
        email,
        title,
        contents,
        data,
        type,
        isRead,
        id,
        registeredDate
    }))(data);

    if (!push.email || !push.title || !push.contents || !push.data || push.isRead === undefined) {
        throw 'email, title, contents, data, isRead는 필수입니다.';
    }

    if (push.isRead !== false && push.isRead !== true) {
        throw `isRead 값이 잘못되었습니다.(${push.isRead})`;
    }

    if(!push.type){
        push.type = 'SCHEDULE_CANCELED';
    }

    if (push.type !== 'SCHEDULE_ADDED' && push.type !== 'SCHEDULE_CANCELED') {
        throw `type 값이 올바르지 않습니다.(${push.type})`;
    }

    if (!moment(push.id, 'YYYYMMDDHHmmssSSS').isValid()) {
        throw `push.id가 올바르지 않습니다.(${push.id})`;
    }

    if (!moment(push.registeredDate, 'YYYYMMDDHHmm').isValid()) {
        throw `push.registeredDate가 올바르지 않습니다.(${push.registeredDate})`;
    }

    return await put({
        TableName: process.nmns.TABLE.Notice,
        Item: push
    });
}

exports.getPushList = async function (email, page, pageSize = 5) {

    if (!email) {
        throw 'email은 필수입니다.';
    }

    if (!pageSize || pageSize < 1) {
        throw `pageSize가 올바르지 않습니다.(${pageSize})`;
    }
    if (!page || page < 1) {
        throw `page가 올바르지 않습니다.(${page})`;
    }

    return await queryPaging({
        TableName: process.nmns.TABLE.Notice,
        KeyConditionExpression: "#email = :email",
        ExpressionAttributeNames: {
            "#email": "email"
        },
        ExpressionAttributeValues: {
            ":email": email
        },
        ScanIndexForward: false
    }, pageSize, page);
}
exports.deleteAllPush = async function (email) {
    if (!email) {
        throw 'email은 필수입니다.';
    }

    let list = await query({
        TableName: process.nmns.TABLE.Notice,
        KeyConditionExpression: "#email = :email",
        ExpressionAttributeNames: {
            "#email": "email"
        },
        ExpressionAttributeValues: {
            ":email": email
        }
    });

    for (const push of list) {
        await del({
            TableName: process.nmns.TABLE.Notice,
            Key: {
                'email': push.email,
                'id': push.id
            }
        });
    }
}

/**
 * 공지사항 조회
 */
exports.getNotice = async function (page, pageSize = 5) {
    if (!pageSize || pageSize < 1) {
        throw `pageSize가 올바르지 않습니다.(${pageSize})`;
    }
    if (!page || page < 1) {
        throw `page가 올바르지 않습니다.(${page})`;
    }

    return await queryPaging({
        TableName: process.nmns.TABLE.Notice,
        KeyConditionExpression: "#email = :email",
        ExpressionAttributeNames: {
            "#email": "email"
        },
        ExpressionAttributeValues: {
            ":email": 'notice'
        },
        ScanIndexForward: false
    }, pageSize, page);
}

/**
 * 공지사항 입력
 */
exports.addNotice = async function(input){
    let notice = (({title, contents, id, registeredDate}) => ({
        title,
        contents,
        id,
        registeredDate
    }))(input);

    if (!notice.title || !notice.contents || !notice.id || !notice.registeredDate) {
        throw 'title, contents, id, registeredDate는 필수입니다.';
    }

    if (!moment(notice.id, 'YYYYMMDDHHmmssSSS').isValid()) {
        throw `id가 올바르지 않습니다.(${notice.id})`;
    }

    if (!moment(notice.registeredDate, 'YYYYMMDDHHmm').isValid()) {
        throw `registeredDate가 올바르지 않습니다.(${notice.registeredDate})`;
    }

    notice.email = 'notice';

    return await put({
        TableName: process.nmns.TABLE.Notice,
        Item: notice
    });
};

/**
 * Reservation(예약 리스트)
 * email: Partition Key
 * start: 시작일시, string, YYYYMMDDHHmm(user input)
 * timstamp: RANGE KEY, start(user input, YYYYMMDDHHmm) + moment().format('YYYYMMDDHHmmssSSS')
 * end: YYYYMMDDHHmm,
 * id: Client 생성
 * member: 고객 아이디,
 * name: 고객 이름 또는 일정 이름
 * contact: 연락처
 * contentList: list, 예약 리스트
 * salesList: list, 연결된 매출 리스트
 * manager: 담당 매니저 아이디,
 * etc: 고객 메모
 * isAllDay: boolean
 * status: 예역 상태, RESERVED, CANCELED, DELETED, NOSHOW, CUSTOMERCANCELED
 * cancelDate: moment().format('YYYYMMDDHHmmss')
 * type: 'R',
 * **/

exports.saveReservation = async function (data) {
    let item = (({email, timestamp, name, contact, start, end, id, member, contentList, manager, isAllDay, status, type, etc, cancelDate}) => ({
        email,
        timestamp,
        name,
        contact,
        start,
        end,
        id,
        member,
        contentList,
        manager,
        isAllDay,
        status,
        type,
        etc,
        cancelDate
    }))(data);
    if (!item.email || !item.start || !item.end || !item.id || !item.member || !item.manager) {
        throw 'email, start, end, id, member, manager는 필수입니다.'
    }

    if (!moment(item.start, 'YYYYMMDDHHmm').isValid() || !moment(item.end, 'YYYYMMDDHHmm').isValid()) {
        throw `start/end 값이 올바르지 않습니다.(start:${item.start}, end:${item.end})`;
    }

    if (item.isAllDay !== true && item.isAllDay !== false && item.isAllDay !== undefined) {
        throw `isAllday 값이 올바르지 않습니다.(${item.isAllDay})`;
    }

    if(item.isAllDay === undefined){
        item.isAllDay = false;
    }

    item.type = 'R';

    if(item.contact && !nmnsUtil.phoneNumberValidation(item.contact)){
        throw `휴대전화번호 형식이 올바르지 않습니다.(${item.contact})`;
    }

    if(!item.status){
        item.status = process.nmns.RESERVATION_STATUS.RESERVED;
    }

    if (item.status !== process.nmns.RESERVATION_STATUS.DELETED &&
        item.status !== process.nmns.RESERVATION_STATUS.NOSHOW &&
        item.status !== process.nmns.RESERVATION_STATUS.CANCELED &&
        item.status !== process.nmns.RESERVATION_STATUS.RESERVED &&
        item.status !== process.nmns.RESERVATION_STATUS.CUSTOMERCANCELED) {
        throw `status 값이 올바르지 않습니다.(${item.status})`;
    }

    if (item.contentList && !Array.isArray(item.contentList)) {
        throw `contentList 값이 올바르지 않습니다.(${item.contentList})`;
    }

    if (item.salesList && !Array.isArray(item.salesList)) {
        throw `salesList 값이 올바르지 않습니다.(${item.salesList})`;
    }

    if (item.cancelDate && !!moment(item.cancelDate, 'YYYYMMDDHHmmss').isValid()) {
        throw `cancelDate 값이 올바르지 않습니다.(${item.cancelDate})`;
    }

    if (!item.timestamp) {
        item.timestamp = item.start + moment().format('YYYYMMDDHHmmssSSS');
    }

    return await put({
        TableName: process.nmns.TABLE.Reservation,
        Item: item
    });
}
exports.getReservation = async function(email, id){
    if (!email || !id) {
        throw 'email과 id은 필수입니다.';
    }

    let list = await query({
        TableName: process.nmns.TABLE.Reservation,
        KeyConditionExpression: "email = :email",
        FilterExpression: '#id = :id',
        ExpressionAttributeNames: {
            "#id": "id",
        },
        ExpressionAttributeValues: {
            ":id": id,
            ':email': email
        },
    });

    if(list.length > 0){
        return list[0];
    }else{
        return null;
    }
}
exports.getReservationList = async function (email, start, end, isAscending = true) {
    if (!email) {
        throw 'email은 필수입니다.';
    }

    if(!start){
        start = '20000101';
    }
    if(!end){
        end = '29991231';
    }

    if(start.length === 8){
        start += '0000';
    }
    if(end.length === 8){
        end += '2359';
    }

    if (!moment(start, 'YYYYMMDDHHmm').isValid() || !moment(end, 'YYYYMMDDHHmm').isValid()) {
        throw `start/end 값이 올바르지 않습니다.(start:${start}, end:${end})`;
    }

    let list = await query({
        TableName: process.nmns.TABLE.Reservation,
        KeyConditionExpression: "email = :email and #timestamp <= :end",
        FilterExpression: '#status <> :status',
        ExpressionAttributeNames: {
            "#timestamp": "timestamp",
            "#status": "status"
        },
        ExpressionAttributeValues: {
            ":email": email,
            ":end": end,
            ":status": 'DELETED'
        },
        ScanIndexForward: isAscending
    });

    list = list.filter(function (reservation) {
        if (reservation.end <= end && reservation.end >= start) {
            return true;
        } else if (reservation.start >= start && reservation.start <= end) {
            return true;
        } else if (reservation.start <= start && reservation.end >= end) {
            return true;
        } else {
            return false;
        }
    });

    return list;
}

exports.deleteAllReservation = async function (email) {
    if (!email) {
        throw 'email은 필수입니다.';
    }

    let list = await query({
        TableName: process.nmns.TABLE.Reservation,
        KeyConditionExpression: "#email = :email",
        ExpressionAttributeNames: {
            "#email": "email"
        },
        ExpressionAttributeValues: {
            ":email": email
        }
    });

    for (const item of list) {
        await del({
            TableName: process.nmns.TABLE.Reservation,
            Key: {
                'email': item.email,
                'timestamp': item.timestamp
            }
        });
    }
};

/**
 * Task(일정 리스트)
 * email: Partition Key
 * start: 시작일시, string, YYYYMMDDHHmm(user input)
 * timstamp: RANGE KEY, start(user input, YYYYMMDDHHmm) + moment().format('YYYYMMDDHHmmssSSS')
 * end: YYYYMMDDHHmm,
 * id: client generated id
 * isDone: boolean
 * contents: 일정
 * manager: 매니저 아이디
 * etc: 부가정보
 * status: 예역 상태, RESERVED, CANCELED, DELETED, NOSHOW, CUSTOMERCANCELED
 */
exports.saveTask = async function (data) {
    let item = (({email, timestamp, name, contact, start, end, id, contents, manager, isAllDay, status, type, etc, isDone}) => ({email, timestamp, name, contact, start, end, id, contents, manager, isAllDay, status, type, etc, isDone}))(data);
    if (!item.email || !item.name || !item.start || !item.end || !item.id || !item.manager) {
        throw 'email, name, start, end, id, manager는 필수입니다.'
    }

    if (!moment(item.start, 'YYYYMMDDHHmm').isValid() || !moment(item.end, 'YYYYMMDDHHmm').isValid()) {
        throw `start/end 값이 올바르지 않습니다.(start:${item.start}, end:${item.end})`;
    }

    if (item.isAllDay !== true && item.isAllDay !== false && item.isAllDay !== undefined) {
        throw `isAllday 값이 올바르지 않습니다.(${item.isAllDay})`;
    }

    if(item.isAllDay === undefined){
        item.isAllDay = false;
    }

    if (item.isDone !== true && item.isDone !== false && item.isDone !== undefined) {
        throw `isDone 값이 올바르지 않습니다.(${item.isDone})`;
    }

    if(item.isDone === undefined){
        item.isDone = false;
    }

    item.type = 'T';

    if(!item.status){
        item.status = process.nmns.RESERVATION_STATUS.RESERVED;
    }

    if (item.status !== process.nmns.RESERVATION_STATUS.DELETED &&
        item.status !== process.nmns.RESERVATION_STATUS.NOSHOW &&
        item.status !== process.nmns.RESERVATION_STATUS.CANCELED &&
        item.status !== process.nmns.RESERVATION_STATUS.RESERVED &&
        item.status !== process.nmns.RESERVATION_STATUS.CUSTOMERCANCELED) {
        throw `status 값이 올바르지 않습니다.(${item.status})`;
    }


    if (!item.timestamp) {
        item.timestamp = item.start + moment().format('YYYYMMDDHHmmssSSS');
    }

    return await put({
        TableName: process.nmns.TABLE.Task,
        Item: item
    });
}
exports.getTask = async function(email, id){
    if (!email || !id) {
        throw 'email과 id은 필수입니다.';
    }

    let list = await query({
        TableName: process.nmns.TABLE.Task,
        KeyConditionExpression: "email = :email",
        FilterExpression: '#id = :id',
        ExpressionAttributeNames: {
            "#id": "id",
        },
        ExpressionAttributeValues: {
            ":id": id,
            ':email': email
        },
    });

    if(list.length > 0){
        return list[0];
    }else{
        return null;
    }
}
exports.getTaskList = async function (email, start, end) {
    if (!email) {
        throw 'email은 필수입니다.';
    }

    if(!start){
        start = '20000101';
    }
    if(!end){
        end = '29991231';
    }

    if(start.length === 8){
        start += '0000';
    }
    if(end.length === 8){
        end += '2359';
    }

    if (!moment(start, 'YYYYMMDDHHmm').isValid() || !moment(end, 'YYYYMMDDHHmm').isValid()) {
        throw `start/end 값이 올바르지 않습니다.(start:${start}, end:${end})`;
    }

    let list = await query({
        TableName: process.nmns.TABLE.Task,
        KeyConditionExpression: "email = :email and #timestamp <= :end",
        FilterExpression: '#status <> :status',
        ExpressionAttributeNames: {
            "#timestamp": "timestamp",
            "#status": "status"
        },
        ExpressionAttributeValues: {
            ":email": email,
            ":end": end,
            ":status": 'DELETED'
        },
    });

    list = list.filter(function (reservation) {
        if (reservation.end <= end && reservation.end >= start) {
            return true;
        } else if (reservation.start >= start && reservation.start <= end) {
            return true;
        } else if (reservation.start <= start && reservation.end >= end) {
            return true;
        } else {
            return false;
        }
    });

    return list;
}
exports.deleteAllTask = async function (email) {
    if (!email) {
        throw 'email은 필수입니다.';
    }

    let list = await query({
        TableName: process.nmns.TABLE.Task,
        KeyConditionExpression: "#email = :email",
        ExpressionAttributeNames: {
            "#email": "email"
        },
        ExpressionAttributeValues: {
            ":email": email
        }
    });

    for (const item of list) {
        await del({
            TableName: process.nmns.TABLE.Task,
            Key: {
                'email': item.email,
                'timestamp': item.timestamp
            }
        });
    }
};
/**
 * Sales(매출내역/포인트 증감내역)
 * email: Partition Key
 * date: 매출날짜(YYYYMMDD)
 * time: 매출 시간(HHmmss)
 * id: timestamp(YYYYMMDDHHmmssSSS) + 랜덤스트링, Range Key, Client 생성
 * item: 매출내용/멤버십 변동
 * price
 * customerId: 고객 아이디
 * payment: 결제수단(멤버십 적립의 경우 결제한 수단)
 * managerId
 * type: CARD(카드매출), CASH(현금매출), MEMBERSHIP(멤버십 사용), MEMBERSHIP_ADD(적립), MEMBERSHIP_INCREMENT(증가), MEMBERSHIP_DECREMENT(감소)
 * scheduleId: 관련 예약 아이디
 * membershipChange: 멤버십 변동
 * balanceMembership: 멤버십 잔액
 **/
let commonValidationForMembershipModify = function(data){
    if(isNaN(data.membershipChange) || data.membershipChange <= 0){
        throw `멤버십 변경 값은 양수 정수입니다.(${data.membershipChange})`;
    }
};
let changePointBalance = function(customer, isRefund, sales){
    let type = sales.type;
    let multiply = isRefund === true ? -1 : 1;
    switch(type){
        case process.nmns.SALE_HIST_TYPE.MEMBERSHIP_DECREMENT:
            sales.balanceMembership = customer.pointMembership - sales.membershipChange * multiply;
            break;
        case process.nmns.SALE_HIST_TYPE.MEMBERSHIP_INCREMENT:
            sales.balanceMembership = customer.pointMembership + sales.membershipChange * multiply;
            break;
        case process.nmns.SALE_HIST_TYPE.MEMBERSHIP_ADD:
            sales.balanceMembership = customer.pointMembership + sales.membershipChange * multiply;
            break;
        case process.nmns.SALE_HIST_TYPE.MEMBERSHIP_USE:
            sales.balanceMembership = customer.pointMembership - sales.membershipChange * multiply;
            break;
        default:
            break;
    }
    return sales;
}
let changeMemberSalesStatistic = function(customer, isRefund, sales){

    let multiply = isRefund === true ? 1 : -1;

    switch(sales.type){
        case process.nmns.SALE_HIST_TYPE.MEMBERSHIP_DECREMENT:
            customer.pointMembership += multiply * sales.membershipChange;
            break;
        case process.nmns.SALE_HIST_TYPE.MEMBERSHIP_INCREMENT:
            customer.pointMembership -= multiply * sales.membershipChange;
            break;
        case process.nmns.SALE_HIST_TYPE.MEMBERSHIP_ADD:
            customer.pointMembership = customer.pointMembership - multiply*sales.membershipChange;
            if(sales.payment === process.nmns.PAYMENT_METHOD.CARD){
                customer.cardSales -= sales.price * multiply;
            }else if(sales.payment === process.nmns.PAYMENT_METHOD.CASH){
                customer.cashSales -= sales.price * multiply;
            }
            break;
        case process.nmns.SALE_HIST_TYPE.MEMBERSHIP_USE:
            customer.pointMembership += multiply * sales.price;
            customer.pointSales -= sales.price * multiply;
            break;
        case process.nmns.SALE_HIST_TYPE.SALES_CARD:
            customer.cardSales -= sales.price * multiply;
            break;
        case process.nmns.SALE_HIST_TYPE.SALES_CASH:
            customer.cashSales -= sales.price * multiply;
            break;
    }
    return customer;
}

exports.saveSales = async function(data){
    let sales = (({email, id, date, time, item, price, customerId, payment, managerId, type, scheduleId, membershipChange, balanceMembership}) =>
        ({email, id, date, time, item, price, customerId, payment, managerId, type, scheduleId, membershipChange, balanceMembership}))(data);
    if (!sales.email || !sales.id || !sales.customerId || !sales.item || !sales.date || !sales.time) {
        throw 'email, id, date, time, customerId, item는 필수입니다.'
    }

    let timestamp = sales.id.substring(0,17);
    if(!moment(timestamp, 'YYYYMMDDHHmmssSSS').isValid()){
        throw `id 값 형식이 올바르지 않습니다.(${sales.id})`;
    }
    if(!moment(sales.date, 'YYYYMMDD').isValid()){
        throw `date 값 형식이 올바르지 않습니다.(${sales.date})`;
    }
    if(!moment(sales.time, 'HHmm').isValid()){
        throw `time 값 형식이 올바르지 않습니다.(${sales.time})`;
    }

    let customer = await exports.getCustomer(sales.email, sales.customerId);
    if(!customer){
        throw `고객 아이디로 조회되는 고객이 없습니다.(${sales.customerId})`;
    }

    let type = sales.type;
    if(!type || !process.nmns.isValidSaleHistType(type)){
        throw `올바른 매출 종류가 아닙니다.(${type})`;
    }

    switch(type){
        case process.nmns.SALE_HIST_TYPE.MEMBERSHIP_DECREMENT:
        case process.nmns.SALE_HIST_TYPE.MEMBERSHIP_INCREMENT:
            commonValidationForMembershipModify(sales);
            break;
        case process.nmns.SALE_HIST_TYPE.MEMBERSHIP_ADD:
            commonValidationForMembershipModify(sales);
            if(isNaN(sales.price) || sales.price <= 0){
                throw `멤버십 적립 시에는 양수 정수인 금액 값이 필요합니다.(${sales.price})`;
            }else if(![process.nmns.PAYMENT_METHOD.CASH, process.nmns.PAYMENT_METHOD.CARD].includes(data.payment)){
                throw `멤버십 적립 시에는 결제수단이 필요합니다. (${sales.payment})`;
            }

            break;
        case process.nmns.SALE_HIST_TYPE.MEMBERSHIP_USE:
            sales.membershipChange = sales.price;
        case process.nmns.SALE_HIST_TYPE.SALES_CARD:
        case process.nmns.SALE_HIST_TYPE.SALES_CASH:
            if(!await exports.getReservation(sales.email, sales.scheduleId)){
                throw `예약아아디가 없거나 예약아이디로 예약이 조회되지 않습니다.(${sales.scheduleId})`;
            }else if(!sales.managerId){
                throw '매출내역 추가에 매니저 아이디가 필요합니다.';
            }else if(isNaN(sales.price) || sales.price <= 0){
                throw `매출내역 추가에 양수 정수인 금액 값이 필요합니다.(${sales.price})`;
            }
            sales.payment = sales.type;
            break;
    }

    let old = await exports.getSales(sales.email, sales.id);
    if(old){
        //수정인 경우 기존꺼 환불처리 해야 함
        old = changePointBalance(customer, true, old);
        await put({
            TableName: process.nmns.TABLE.Sales,
            Item: old
        });
        customer = changeMemberSalesStatistic(customer, true, old);
        await exports.saveCustomer(customer);
    }

    changePointBalance(customer, false, sales);
    changeMemberSalesStatistic(customer, false, sales);

    await exports.saveCustomer(customer);

    return await put({
        TableName: process.nmns.TABLE.Sales,
        Item: sales
    });
}
/**
 *
 * @param email
 * @param options(start, end, customerId, customerName, item, scheduleId, managerId, priceStart, priceEnd, paymentList)
 * @returns {Promise<void>}
 */
exports.getSalesHist = async function(email, options, asc = true){
    if(!email){
        throw 'email은 필수입니다.';
    }

    let start = options.start || '20180101';
    let end = options.end || '20991231';

    if(start && !moment(start, 'YYYYMMDD').isValid()){
        throw `start 값이 올바르지 않습니다.(${start})`;
    }
    if(end && !moment(end, 'YYYYMMDD').isValid()){
        throw `end 값이 올바르지 않습니다.(${end})`;
    }

    start += '000000000';
    end += '235959999';

    let param = {
        TableName: process.nmns.TABLE.Sales,
        KeyConditionExpression: "email = :email and #id between :start and :end",
        ExpressionAttributeNames: {
            '#id': 'id'
        },
        ExpressionAttributeValues: {
            ':email': email,
            ':start': start,
            ':end': end
        },
        ScanIndexForward: asc
    };

    if(options.customerName){
        let list = await exports.getCustomerList(email, undefined, options.customerName);
        if(list.length > 0){
            options.customerId = list[0].id;
        }
    }

    if (options.customerId) {
        param.FilterExpression = 'customerId = :customerId';
        param.ExpressionAttributeValues[':customerId'] = options.customerId;
    }
    if (options.item) {
        let fe = '';
        if (param.FilterExpression && param.FilterExpression.length > 0) {
            fe = param.FilterExpression + ' and ';
        }
        param.FilterExpression = fe + 'contains(#item, :item)';
        param.ExpressionAttributeNames['#item'] = 'item';
        param.ExpressionAttributeValues[':item'] = options.item;
    }

    if (options.scheduleId) {
        let fe = '';
        if (param.FilterExpression && param.FilterExpression.length > 0) {
            fe = param.FilterExpression + ' and ';
        }
        param.FilterExpression = fe + '#scheduleId = :scheduleId';
        param.ExpressionAttributeNames['#scheduleId'] = 'scheduleId';
        param.ExpressionAttributeValues[':scheduleId'] = options.scheduleId;
    }

    if (options.managerId) {
        let fe = '';
        if (param.FilterExpression && param.FilterExpression.length > 0) {
            fe = param.FilterExpression + ' and ';
        }
        param.FilterExpression = fe + '#managerId = :managerId';
        param.ExpressionAttributeNames['#managerId'] = 'managerId';
        param.ExpressionAttributeValues[':managerId'] = options.managerId;
    }

    if (options.priceStart) {
        let fe = '';
        if (param.FilterExpression && param.FilterExpression.length > 0) {
            fe = param.FilterExpression + ' and ';
        }
        param.FilterExpression = fe + '#price >= :priceStart';
        param.ExpressionAttributeNames['#price'] = 'price';
        param.ExpressionAttributeValues[':priceStart'] = options.priceStart;
    }

    if (options.priceEnd) {
        let fe = '';
        if (param.FilterExpression && param.FilterExpression.length > 0) {
            fe = param.FilterExpression + ' and ';
        }
        param.FilterExpression = fe + '#price <= :priceEnd';
        param.ExpressionAttributeNames['#price'] = 'price';
        param.ExpressionAttributeValues[':priceEnd'] = options.priceEnd;
    }

    let list = (await query(param)).filter(sales => {
        if(options.paymentList && !options.paymentList.includes(sales.payment)){
            return false;
        }
        if(options.typeList && !options.typeList.includes(sales.type)){
            return false;
        }
        return true;
    });

    return list;
}
exports.getSales = async function(email, id){
    if (!email || !id) {
        throw 'email, id는 필수입니다.';
    }

    return await get({
        TableName: process.nmns.TABLE.Sales,
        Key: {
            'email': email,
            'id': id
        }
    })
}
exports.deleteAllSales = async function (email) {
    if (!email) {
        throw 'email은 필수입니다.';
    }

    let list = await query({
        TableName: process.nmns.TABLE.Sales,
        KeyConditionExpression: "#email = :email",
        ExpressionAttributeNames: {
            "#email": "email"
        },
        ExpressionAttributeValues: {
            ":email": email
        }
    });

    for (const item of list) {
        await del({
            TableName: process.nmns.TABLE.Sales,
            Key: {
                'email': item.email,
                'id': item.id
            }
        });
    }
};


