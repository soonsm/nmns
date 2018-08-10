'use strict';

const db = require('./webDb');
const moment = require('moment');
const util = require('./util');
const sha256 = require('js-sha256');

exports.getNoShow = async function(data) {
    let status = true,
        message = null,
        resultData = null;
    let email = this.email;
    let contact = data.contact;

    console.log(data);

    if (!contact) {
        status = false;
        // message = '노쇼 조회에 필요한 데이터가 없습니다. ({"contact":${고객 모바일, string})';
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
        let summary = await db.getNoShow(contact);
        if (summary) {
            resultData.summary.noShowCount = summary.noShowCount;
            resultData.summary.lastNoShowDate = summary.lastNoShowDate;

            let myNoShowList = await db.getMyNoShow(email);
            let key = sha256(contact);
            let filteredList = [];
            for (let i = 0; i < myNoShowList.length; i++) {
                let noShow = myNoShowList[i];
                if (noShow.noShowKey === key) {
                    filteredList.push(noShow);
                }
            }
            await filteredList.sort((a,b)=>{
               return a.date - b.date;
            });
            resultData.detail = filteredList;
        }
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
    resultData = await db.addToNoShowList(this.email, contact, noShowCase, noShowDate, id);

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

    //validation
    if (!id) {
        status = false;
        // message = '노쇼 삭제에 필요한 데이터가 없습니다. ({"id":${노쇼ID, string}})';
        message = '노쇼 삭제를 위해 아이디가 필요합니다.';
    }

    let deleteResult = await db.deleteNoShow(this.email, id);
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