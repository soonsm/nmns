'use strict';

const moment = require('moment');
const util = require('./util');
const request = require('request');
const db = require('./newDb');

const
    apiStoreId = process.env.ALRIMTALK_ID,
    apiStoreKey = process.env.ALRIMTALK_KEY;

const logger = global.nmns.LOGGER;

async function sendAlrimTalk(param){
    if (process.env.NODE_ENV == process.nmns.MODE.PRODUCTION) {
        return new Promise(resolve => {
            request({
                "uri": `http://api.apistore.co.kr/kko/1/msg/${apiStoreId}`,
                "headers": {'x-waple-authorization': apiStoreKey},
                "method": "POST",
                'form' : param
            }, (err, res, body) => {
                if (!err) {
                    logger.log('sendAlrimTalk sending result: ', body);
                    if(JSON.parse(body).result_code === '200'){
                        resolve(true);
                    }
                    resolve(false);
                } else {
                    logger.error("Unable to send sendAlrimTalk:", err);
                    resolve(false);
                }
            });
        });
    } else if (process.env.NODE_ENV == process.nmns.MODE.DEVELOPMENT) {
        return true;
    }
}
exports.sendReservationConfirm = async function (user, reservation) {

    if(user.alrimTalkInfo.useYn === 'Y'){
        // let msg = `[${user.shopName} 예약안내]\n예약날짜: ${moment(reservation.start.substring(4,8), 'MMDD').format('MM[월]DD[일]')}\n예약시간: ${moment(reservation.start.substring(8, 12),'HHmm').format('HH[시]mm[분]')}\n안내말씀: ${user.alrimTalkInfo.notice}\n- 예약취소는 ${user.alrimTalkInfo.cancelDue}전까지 가능합니다.\n- 예약취소를 원하실 때는 꼭 예약취소 버튼을 눌러주시기 바랍니다.`;
        let msg = `[${user.shopName} 예약안내]\n\n${user.alrimTalkInfo.notice}\n\n예약날짜 : ${moment(reservation.start.substring(0,8), 'YYYYMMDD').format('YYYY[년] MM[월] DD[일]')}\n예약시간 : ${moment(reservation.start.substring(8, 12),'HHmm').format('HH[시] mm[분]')} ~ ${moment(reservation.end.substring(8, 12),'HHmm').format('HH[시] mm[분]')}\n\n- 예약취소는 ${user.alrimTalkInfo.cancelDue}전까지 가능합니다.\n- 예약취소를 원하실 때는 꼭 예약취소 버튼을 눌러주시기 바랍니다.`;
        // logger.log(msg);

        let param = {
            phone: reservation.contact,
            callback: '01028904311',
            msg: msg,
            template_code: 'C02',
            btn_types: '웹링크',
            btn_txts: '예약취소',
            btn_urls1: `http://washow.ga/web_cancel/key=${reservation.id}&&email=${user.email}`,
            btn_urls2: `http://washow.ga/web_cancel/key=${reservation.id}&&email=${user.email}`,
            //url: `http://ec2-13-125-29-64.ap-northeast-2.compute.amazonaws.com/web_cancel/key=${reservation.id}&&email=${user.email}`,
            apiVersion: 1,
            client_id: apiStoreId
        };

        let result = await sendAlrimTalk(param);
        await db.addAlrmTalk({
            email: user.email,
            isCancel: false,
            contact: reservation.contact,
            name: reservation.name,
            contents: msg,
            reservationKey: reservation.id
        });
        return result;
    }
};

/**
 * 모바일 전용 알림톡 전송
 */
exports.sendReservationConfirmKaKao =  async function(user, alrimTalk) {

    let msg = `[${user.shopName} 예약안내]\n예약날짜: ${moment(alrimTalk.reservationDate, 'MMDD').format('MM[월]DD[일]')}\n예약시간: ${moment(alrimTalk.reservationTime,'HHmm').format('HH[시]mm[분]')}\n안내말씀: ${user.messageWithConfirm}\n- 예약취소는 ${user.cancelDue}전까지 가능합니다.\n- 예약취소를 원하실 때는 꼭 예약취소 버튼을 눌러주시기 바랍니다.`;

    return await sendAlrimTalk({
        phone: alrimTalk.receiverPhone,
        callback: '01028904311',
        msg: msg,
        template_code: 'A002',
        btn_types: '웹링크',
        btn_txts: '예약취소',
        btn_urls1: `https://www.nomorenoshow.co.kr/cancel/key=${alrimTalk.reservationKey}`,
        btn_urls2: `https://www.nomorenoshow.co.kr/cancel/key=${alrimTalk.reservationKey}`,
        apiVersion: 1,
        client_id: apiStoreId
    });
};

exports.sendReservationCancelNotify =async function (user, reservation){

    let msg = `[${user.shopName} 예약취소알림]\n예약 취소를 알려드립니다.\n예약날짜: ${moment(reservation.start.substring(4,8), 'MMDD').format('MM[월]DD[일]')}\n예약시간: ${moment(reservation.start.substring(8,12),'HHmm').format('HH[시]mm[분]')} \n예약자 전화번호: ${util.formatPhone(reservation.contact)}`;

    logger.log(msg);

    let param = {
        phone: user.alrimTalkInfo.callbackPhone,
        callback: '01028904311',
        msg: msg,
        template_code: 'A003',
        apiVersion: 1,
        client_id: apiStoreId
    };

    let result = await sendAlrimTalk(param);
    await db.addAlrmTalk({
        email: user.email,
        isCancel: true,
        contact: reservation.contact,
        name: user.shopName || user.email,
        contents: msg,
        reservationKey: reservation.id
    });
    return result;
};




