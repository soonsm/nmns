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
var params = {
    TableName : "KaKaoUserList",
    KeySchema: [
        { AttributeName: "userKey", KeyType: "HASH"},  //Partition key
    ],
    AttributeDefinitions: [
        { AttributeName: "userKey", AttributeType: "S" },
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
params = {
    TableName : "AlrimTalkUser",
    KeySchema: [
        { AttributeName: "key", KeyType: "HASH"},  //Partition key
    ],
    AttributeDefinitions: [
        { AttributeName: "key", AttributeType: "S" },
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
params = {
    TableName : "AlrimTalk",
    KeySchema: [
        { AttributeName: "reservationKey", KeyType: "HASH"},  //Partition key
    ],
    AttributeDefinitions: [
        { AttributeName: "reservationKey", AttributeType: "S" },
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
/*
var params = {
    TableName: "WebSecheduler",
    Key: {
        'email': 'ksm@test.com'
    },
    UpdateExpression: "set password = :reservation, authStatus = :authStatus",
    ExpressionAttributeValues:{
        ":reservation":'rlatmdals1#',
        ":authStatus":'BEFORE_EMAIL_VERIFICATION'
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