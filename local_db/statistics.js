'use strict';
var AWS = require("aws-sdk");
AWS.config.update({
    region: "ap-northeast-2"
});

var docClient = new AWS.DynamoDB.DocumentClient({
    convertEmptyValues: true
});

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

(async function(){
    let users = await scan({
        TableName: 'WebSecheduler'
    });
    let i=0;
    let numOfNoContact = 0;
    let num = 0;
    for (; i < users.length; i++) {
        let user = users[i];
        if(user.authStatus === 'EMAIL_VERIFICATED' && user.visitLog){
            let visitLog = user.visitLog;
            let lastVisit = visitLog[visitLog.length - 1];
            let rLength = user.reservationList.length;

            if(lastVisit > '20190714'){
                console.log(`${user.email} ${lastVisit} ${JSON.stringify(user.deviceHist)}`);
            }

        }


        // let sizeof = require('object-sizeof');
        // let size = sizeof(user)/1000;
        // if(size > 100){
        //     console.log(`${user.email} size: ${size}`);
        // }

        // let reservationList = user.reservationList;
        // num += reservationList.length;
        //
        // reservationList = reservationList.filter(reservation => !reservation.contact);
        //
        // if(reservationList.length > 0){
        //     console.log(`${user.email} size: ${reservationList.length}`);
        //     numOfNoContact += reservationList.length;
        // }
    }
    console.log(`total count is ${num} and total no contact count is ${numOfNoContact}`);
})();

// (async function(){
//     let users = await scan({
//         TableName: 'KaKaoUserList'
//     });
//     let count=0;
//     let count2=0
//     users.forEach(user => {
//         if(user.email){
//             count++;
//         }
//         if(user.lastVisitDate > '20190505'){
//             count2++;
//         }
//     })
//     console.log(`total email count is ${count} and recent visit user is ${count2}`);
// })();
