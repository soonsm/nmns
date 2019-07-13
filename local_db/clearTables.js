'use strict';

var AWS = require("aws-sdk");
var moment = require('moment');
AWS.config.update({
        region: "ap-northeast-2",
        endpoint: "http://localhost:8000"
});
var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();
let create = function(params){
    dynamodb.createTable(params, function(err, data) {
        if (err) {
            console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
};
/*
(async function(){
    dynamodb.deleteTable({
        TableName : "VisitLog"
    }, function(err, data) {
        if (err) {
            console.error("Unable to delete table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Deleted table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
})();
*/
(async function(){
    var params = {
        TableName : "SessionTable",
        KeySchema: [
            { AttributeName: "id", KeyType: "HASH"},
        ],
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };
    create(params);
})();
(async function(){
    var params = {
        TableName : "SnsLink",
        KeySchema: [
            { AttributeName: "snsLinkId", KeyType: "HASH"},
        ],
        AttributeDefinitions: [
            { AttributeName: "snsLinkId", AttributeType: "S" },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };
    create(params);
})();
(async function(){
    var params = {
        TableName : "AlrimTalk",
        KeySchema: [
            { AttributeName: "reservationKey", KeyType: "HASH"},
        ],
        AttributeDefinitions: [
            { AttributeName: "reservationKey", AttributeType: "S" },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };
    create(params);
})();
(async function(){
    var params = {
        TableName : "AlrimTalkUser",
        KeySchema: [
            { AttributeName: "key", KeyType: "HASH"},
        ],
        AttributeDefinitions: [
            { AttributeName: "key", AttributeType: "S" },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };
    create(params);
})();
(async function(){
    var params = {
        TableName : "KaKaoUserList",
        KeySchema: [
            { AttributeName: "userKey", KeyType: "HASH"},
        ],
        AttributeDefinitions: [
            { AttributeName: "userKey", AttributeType: "S" },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };
    create(params);
})();
(async function(){
    var params = {
        TableName : "NoShowList",
        KeySchema: [
            { AttributeName: "noShowKey", KeyType: "HASH"},
        ],
        AttributeDefinitions: [
            { AttributeName: "noShowKey", AttributeType: "S" },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };
    create(params);
})();
(async function(){
    var params = {
        TableName : "WebSecheduler",
        KeySchema: [
            { AttributeName: "email", KeyType: "HASH"},
        ],
        AttributeDefinitions: [
            { AttributeName: "email", AttributeType: "S" },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };
    create(params);
})();

(async function(){
    var params = {
        TableName : "Notice",
        KeySchema: [
            { AttributeName: "id", KeyType: "HASH"},
        ],
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };
    create(params);
})();
(async function(){
    var params = {
        TableName : "NoShow",
        KeySchema: [
            { AttributeName: "noShowKey", KeyType: "HASH"},
            { AttributeName: "timestamp", KeyType: "RANGE"},
        ],
        AttributeDefinitions: [
            { AttributeName: "noShowKey", AttributeType: "S" },
            { AttributeName: "timestamp", AttributeType: "S" },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };
    create(params);
})();
(async function(){
    var params = {
        TableName : "NoShowId",
        KeySchema: [
            { AttributeName: "id", KeyType: "HASH"},
        ],
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };
    create(params);
})();
(async function(){
    var params = {
        TableName : "VisitLog",
        KeySchema: [
            { AttributeName: "email", KeyType: "HASH"},
            { AttributeName: "timestamp", KeyType: "RANGE"},
        ],
        AttributeDefinitions: [
            { AttributeName: "email", AttributeType: "S" },
            { AttributeName: "timestamp", AttributeType: "S" },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };
    create(params);
})();
(async function(){
    var params = {
        TableName : "Customer",
        KeySchema: [
            { AttributeName: "email", KeyType: "HASH"},
            { AttributeName: "id", KeyType: "RANGE"},
        ],
        AttributeDefinitions: [
            { AttributeName: "email", AttributeType: "S" },
            { AttributeName: "id", AttributeType: "S" },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };
    create(params);
})();
(async function(){
    var params = {
        TableName : "AlrimTalkHist",
        KeySchema: [
            { AttributeName: "email", KeyType: "HASH"},
            { AttributeName: "sendDate", KeyType: "RANGE"},
        ],
        AttributeDefinitions: [
            { AttributeName: "email", AttributeType: "S" },
            { AttributeName: "sendDate", AttributeType: "S" },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };
    create(params);
})();
(async function(){
    var params = {
        TableName : "Push",
        KeySchema: [
            { AttributeName: "email", KeyType: "HASH"},
            { AttributeName: "id", KeyType: "RANGE"},
        ],
        AttributeDefinitions: [
            { AttributeName: "email", AttributeType: "S" },
            { AttributeName: "id", AttributeType: "S" },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };
    create(params);
})();
(async function(){
    var params = {
        TableName : "Reservation",
        KeySchema: [
            { AttributeName: "email", KeyType: "HASH"},
            { AttributeName: "timestamp", KeyType: "RANGE"},
        ],
        AttributeDefinitions: [
            { AttributeName: "email", AttributeType: "S" },
            { AttributeName: "timestamp", AttributeType: "S" },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };
    create(params);
})();
(async function(){
    var params = {
        TableName : "Task",
        KeySchema: [
            { AttributeName: "email", KeyType: "HASH"},
            { AttributeName: "timestamp", KeyType: "RANGE"},
        ],
        AttributeDefinitions: [
            { AttributeName: "email", AttributeType: "S" },
            { AttributeName: "timestamp", AttributeType: "S" },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };
    create(params);
})();
(async function(){
    var params = {
        TableName : "Sales",
        KeySchema: [
            { AttributeName: "email", KeyType: "HASH"},
            { AttributeName: "id", KeyType: "RANGE"},
        ],
        AttributeDefinitions: [
            { AttributeName: "email", AttributeType: "S" },
            { AttributeName: "id", AttributeType: "S" },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };
    create(params);
})();

(async function(){
    var params = {
        TableName : "NoticeNew",
        KeySchema: [
            { AttributeName: "email", KeyType: "HASH"},
            { AttributeName: "id", KeyType: "RANGE"},
        ],
        AttributeDefinitions: [
            { AttributeName: "email", AttributeType: "S" },
            { AttributeName: "id", AttributeType: "S" },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };
    create(params);
})();
//-----------------------Data Insert------------------------------//
/*
(async function(){
    for(let i=0; i< 20; i++){
        docClient.put({
            TableName: 'NoticeNew',
            Item: {
                email: 'notice',
                id: moment().add(i,'days').format('YYYYMMDDHHmmssSSS'),
                registeredDate: moment().add(i,'days').format('YYYYMMDDHHmm'),
                title: `${i} 번째 공지사항`,
                contents: `${i} 번째 공지사항 내용입니다.`
            }
        }, function (err, data) {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("Added item:", JSON.stringify(data));
            }
        });
    }
})();
*/
/*
let newWebUser = function (user) {
    return {
        email: user.email,
        authStatus: 'EMAIL_VERIFICATED',
        emailAuthToken: user.emailAuthToken || null,
        snsType: user.snsType,
        snsLinkId : user.snsLinkId,
        password: (user.snsType ? undefined : require('sha512')(user.password).toString('hex')),
        numOfWrongPassword: 0,
        bizBeginTime: user.bizBeginTime || '0900',
        bizEndTime: user.bizEndTime || '2300',
        accountStatus: 0, //0 - 정상, 1 - 비밀번호 오류 초과로 인한 lock
        signUpDate: moment().format('YYYYMMDD'),
        shopName: user.shopName || null,
        bizType: user.bizType || null,
        staffList: [{
            id: user.email + moment().format('YYYYMMDDHHmmssSSS'),
            name: '기본 담당자',
            color: '#009688'
        }],
        alrimTalkInfo: {
            useYn: 'N',
            callbackPhone: null,
            cancelDue: '3시간',
            notice: '예약시간을 지켜주세요.'
        },
        noShowList: [],
        visitLog: [],
        deviceLog: [],
        deviceHist: {},
        reservationList: [],
        memberList: [],
        reservationConfirmAlrimTalkList: [],
        cancelAlrimTalkList: [],
        pushList: [],
        isFirstVisit: true,
        feedback: [],
        kakaotalk: user.kakaotalk || null,
        redNoticeList: [],
        saleHistList: []
    };
};

(async function(){
    let email = 'happy@store.com';
    let password = 'xptmxm1!';
    let shopName = '와우네일샵';
    docClient.put({
        TableName: "WebSecheduler",
        Item: newWebUser({email: email, password: password, shopName: shopName})
    }, function(err, data) {
        if (err) {
            console.error("Unable to add WebUser", user, ". Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("PutItem succeeded:", JSON.stringify(data));
        }
    });
})();
*/
//--------------------------Data delete-----------------------------
/*
(async function(){
    for(let i=50; i< 70; i++){
        docClient.delete({
            TableName: 'Notice',
            Key: {
                "id": `${i}`
            }
        }, function (err, data) {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("Added item:", JSON.stringify(data));
            }
        });
    }
})();
*/
