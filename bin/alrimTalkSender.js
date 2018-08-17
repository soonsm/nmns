'use strict';

const moment = require('moment');
const util = require('./util');
const request = require('request');

const
    apiStoreId = 'soonsm',
    apiStoreKey = 'Nzc4MS0xNTIwNDI3MTgxMzc4LTMyMTQ4M2I1LTBiODUtNDYxNC05NDgzLWI1MGI4NWY2MTQzNw==';


async function sendAlrimTalk(param){
    return new Promise(resolve => {
        request({
            "uri": `http://api.apistore.co.kr/kko/1/msg/${apiStoreId}`,
            "headers": {'x-waple-authorization': apiStoreKey},
            "method": "POST",
            'form' : param
        }, (err, res, body) => {
            if (!err) {
                console.log('sendAlrimTalk sending result: ', body);
                if(JSON.parse(body).result_code === '200'){
                    resolve(true);
                }
                resolve(false);
            } else {
                console.error("Unable to send sendAlrimTalk:", err);
                resolve(false);
            }
        });
    });
}

exports.sendReservationCancelNotify =async function (user, reservation){

    let msg = `[${user.shopName} 예약취소알림]\n예약 취소를 알려드립니다.\n예약날짜: ${moment(reservation.start.substring(4,8), 'MMDD').format('MM[월]DD[일]')}\n예약시간: ${moment(reservation.start.substring(8,12),'HHmm').format('HH[시]mm[분]')} \n예약자 전화번호: ${util.formatPhone(reservation.contact)}`;

    console.log(msg);

    return await sendAlrimTalk({
        phone: user.alrimTalkInfo.callbackPhone,
        callback: '01028904311',
        msg: msg,
        template_code: 'A003',
        apiVersion: 1,
        client_id: apiStoreId
    });
};


exports.sendReservationConfirm = async function (user, reservation) {

    if(user.alrimTalkInfo.useYn === 'Y'){
        let msg = `[${user.shopName} 예약안내]\n예약날짜: ${moment(reservation.start.substring(4,8), 'MMDD').format('MM[월]DD[일]')}\n예약시간: ${moment(reservation.start.substring(8, 12),'HHmm').format('HH[시]mm[분]')}\n안내말씀: ${user.alrimTalkInfo.notice}\n- 예약취소는 ${user.alrimTalkInfo.cancelDue}전까지 가능합니다.\n- 예약취소를 원하실 때는 꼭 예약취소 버튼을 눌러주시기 바랍니다.`;

        console.log(msg);

        return await sendAlrimTalk({
            phone: reservation.contact,
            callback: '01028904311',
            msg: msg,
            template_code: 'A001',
            url: `https://www.nomorenoshow.co.kr/web_cancel/key=${reservation.id}&&email=${user.email}`,
            //url: `http://ec2-13-125-29-64.ap-northeast-2.compute.amazonaws.com/web_cancel/key=${reservation.id}&&email=${user.email}`,
            url_button_txt: '예약취소',
            apiVersion: 1,
            client_id: apiStoreId
        });
    }
};

