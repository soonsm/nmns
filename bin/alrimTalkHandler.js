'use strict';

const logger = global.nmns.LOGGER;

const db = require('./webDb');
const newDb = require('./newDb');
const util = require('./util');

//미사용
exports.getAlirmTalkInfo = async function () {
    let status = true,
        message = null;
    let resultData = await db.getWebUser(this.email);
    if (!resultData) {
        status = false;
        message = '잘못된 접근입니다.';
    }

    return {
        status: status,
        message: message,
        data: resultData.alrimTalkInfo
    };
};

exports.updateAlrimTalkInfo = async function (data) {
    let email = this.email;
    let status = true,
        message = null;
    let user = await db.getWebUser(email);
    let alrimTalkInfo = user.alrimTalkInfo;

    if (data.useYn && data.useYn !== 'Y' && data.useYn !== 'N') {
        status = false;
        // message = `useYn은 Y 또는 N 값만 가질 수 있습니다.(${data.useYn})`;
        message = `알림톡 사용여부 값이 잘못됐습니다.(${data.useYn})`;
    }
    else if (data.callbackPhone && !util.phoneNumberValidation(data.callbackPhone)) {
        status = false;
        // message = `callbackPhone이 전화번호 형식에 맞지 않습니다.(${data.callbackPhone})`;
        message = `휴대폰 번호 형식에 맞지 않습니다.(${data.callbackPhone})`;
    }

    if (status && alrimTalkInfo.useYn === 'N' && data.useYn === 'Y') {
        //알림톡 미사용 -> 사용으로 변경 할 때
        if (!alrimTalkInfo.callbackPhone && !data.callbackPhone) {
            status = false;
            // message = '알림톡 미사용에서 사용으로 변경 할 때는 DB에 또는 업데이트 요청에 callbackPhone에 전화번호가 있어야 합니다.';
            message = '알림톡 미사용에서 사용으로 변경 할 때는 휴대폰 번호가 있어야 합니다.';
        }
    }

    if (status) {
        for (let x in alrimTalkInfo) {
            alrimTalkInfo[x] = data[x] || alrimTalkInfo[x];
        }
        if (!await db.updateWebUser(email, {alrimTalkInfo: alrimTalkInfo})) {
            status = false;
            message = '시스템 오류입니다.(DB Update Error)';
        }
    }

    return {
        status: status,
        data: null,
        message: message
    };
};

/**
 * 알림톡 이력 조회
 요청 위치 : "get alrim history",
 데이터 : {"start":${조회 시작일자, YYYYMMDD, string, optional}, "end":${조회 종료일자, YYYYMMDD, string, optional}, "contact":${보낸 연락처, string, optional}}
 응답 형식 : "data":[{"date":${전송 일시, YYYYMMDDHHmm, string}, "name":${고객 이름, string}, "contact":${고객 연락처, string}, "contents": ${알림톡 내용, string, optional}}]
 취소알림이나 예약알림이나 상관없이 전송일시 내림차순 정렬 / 취소알림일 경우 매장이름을 고객이름에 넣어줌
 요청 데이터 없으면 전체 조회
 */
exports.getAlrimTalkHistory = async function (data) {
    let email = this.email;
    let status, message, list;

    try{
        list = await newDb.getAlrimTalkList(email, data.start, data.end);
        if(data.target){
            list = list.filter((item)=> {
                try{
                    if(item.name && item.name.includes(data.target)){
                        return true;
                    }
                    if(item.contact && item.contact.includes(data.target)){
                        return true;
                    }
                }catch(e){
                    logger.error(e);
                }
                return false;
            })
        }
        status = true;
    }catch(e){
        status = false;
        message = e;
    }

    return {
        status: status,
        data: list,
        message: message
    };
}
