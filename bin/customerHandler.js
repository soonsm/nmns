'use strict';

const db = require('./webDb');
const util = require('./util');
const hangul = require('hangul-js');

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
            resultData.totalNoShow = noShow.noShowCount;

            let myNoShowList = await db.getMyNoShow(email);
            resultData.myNoShow = myNoShowList.length;

            let reservationList = await db.getReservationList(email);
            await reservationList.sort((a, b) => {
                return a.start - b.start;
            });
            for(let i=reservationList.length-1; i >=0; i--){
                let reservation = reservationList[i];
                if(reservation.contact === contact){
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
                    if (member.contact.includes(contact)) {
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