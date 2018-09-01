'use strict';

const db = require('./webDb');
const moment = require('moment');
const util = require('./util');

exports.updatePwd = async function (data) {
    let status = true,
        message = null;
    let pwd = data.password;
    if (!pwd) {
        status = false;
        // message = '비밀번호 변경에 필요한 데이터가 없습니다.({"password":${변경할 패스워드, string}})';
        message = '새 비밀번호를 입력하세요.';
    }
    else {
        let strengthCheck = util.passwordStrengthCheck(pwd);
        if (strengthCheck.result === false) {
            status = false;
            message = strengthCheck.message;
        }

        if (status) {
            if (!await db.updateWebUser(this.email, {password: util.sha512(pwd)})) {
                status = false;
                message = '시스템 오류입니다.(DB Update Error)';
            }
        }
    }

    return {
        status: status,
        message: message,
        data: null
    };
};

exports.getShop = async function () {
    let status = true,
        message = null;
    let resultData = await db.getShopInfo(this.email);
    if (!resultData) {
        status = false;
        message = '잘못된 접근입니다.';
    }
    else {
        if(resultData.isFirstVisit){
            await db.updateWebUser(this.email, {isFirstVisit: false});
        }
    }

    return {
        status: status,
        data: resultData,
        message: message
    };
};

exports.updateShop = async function (params) {
    let status = true,
        message = null,
        data = {};

    /**
     * Update 가능 properties
     * bizBeginTime, bizEndTime, shopName, bizType
     */
    let updateProperties = ['bizBeginTime', 'bizEndTime', 'shopName', 'bizType'];
    for (let i = 0; i < updateProperties.length; i++) {
        let property = updateProperties[i];
        if (params.hasOwnProperty(property)) {
            data[property] = params[property];
        }
    }
    let user = await db.getWebUser(this.email);
    if (!user) {
        status = false;
        message = '잘못된 접근입니다';
    }
    if (status) {
        if (data.bizBeginTime && !moment(data.bizBeginTime, 'HHmm').isValid()) {
            status = false;
            // message = 'bizBeginTime 시간 포맷이 올바르지 않습니다.(HHmm):' + data.bizBeginTime;
            message = `매장운영시간이 잘못됐습니다.(${data.bizBeginTime})`;
        }
        else if (data.bizEndTime && !moment(data.bizEndTime, 'HHmm').isValid()) {
            status = false;
            // message = 'bizEndTime 시간 포맷이 올바르지 않습니다.(HHmm):' + data.bizEndTime;
            message = `매장운영시간이 잘못됐습니다.(${data.bizEndTime})`;
        }

        if (status) {
            if (!await db.updateWebUser(this.email, data)) {
                status = false;
                message = '시스템 오류입니다.(DB Update Error)';
            }
        }
    }
    return {
        status: status,
        data: null,
        message: message
    };
};