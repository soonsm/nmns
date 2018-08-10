'use strict';

const db = require('./webDb');
const util = require('./util');

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

