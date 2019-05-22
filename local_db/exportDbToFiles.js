'use strict';

const fs = require('fs');

var AWS = require("aws-sdk");
AWS.config.update({
    region: "ap-northeast-2"
    // region: "eu-west-2",
    // endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient({
    convertEmptyValues: true
});
function scan(params) {
    return new Promise((resolve => {
        docClient.scan(params, function (err, data) {
            if (err) {
                resolve(null);
            } else {
                resolve(data.Items);
            }
        });
    }));
}

function scanRaw(params) {
    return new Promise((resolve => {
        docClient.scan(params, function (err, data) {
            if (err) {
                resolve(null);
            } else {
                resolve(data);
            }
        });
    }));
}

// let tables = ['AlrimTalk', 'AlrimTalkUser', 'KaKaoUserList', 'NoShowList', 'Notice', 'WebSecheduler','SessionTable'];
let tables = ['WebSecheduler', 'SessionTable'];


(async function(){
    tables.forEach(async function(table){
        let items = [];

        let data = await scanRaw({
            TableName: table
        });

        data.Items.forEach(item => items.push(item));

        if(data.LastEvaluatedKey){
            data = await scanRaw({
                TableName: table,
                ExclusiveStartKey: data.LastEvaluatedKey
            });
        }

        data.Items.forEach(item => items.push(item));


        console.log(`${table} records: ${items.length}`);

        fs.writeFileSync(`${table}_db`, JSON.stringify(items));
    });
})();

//check
/*
(async function(){
    let items = await scan({
        TableName: 'SessionTable'
    });

    items.forEach(item => {
        console.log(JSON.stringify(item));
    })
})();
*/

/*
(async function(){
    tables.forEach(async function(table){
        let rawData = fs.readFileSync(`${table}_db`);
        let items = JSON.parse(rawData);

        items.forEach(item => {
            docClient.put({
                TableName: table,
                Item: item
            }, function (err, item) {
                if (err) {
                    console.error(`Error to add item. Error: ${JSON.stringify(err)}. item: ${JSON.stringify(item)}`);
                }
            });
        });
    });
})();
*/
