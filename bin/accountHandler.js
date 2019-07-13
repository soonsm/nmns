'use strict';

const db = require('./webDb');
const newDb = require('./newDb');
const moment = require('moment');
const util = require('./util');
const emailValidator = require('email-validator');
const AWS = require('aws-sdk');
AWS.config.update({
    region: "ap-northeast-2",
    endpoint: null
});
const fs = require('fs');

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
        let user = await db.getWebUser(this.email);

        let lastRedNoticeId = user.lastRedNoticeId || 0;
        let notices = await newDb.getNotice(1, 1000);
        notices = notices.filter(notice => notice.email === 'notice' && notice.id > lastRedNoticeId) || [];

        resultData.newAnnouncement = notices.length;

        if(user.logoFileName){
            let baseUrl = 'https://s3.ap-northeast-2.amazonaws.com/file.washow.co.kr/';
            if (process.env.NODE_ENV != process.nmns.MODE.PRODUCTION) {
                baseUrl = '/'
            }
            resultData.logo = baseUrl + user.logoFileName;
        }
		if(user.isKaKaoLink){
			resultData.kakaotalk = true;
		}
		if(user.isNaverLink){
			resultData.naver = true;
		}

        if(user.originalLogoFileName){
            resultData.logoFileName = user.originalLogoFileName;
        }
    }

    return {
        status: status,
        data: resultData,
        message: message
    };
};


let upload = function(fileName, data, type){
    let baseUrl = 'https://s3.ap-northeast-2.amazonaws.com/file.washow.co.kr/';
    return new Promise((resolve) => {
        if (process.env.NODE_ENV == process.nmns.MODE.PRODUCTION) {
            let s3 = new AWS.S3({apiVersion: '2006-03-01'});
            let params = {
                Bucket: "file.washow.co.kr",
                Key: fileName,
                ACL: 'public-read-write',
                Body: data,
                ContentType: type.mime
            };
            s3.upload(params, function(err, data) {
                if(!err){
                    resolve(baseUrl + fileName);
                }else{
                    resolve(false);
                }
            });
        }else{
            baseUrl = '/'
            fs.writeFile('uploads/'+fileName, data, function(err){
                if(!err){
                    resolve(baseUrl + fileName);
                }else{
                    resolve(false);
                }
            });
        }
    });
}
/**
 * 로고 파일 업로드
 * 요청 위치 : "upload logo", 데이터 : javascript file object
 * 응답 형식 : "data":{logo:${로고파일 경로, string}}
 */
exports.uploadLogo = async function(data){
    let status = false, resultData = {}, message;
    let email = this.email;

    try{
        let fileData = data.fileData;
        let originalFileName = data.fileName;

        if(!fileData || !originalFileName){
            throw `fileData 혹은 fileName이 없습니다.`;
        }

        const fileType = require('file-type');

        let type = fileType(data.fileData); // ext, mime
				//file name : data.fileName
        let fileName = email + moment().format('YYYYMMDDHHmmssSSS')+ '.' + type.ext;

        let logoUrl = await upload(fileName, fileData, type);
        if(!logoUrl){
            throw '이미지 등록 실패';
        }

        resultData.logo = logoUrl;

        let user = await db.getWebUser(email);
        user.logoFileName = fileName;

        await db.updateWebUser(email, {logoFileName: fileName, originalLogoFileName: originalFileName});
        status = true;
    }catch(e){
        status = false;
        message = e;
    }

    return {
        status: status,
        data: resultData,
        message: message
    };
}

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
    if(params.logo === null){
        data.logoFileName = null;
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

        let snsLinkId = data.snsLinkId + "";
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
		let snsLink = {};
		if(snsType === process.nmns.SNS_TYPE.KAKAO){
			snsLink.isKaKaoLink = true;
		}else{
			snsLink.isNaverLink = true;
		}
		
        let dbResult2 = await db.updateWebUser(user.email, snsLink);

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