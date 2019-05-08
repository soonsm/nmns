var AWS = require("aws-sdk");

AWS.config.update({
    region: "ap-northeast-2"
});

var docClient = new AWS.DynamoDB.DocumentClient({
    convertEmptyValues: true
});
var dynamodb = new AWS.DynamoDB();

function query(params) {
    return new Promise((resolve => {
        docClient.query(params, function (err, data) {
            if (err) {
                console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
                resolve(null);
            } else {
                console.log("Query succeeded. Data:", data.Items);
                resolve(data.Items);
            }
        });
    }));
};
function scan(params) {
    return new Promise((resolve => {
        docClient.scan(params, function (err, data) {
            if (err) {
                console.log("Unable to scan. Error:", JSON.stringify(err, null, 2));
                resolve(null);
            } else {
                // console.log("Scan succeeded. Data:", data.Items);
                resolve(data.Items);
            }
        });
    }));
}

function update(params) {
    return new Promise((resolve => {
        docClient.update(params, function (err, data) {
            if (err) {
                console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                resolve(false);
            } else {
                console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
                resolve(true);
            }
        });
    }));
}
/*
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
*/

/*
let getWebUser = async function (email) {
    let items = await query({
        TableName: 'WebSecheduler',
        KeyConditionExpression: "#key = :val",
        ExpressionAttributeNames: {
            "#key": "email"
        },
        ExpressionAttributeValues: {
            ":val": email
        }
    });

    return items[0];
};
let updateWebUser = async function (email, properties) {
    let params = {
        TableName: 'WebSecheduler',
        Key: {
            'email': email
        },
        ExpressionAttributeValues: {},
        ReturnValues: "NONE"
    };
    let updateExpression = 'set ';
    let propertyNames = Object.getOwnPropertyNames(properties);
    for (let i = 0; i < propertyNames.length; i++) {
        let property = propertyNames[i];
        updateExpression += `${property} = :${property}`;
        if (i < propertyNames.length - 1) {
            updateExpression += ',';
        }

        params.ExpressionAttributeValues[`:${property}`] = properties[property];
    }
    params.UpdateExpression = updateExpression;

    return await update(params);
};
(async function(){
    let user = await getWebUser('kimnari405@naver.com');

    user.reservationConfirmAlrimTalkList.splice(0,110);

    await updateWebUser(user.email, {reservationConfirmAlrimTalkList: user.reservationConfirmAlrimTalkList});
})();*/


//simbbo89@naver.com 만촌점

(async function(){
    let users = await scan({
        TableName: 'WebSecheduler'
    });

    let i=0;
    for (; i < users.length; i++) {
        let user = users[i];

        if(user.feedback && user.feedback.length > 0) {
            console.log(`${user.email}'s feedback:`);
            user.feedback.forEach(feedback => {
                console.log(feedback);
            })
        }
    }
})();