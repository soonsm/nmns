var AWS = require("aws-sdk");

AWS.config.update({
    region: "ap-northeast-2"
});

var docClient = new AWS.DynamoDB.DocumentClient({
    convertEmptyValues: true
});
var dynamodb = new AWS.DynamoDB();

let createTable = async function(){
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
};

(async function(){
    // await createTable();

    docClient.put({
        TableName: 'Notice',
        Item: {
            "id": "1",
            "title": "알림톡 다시 보내기 기능 추가!",
            "registeredDate": "20190226",
            "contents": "예약 상세화면의 '알림톡 다시 보내기' 버튼을 이용하여 고객에게 다시 한번 예약 내용을 알려주세요."
        }
    }, function (err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Added item:", JSON.stringify(data));
        }
    });
})();

