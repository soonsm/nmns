'use strict';

const db = require('./webDb');
const util = require('./util');
const hangul = require('hangul-js');
const sha256 = require('js-sha256');

exports.getCustomerDetail = async function(data){
    let email = this.email;
    let status = true, message, resultData = {};
    let contact = data.contact;

    if(contact){

        if(!util.phoneNumberValidation(contact)){
            status = false;
            message = `전화번호 형식이 올바르지 않습니다.(${contact})`;
        }

        if(status){

            let noShow = await db.getNoShow(contact);
            if(noShow){
                resultData.totalNoShow = noShow.noShowCount;
            }else{
                resultData.totalNoShow = 0;
            }

            let myNoShowList = await db.getMyNoShow(email);
            resultData.myNoShow = 0;
            let key = sha256(contact);
            for(let i=0; i < myNoShowList.length; i ++){
                if(key === myNoShowList[i].noShowKey){
                    resultData.myNoShow += 1;
                }
            }

            let reservationList = await db.getReservationList(email);
            await reservationList.sort((a, b) => {
                return a.start - b.start;
            });
            for(let i=reservationList.length-1; i >=0; i--){
                let reservation = reservationList[i];
                if(reservation.contact && reservation.contact === contact){
                    resultData.contact = reservation.contact;
                    resultData.isAllDay = reservation.isAllDay;
                    resultData.manager = reservation.manager;
                    resultData.contents = reservation.contents;
                    resultData.name = reservation.name;
                    resultData.etc = reservation.etc;

                    break;
                }
            }
        }

        return {
            status: status,
            message: message,
            data: resultData
        };
    }
};

exports.getCustomerInfo = async function (data) {
    let email = this.email;
    let status = true,
        message = '',
        resultData = {};
    let id = data.id;
    let contact = data.contact;
    let name = data.name;

    if (!id || (!contact && !name)) {
        status = false;
        // message = 'id는 필수이고 contact와 name은 둘 중 하나는 있어야 합니다.';
        message = '연락처 혹은 고객 이름 둘 중 하나는 필수입니다.';
    }

    if (status) {
        resultData.id = id;
        resultData.query = ((name === undefined || name === null || name === '') ? contact : name);
        let user = await db.getWebUser(email);
        if (user) {
            let memberList = user.memberList;
            let returnMemberList = [];
            for (let i = 0; i < memberList.length; i++) {
                let member = memberList[i];
                if (contact) {
                    if (member.contact && member.contact.includes(contact)) {
                        returnMemberList.push(member);
                    }
                }
                else {
                    if (member.name) {
                        if (hangul.search(member.name, name) !== -1) {
                            returnMemberList.push(member);
                        }
                        else {
                            //초성검색
                            let names = await hangul.disassemble(member.name, true).map(function (nameList) {
                                return nameList[0];
                            }).join('');
                            if (names.includes(hangul.disassemble(name).join(''))) {
                                returnMemberList.push(member);
                            }
                        }
                    }
                }

            }
            resultData.result = returnMemberList;
        }
    }

    return {
        status: status,
        data: resultData,
        message: message
    };
};

exports.getCustomerList = async function(data){
    let email = this.email;
    let status = true,
        message = '',
        resultData = {};
    /**
     * name, contact 둘 다 optional
     *
     * contact 먼저 있으면 조회
     *
     * name이 있으면 contact 일치하고 name도 일치하는 애로
     *
     * contact없으면 name으로만 조회
     */

    /**
     * 사전 검정
     * name, contact 둘 다 없으면 에러
     */

    let type = data.type;
    let target = data.target;

    if(!type){
        status = false;
        message = '검색 타입을 지정하세요.';
    }

    let user = await db.getWebUser(email);
    let memberList = user.memberList;
    if(target && target.trim().length > 0){
        let filteredList = [];
        for(let i=0; i< memberList.length; i++){
            let member = memberList[i];
            if((type === 'name' || type === 'all') && member.name && member.name.contains(target)){
                filteredList.push(member);
            }
            if((type === 'contact' || type === 'all') && member.contact && member.contact.contains(target)){
                filteredList.push(member);
            }
            if((type === 'manager' || type === 'all') && member.manager && member.manager === target){
                filteredList.push(member);
            }
        }
        memberList = filteredList;
    }

    for(let i=0;i<memberList.length; i++){
        let member = memberList[i];
        member.myNoShow = 0;
        member.totalNoShow = 0;
        if(member.contact){
            let totalNoShow = await db.getNoShow(data.contact);
            if(totalNoShow){
                member.totalNoShow = totalNoShow.noShowCount;
            }
            let myNoShowList = await db.getMyNoShow(email);
            let key = sha256(member.contact);
            let myNoShowCount = 0;
            for (let i = 0; i < myNoShowList.length; i++) {
                let noShow = myNoShowList[i];
                if (noShow.noShowKey === key) {
                    myNoShowCount++;
                }
            }
            member.myNoShow = myNoShowCount;
        }
    }

    //noshow 조회

    //history 조회


    resultData = [];
    resultData.push(getDummy());


    return {
        status: status,
        data: resultData,
        message: message
    }
};

function getDummy(){
    return {
        name: '김승민',
        contact: '01028904311',
        reservCount: 12,
        totalNoShow: 34,
        myNoShow: 30,
        etc: '외로움',
        history: [
            {
                data: '201809021330',
                managerName: '김스탭',
                managerColor: '#009688',
                contents: '브라질리언 왁싱',
                status: 'RESERVED'
            },
            {
                data: '201809011330',
                managerName: '정스탭',
                managerColor: '#009688',
                contents: '삭발',
                status: 'RESERVED'
            }
        ]
    },{
        name: '정태호',
        contact: '01011112222',
        reservCount: 3,
        totalNoShow: 1,
        myNoShow: 1,
        etc: '심심함',
        history: [
            {
                data: '201808231330',
                managerName: '김스탭',
                managerColor: '#009688',
                contents: '쏙 젤',
                status: 'RESERVED'
            },
            {
                data: '201808221330',
                managerName: '정스탭',
                managerColor: '#009688',
                contents: '손톱 다 뽑기',
                status: 'RESERVED'
            }
        ]
    };
}

exports.addCustomer = async function(data){
    let email = this.email;
    let status = true,
        message = '',
        resultData = {};
    let id = data.id;
    let name = data.name;
    let contact = data.contact;


    if(!id && !name && !contact){
        status = false;
        message = '이름과 연락처 중 하나는 필수입니다.';
    }else if(contact && !util.phoneNumberValidation(contact)){
        status = false;
        message = '연락처가 올바르지 않습니다.(휴대전화번호로 숫자만 입력하세요.)';
    }else if(!(await db.addCustomer(email, id, name, contact, data.manager, data.etc))){
        status = false;
        message = '시스템 에러로 추가하지 못했습니다.';
    }else{
        resultData.id = id;
    }


    return {
        status: status,
        data: resultData,
        message: message
    }

};