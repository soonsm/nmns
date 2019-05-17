'use strict';

const logger = global.nmns.LOGGER;

const newDb = require('./newDb');
const moment = require('moment');
const util = require('./util');

exports.getNoShow = async function(data) {
    let status = true,
        message = null,
        resultData = null;
    let email = this.email;
    let contact = data.contact;

    logger.log(data);

    if (!contact) {
        status = false;
        message = '조회할 전화번호를 입력하세요.';
    }
    else if (!util.phoneNumberValidation(contact)) {
        message = `휴대전화번호 형식이 올바르지 않습니다.(${contact})`;
        status = false;
    }

    if (status) {
        resultData = {
            summary: {
                contact: contact,
                noShowCount: 0,
                lastNoShowDate: ''
            },
            detail: []
        };
        let noShowList = await newDb.getNoShow(contact);
        let numOfNoShow = noShowList.length;

        resultData.summary.noShowCount = numOfNoShow;
        if(numOfNoShow > 0){
            resultData.summary.lastNoShowDate = noShowList[numOfNoShow-1].date;
        }
        resultData.detail = noShowList.filter(noShow => noShow.email === email);
    }

    return {
        status: status,
        data: resultData,
        message: message
    };
};

exports.addNoShow = async function(data) {
    let status = true,
        message = null,
        resultData;
    const id = data.id;
    const contact = data.contact;
    const noShowCase = data.noShowCase;
    const noShowDate = data.date;
    const name = data.name;

    //validation
    if (!contact || !id) {
        status = false;
        // message = '노쇼 등록에 필요한 데이터가 없습니다. ({"id":${노쇼 ID, string}, "contact":${고객 모바일, string}, "noShowCase":${매장 코멘트, string, optional}, "date":${노쇼 날짜, string, YYYYMMDD}})';
        message = '노쇼 등록을 위해 전화번호와 노쇼 날짜를 입력하세요.';
    }
    else if (!util.phoneNumberValidation(contact)) {
        status = false;
        message = `휴대전화번호 형식이 올바르지 않습니다.(${contact})`;
    }
    else if (noShowDate && !moment(noShowDate, 'YYYYMMDD').isValid()) {
        status = false;
        message = `날짜 형식이 올바르지 않습니다.(${noShowDate})`;

    }
    resultData = await newDb.addNoShow(this.email, contact, noShowDate, noShowCase, id, name);

    if(!resultData){
        status = false;
        message = '노쇼 아이디가 겹칩니다.';
    }else{
        resultData.noShowCount = (await newDb.getNoShow(contact)).length;
        resultData.contact = contact;
    }

    return {
        status: status,
        data: resultData,
        message: message
    };
};

exports.delNoShow = async function(data) {
    let status = true,
        message = null;
    const id = data.id;

    if (!id) {
        status = false;
        message = '노쇼 삭제를 위해 아이디가 필요합니다.';
    }

    let deleteResult = await newDb.delNoShow(id);
    if (!deleteResult) {
        status = false;
        message = '내가 추가한 노쇼만 삭제 할 수 있습니다.';
    }

    return {
        status: status,
        data: {id: id},
        message: message
    };
};