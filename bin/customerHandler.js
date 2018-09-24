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
        resultData = [];

    let type = data.type;
    let target = data.target;

    if(!type){
        status = false;
        message = '검색 타입을 지정하세요.';
    }else{
        let user = await db.getWebUser(email);
        let memberList = user.memberList;
        if(target && target.trim().length > 0) {
            let filteredList = [];
            for (let i = 0; i < memberList.length; i++) {
                let member = memberList[i];
                if ((type === 'name' || type === 'all') && member.name && member.name.includes(target)) {
                    filteredList.push(member);
                }
                if ((type === 'contact' || type === 'all') && member.contact && member.contact.includes(target)) {
                    filteredList.push(member);
                }
                if ((type === 'manager' || type === 'all') && member.manager && member.manager === target) {
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
                let totalNoShow = await db.getNoShow(member.contact);
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

            let reservationList = await db.getReservationList(email);
            let staffList = await db.getStaffList(email);
            member.history = [];
            await reservationList.forEach(async function(reservation){
                if(reservation.memberId === member.id){

                    let manager = {};

                    for(let j=0; j<staffList.length;j++){
                        let staff = staffList[j];
                        if(staff.id === reservation.manager){
                            manager = staff;
                            break;
                        }
                    }

                    member.history.push({
                        date: reservation.start,
                        contents: reservation.contents,
                        status: reservation.status,
                        managerName: manager.name,
                        managerColor: manager.color,
                        managerId: manager.id
                    });
                }
            });

            await member.history.sort(function(r1,r2){
                return r2.date - r1.date;
            });
        }
        await memberList.sort(function(m1,m2){
            let name1 = m1.name || 'Z';
            let name2 = m2.name;
            let nameCompare = name1.localeCompare(name2);
            if(nameCompare === 0){
                if(m1.history.length > 0 && m2.history.length > 0){
                    return m2.history[0].date - m1.history[0].date;
                }else{
                    return nameCompare;
                }
            }else{
                return nameCompare;
            }
        })
        resultData = memberList;
    }

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

let saveCustomer = async function(data){
    let email = this.email;
    let status = true,
        message = '',
        resultData = {};
    let id = data.id;
    let name = data.name;
    let contact = data.contact;
    let managerId = data.managerId === '' ? undefined : data.managerId;


    if(!id && !name && !contact){
        status = false;
        message = '이름과 연락처 중 하나는 필수입니다.';
    }else if(contact && !util.phoneNumberValidation(contact)){
        status = false;
        message = '연락처가 올바르지 않습니다.(휴대전화번호로 숫자만 입력하세요.)';
    }else if(!(await db.addCustomer(email, id, name, contact, managerId, data.etc))){
        status = false;
        message = '시스템 에러로 추가하지 못했습니다.';
    }else{
        resultData.id = id;
        resultData.totalNoShow = 0;
        if(contact){
            let totalNoShow = await db.getNoShow(contact);
            if(totalNoShow){
                resultData.totalNoShow = totalNoShow.noShowCount;
            }
        }
    }

    return {
        status: status,
        data: resultData,
        message: message
    }
}

exports.addCustomer = saveCustomer;

exports.updateCustomer = saveCustomer;