'use strict';

var AWS = require("aws-sdk");
let awsConfig = {
    region: 'ap-northeast-2',
    endpoint: "http://localhost:8000"
};
AWS.config.update(awsConfig);
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
let update = function(params){
    dynamodb.updateTable(params, function(err, data) {
        if (err) {
            console.error("Unable to update table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Updated table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
};
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
    let params = {
        TableName: "NoShow",
        AttributeDefinitions:[
            {AttributeName: "hasMaskedPhone", AttributeType: "S"},
            {AttributeName: "timestamp", AttributeType: "S"}
        ],
        GlobalSecondaryIndexUpdates: [
            {
                Create: {
                    IndexName: "TimestampIndex",
                    KeySchema: [
                        {AttributeName: "hasMaskedPhone", KeyType: "HASH"}, //Partition key
                        {AttributeName: "timestamp", KeyType: "RANGE"}, //Sort key
                    ],
                    Projection: {
                        "ProjectionType": "ALL"
                    },
                    ProvisionedThroughput: {                                // Only specified if using provisioned mode
                        "ReadCapacityUnits": 1,"WriteCapacityUnits": 1
                    }
                }
            }
        ]
    };
    update(params);
})();
