'use strict';

var AWS = require("aws-sdk");
//var db = require('./../bin/webDb');
var moment = require('moment');
AWS.config.update({
    region: "eu-west-2",
    endpoint: "http://localhost:8000"
});
var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();
// var params = {
//     TableName : "KaKaoUserList",
//     KeySchema: [
//         { AttributeName: "userKey", KeyType: "HASH"},  //Partition key
//     ],
//     AttributeDefinitions: [
//         { AttributeName: "userKey", AttributeType: "S" },
//     ],
//     ProvisionedThroughput: {
//         ReadCapacityUnits: 5,
//         WriteCapacityUnits: 5
//     }
// };
// dynamodb.createTable(params, function(err, data) {
//     if (err) {
//         console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
//     } else {
//         console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
//     }
// });
/*
(async function(){
    var params = {
        TableName : "Notice",
        KeySchema: [
            { AttributeName: "id", KeyType: "HASH"},  //Partition key
        ],
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };
    dynamodb.createTable(params, function(err, data) {
        if (err) {
            console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
})();
*/
// docClient.put({
//     TableName: 'Notice',
//     Item: {
//         "id": "4",
//         "title": "4째 공지사항",
//         "registeredDate": "20190220",
//         "contents": "이것은 첫번째 공지사항입니다."
//     }
// }, function (err, data) {
//     if (err) {
//         console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
//     } else {
//         console.log("Added item:", JSON.stringify(data));
//     }
// });
// docClient.put({
//     TableName: 'Notice',
//     Item: {
//         "id": "5",
//         "title": "5번째 공지사항",
//         "registeredDate": "20190221",
//         "contents": "이것은 5번째 공지사항입니다."
//     }
// }, function (err, data) {
//     if (err) {
//         console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
//     } else {
//         console.log("Added item:", JSON.stringify(data));
//     }
// });
// docClient.put({
//     TableName: 'Notice',
//     Item: {
//         "id": "6",
//         "title": "6번째 공지사항",
//         "registeredDate": "201902121",
//         "contents": "이것은 6번째 공지사항입니다."
//     }
// }, function (err, data) {
//     if (err) {
//         console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
//     } else {
//         console.log("Added item:", JSON.stringify(data));
//     }
// });
// params = {
//     TableName : "AlrimTalk",
//     KeySchema: [
//         { AttributeName: "reservationKey", KeyType: "HASH"},  //Partition key
//     ],
//     AttributeDefinitions: [
//         { AttributeName: "reservationKey", AttributeType: "S" },
//     ],
//     ProvisionedThroughput: {
//         ReadCapacityUnits: 5,
//         WriteCapacityUnits: 5
//     }
// };
// dynamodb.createTable(params, function(err, data) {
//     if (err) {
//         console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
//     } else {
//         console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
//     }
// });
/*
var params = {
    TableName : "WebSecheduler",
    KeySchema: [
        { AttributeName: "email", KeyType: "HASH"},  //Partition key
    ],
    AttributeDefinitions: [
        { AttributeName: "email", AttributeType: "S" },
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
    }
};
dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
    }
});

var params = {
    TableName : "NoShowList",
    KeySchema: [
        { AttributeName: "noShowKey", KeyType: "HASH"},  //Partition key
    ],
    AttributeDefinitions: [
        { AttributeName: "noShowKey", AttributeType: "S" },
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
    }
};
dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
    }
});

//WebSecheduler Insert
var user = db.newWebUser({email: 'ksm@test.com', password: 'asd', shopName: '스마일네일샵'});

var params = {
    TableName: "WebSecheduler",
    Item: user
};

docClient.put(params, function(err, data) {
    if (err) {
        console.error("Unable to add WebUser", user, ". Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("PutItem succeeded:", user);
    }
});
*/

var params = {
    TableName: "WebSecheduler",
    Key: {
        'email': 'soonsm@gmail.com'
    },
    UpdateExpression: "set redNoticeList = :redNoticeList, password = :password, accountStatus = :accountStatus",
    ExpressionAttributeValues:{
        ":redNoticeList":[],
        ":password":'bc4a25d03e9c585ae8b360974c117bc0df87a30ae65eec780627cf0ae84cb49238033e35368279b84f7a64d86b593aef8d1084199b4001c3c669d20c40f41a28',
        ":accountStatus":0
    },
    ReturnValues:"UPDATED_NEW"
};
console.log("Updating the item...");
docClient.update(params, function(err, data) {
    if (err) {
        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
    }
});

