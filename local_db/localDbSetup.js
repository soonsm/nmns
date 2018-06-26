'use strict';

var AWS = require("aws-sdk");
var db = require('./../bin/webDb');
AWS.config.update({
    region: "eu-west-2",
    endpoint: "http://localhost:8000"
});
var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();
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
//예약정보 Insert
var reservation = db.newReservation({
    key: 'A1',
    manager: '정스탭',
    date: '20180630',
    time: '1730',
    elapsedTime: '0230',
    contact: '01028904311',
    name: '김손님',
    contents: '패디큐어',
    etc: {key: '회원권', value: '3회 남음'},
    isCanceled: false,
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
    key: 'A1',
    name: '정스탭'
});
var params = {
    TableName: "WebSecheduler",
    Key: {
        'email': 'ksm@test.com'
    },
    UpdateExpression: "set staffList[0] = :staff",
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
