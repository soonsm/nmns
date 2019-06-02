'use strict';

const db = require('./webDb');
const moment = require('moment');
const util = require('./util');
const emailValidator = require('email-validator');

exports.updatePwd = async function (data) {
    let status = true,
        message = null;
    let currentPassword = data.currentPassword;
    let newPassword = data.newPassword;
    if (!currentPassword || !newPassword) {
        status = false;
        message = '기존 비밀번호와 새 비밀번호를 입력하세요.';
    }
    else {
        if(newPassword === currentPassword){
            status = false;
            message = '기존 비밀번호와 새 비밀번호가 같습니다.';
        }

        let user = await db.getWebUser(this.email);
        if(util.sha512(currentPassword) === user.password){
            let strengthCheck = util.passwordStrengthCheck(newPassword);
            if (strengthCheck.result === false) {
                status = false;
                message = strengthCheck.message;
            }

            if (status) {
                if (!await db.updateWebUser(this.email, {password: util.sha512(newPassword)})) {
                    status = false;
                    message = '시스템 오류입니다.(DB Update Error)';
                }
            }
        }else{
            status = false;
            message = '기존 비밀번호가 일치하지 않습니다.';
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
        let noticeList = await db.getNoticeList() || [];
        let user = await db.getWebUser(this.email);

        let redNoticeList = user.redNoticeList || [];
        let newNoticeCnt = 0;
        for(let i=0;i<noticeList.length; i++){
            if(!redNoticeList.includes(noticeList[i].id)){
                newNoticeCnt++;
            }
        }
        resultData.newAnnouncement = newNoticeCnt;
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

/**
 * SNS 연동(네이버, 카카오)
 * 이미 계정이 있는 사용자가 네이버/카카오 계정과 연동하여 로그인 시 네이버/카카오 로그인을 사용하기 위함
 * 요청 위치 : 'link sns', 데이터 : {'snsLinkId': ${naver, kakao에서 할당한 사용자 식별 고유 값, string} 'snsType':${sns 종류(NAVER, KAKAO), string }, 'snsEmail':${SNS의 email, string, optional}}
 * 응답 형식 : 'data':{'snsLinkId':${naver, kakao에서 할당한 사용자 식별 고유 값, string}, 'snsType':${sns 종류(NAVER, KAKAO), string}}
 * 네이버 연동의 경우 HTTP로 요청(HTTP Post 6번 API)하고 응답만 Websocket을 통해 이 API 응답 형식으로 받는다.
 */
exports.linkSns = async function(data){
    let status=false, message;
    try{
        let user = await db.getWebUser(this.email);

        let snsLinkId = data.snsLinkId;
        let snsType = data.snsType;
        let snsEmail = data.snsEmail;

        if(!snsLinkId){
            throw 'snsLinkId가 없습니다.';
        }else if(!process.nmns.isValidSnsType(snsType)){
            throw `snsType은 NAVER 또는 KAKAO만 가능합니다.(${snsType})`;
        }else if(snsEmail && !emailValidator.validate(snsEmail)){
            throw `이메일이 올바르지 않습니다.(${snsEmail})`;
        }


        let dbResult1 = await db.setSnsLink({
            snsLinkId: snsLinkId,
            snsType: snsType,
            snsEmail: snsEmail,
            email: this.email
        });

        let dbResult2 = await db.updateWebUser(user.email, {snsType: snsType, snsLinkId: snsLinkId, snsEmail: snsEmail});

        if(!dbResult1 || !dbResult2){
            throw 'DB 저장에 실패했습니다.';
        }

        message = '연동 성공';
        status = true;
    }catch(e){
        message = e;
        status = false;
    }

    return{
        status: status,
        data: data,
        message: message
    };
}