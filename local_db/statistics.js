'use strict';

var AWS = require("aws-sdk");

AWS.config.update({
    region: "ap-northeast-2"
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
/*
(async function(){
    let users = await scan({
        TableName: 'WebSecheduler'
    });

    let i=0;
    for (; i < users.length; i++) {
        let user = users[i];

        // if(user.authStatus === 'EMAIL_VERIFICATED' && user.visitLog){
        //     let visitLog = user.visitLog;
        //     let lastVisit = visitLog[visitLog.length - 1];
        //     let rLength = user.reservationList.length;
        //
        //     if(lastVisit > '20190401' && rLength > 0){
        //         console.log(`${user.email} ${lastVisit} ${rLength}`);
        //     }
        //
        // }

        if(user.memberList){
            user.memberList.forEach(member => {
                if(member.etc){
                    console.log(member.etc);
                }
            });
        }

    }

    console.log(`total count is ${i}`);
})();
*/

(async function(){
    let users = await scan({
        TableName: 'KaKaoUserList'
    });

    let count=0;
    users.forEach(user => {
        if(user.email){
            count++;
        }
    })

    console.log(`total count is ${count}`);
})();

