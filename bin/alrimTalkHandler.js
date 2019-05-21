'use strict';

const db = require('./webDb');
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

exports.getAlrimTalkHistory = async function (data) {
    let email = this.email;
    let status = true,
        message = null;
    let user = await db.getWebUser(email);

    if(data.start){
        data.start = data.start + '0000';
    }
    if(data.end){
        data.end = data.end + '9999';
    }

    let alrimTalkList = await user.reservationConfirmAlrimTalkList.filter(function (item) {
        let include = true;

        if (item.reservation) {
            if (data.contact && data.contact !== item.reservation.contact) {
                include = false;
            }
            if (item.sendDate) {
                if (data.start && data.start > item.sendDate) {
                    include = false;
                }
                if (data.end && data.end < item.sendDate) {
                    include = false;
                }
            }else{
                if (data.start && data.start > item.reservation.end) {
                    include = false;
                }
                if (data.end && data.end < item.reservation.start) {
                    include = false;
                }
            }
            if (data.name && data.name !== item.reservation.name) {
                include = false;
            }
            if(data.id && data.id !== item.reservation.memberId){
                include = false;
            }
        }else{
            include = false;
        }

        return include;
    }).map(function (item) {
        if(item.reservation){
            return {
                date: item.sendDate || item.reservation.start ,
                name: item.reservation.name,
                contact: item.reservation.contact,
                contents: item.msg
            }
        }
    }).filter(item => item !== undefined) || [];

    let cancelTalkList = await user.cancelAlrimTalkList.filter(function (item) {
        let include = true;

        if(item.reservation){
            if (data.contact && data.contact !== item.reservation.contact) {
                include = false;
            }
            if (item.sendDate) {
                if (data.start && data.start > item.sendDate) {
                    include = false;
                }
                if (data.end && data.end < item.sendDate) {
                    include = false;
                }
            }else{
                if (data.start && data.start > item.reservation.cancelDate) {
                    include = false;
                }
                if (data.end && data.end < item.reservation.cancelDate) {
                    include = false;
                }
            }
            if (data.name && data.name !== item.reservation.name) {
                include = false;
            }
            if(data.id && data.id !== item.reservation.memberId){
                include = false;
            }
        }else{
            include = false;
        }

        return include;
    }).map(function (item) {
        if(item.reservation){
            let date = item.sendDate;
            if (!date) {
                date = item.reservation.cancelDate + '1330';
            }
            return {
                date: date,
                name: user.shopName,
                contact: item.reservation.contact,
                contents: item.msg
            }
        }
    }).filter(item => item !== undefined) || [];

    let list = await alrimTalkList.concat(cancelTalkList).filter(function(item){
        if(item){
            return true;
        }
    });

    await list.sort(function (r1, r2) {
        return r2.date - r1.date;
    });

    return {
        status: status,
        data: list,
        message: message
    };
}