/*
//예약정보 Insert
var reservation = db.newReservation({
    id: 'A1',
    manager: 'A1',
    start: moment().format('YYYYMMDD') + '1730',
    end: moment().format('YYYYMMDD') + '1800',
    contact: '01028904311',
    name: '김손님',
    contents: '패디큐어',
    etc: '회원권 3회 남음',
    status: 'RESERVED',
    cancelDate: null
});

var params = {
    TableName: "WebSecheduler",
    Key: {
        'email': 'ksm@test.com'
    },
    UpdateExpression: "set reservationList[0] = :reservation",
    ExpressionAttributeValues:{
        ":reservation":reservation
    },
    ReturnValues:"UPDATED_NEW"
};
console.log("Updating the item...");
docClient.update(params, function(err, data) {
    if (err) {
        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
    }
});

var staff = db.newStaff({
    id: 'A2',
    name: '정스탭2',
    color: "#009688"
});
var params = {
    TableName: "WebSecheduler",
    Key: {
        'email': 'ksm@test.com'
    },
    UpdateExpression: "set staffList[1] = :staff",
    ExpressionAttributeValues:{
        ":staff":staff
    },
    ReturnValues:"UPDATED_NEW"
};
console.log("Updating the item...");
docClient.update(params, function(err, data) {
    if (err) {
        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
    }
});


var noShow = db.newNoShow('01011115555', '잠수5');
noShow.noShowCount = 1;
docClient.put({
    TableName: 'NoShowList',
    Item: noShow
}, function (err, data) {
    if (err) {
        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Added item:", JSON.stringify(noShow));
    }
});
/*
var params = {
    TableName: "WebSecheduler",
    Key: {
        'email': 'ksm@test.com'
    },
    UpdateExpression: "set noShowList[0] = :noShow",
    ExpressionAttributeValues:{
        ":noShow":noShow
    },
    ReturnValues:"UPDATED_NEW"
};
console.log("Updating the item...");
docClient.update(params, function(err, data) {
    if (err) {
        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
    }
});
*/

// let addReservationCancelAlrimTalkHist = async function (email, alrimTalk) {
//     return await update({
//         TableName: process.nmns.TABLE.WebSecheduler,
//         Key: {
//             'email': email,
//         },
//         UpdateExpression: "set cancelAlrimTalkList = list_append(cancelAlrimTalkList, :alrimTalk)",
//         ExpressionAttributeValues: {
//             ":alrimTalk": [alrimTalk]
//         },
//         ReturnValues: "NONE"
//     });
// };
//
// let email = "soonsm@gmail.com";
//
// addReservationCancelAlrimTalkHist(email, {
//     "msg": "[스마일네일샵 예약안내]\n예약날짜: 09월19일\n예약시간: 11시00분\n안내말씀: 프로듀스 보자\n- 예약취소는 3시간전까지 가능합니다.\n- 예약취소를 원하실 때는 꼭 예약취소 버튼을 눌러주시기 바랍니다.",
//     "btn_urls1": "https://www.nomorenoshow.co.kr/web_cancel/key=soonsm@gmail.com3b0af3fd-1d7f-4631-b6dc-67aa726a3d1e&&email=soonsm@gmail.com",
//     "btn_urls2": "https://www.nomorenoshow.co.kr/web_cancel/key=soonsm@gmail.com3b0af3fd-1d7f-4631-b6dc-67aa726a3d1e&&email=soonsm@gmail.com",
//     "apiVersion": 1,
//     "phone": "01028904311",
//     "sendResult": true,
//     "btn_types": "웹링크",
//     "callback": "01028904311",
//     "reservation": {
//         "cancelDate": null,
//         "manager": "soonsm@gmail.com20180727214649252",
//         "start": "201809191100",
//         "type": "R",
//         "isAllDay": false,
//         "contents": "22233333444",
//         "etc": "뭐임마",
//         "contact": "01028904311",
//         "name": "김승민",
//         "end": "201809191130",
//         "id": "soonsm@gmail.com3b0af3fd-1d7f-4631-b6dc-67aa726a3d1e",
//         "memberId": "soonsm@gmail.com20180916093654.91230.757198615336367",
//         "status": "RESERVED"
//     },
//     "btn_txts": "예약취소",
//     "client_id": "soonsm",
//     "template_code": "A001"
// });