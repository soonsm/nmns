'use strict';

var AWS = require("aws-sdk");
var db = require('./../bin/webDb');
AWS.config.update({
    region: "eu-west-2",
    endpoint: "http://localhost:8000"
});
var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();

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

var user = db.newWebUser({email: 'test@test.com', password: 'asdfasdf1!', shopName: '스마일네일1샵'});

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

