'use strict';

const db = require('./webDb');
const moment = require('moment');
const util = require('./util');
const emailSender = require('./emailSender');
const passportSocketIo = require('passport.socketio');
const alrimTalk = require('./alrimTalk');
const hangul = require('hangul-js');


const GetReservationList = 'get reserv', GetReservationSummaryList = 'get summary', AddReservation = 'add reserv',
    UpdateReservation = 'update reserv';
const GetNoShow = 'get noshow', AddNoShow = 'add noshow', DelNoShow = 'delete noshow';
const GetManagerList = 'get manager', AddManager = 'add manager', UpdateManager = 'update manager',
    DelManager = 'delete manager';
const GetShop = 'get info', UpdateShop = 'update info', UpdatePwd = 'update password';
const GetAlrimTalk = 'get alrim', UpdateAlirmTalk = 'update alrim';
const SendVerification = 'send verification';
const GetCustomInfo = 'get customer info';

const EVENT_LIST_NO_NEED_VERIFICATION = [SendVerification, GetNoShow, AddNoShow, DelNoShow, GetManagerList, AddManager, UpdateManager, DelManager, GetShop, UpdateShop, UpdatePwd];

module.exports = function (server, sessionStore, passport, cookieParser) {
    var io = require('socket.io')(server);

    // io.use(passportSocketIo.authorize({
    //     key: 'connect.sid',
    //     secret: 'rilahhuma',
    //     store: sessionStore,
    //     passport: passport,
    //     cookieParser: cookieParser
    // }));

    io.on('connection', async function (socket) {
        // const user = socket.request.user;
        // const email = user.email;

        var email = 'ksm@test.com';
        var user = await db.getWebUser(email);
        user.authStatus = 'EMAIL_VERIFICATED';
        console.log('socket io email:', email);

        // if(!email || !socket.request.user.logged_in){
        //     console.log(`User ${email} is not logged in`);
        //     return;
        // }

        const addEvent = function (eventName, fn) {
            socket.on(eventName, async function (data) {
                if (user.authStatus !== 'EMAIL_VERIFICATED' && !EVENT_LIST_NO_NEED_VERIFICATION.includes(eventName)) {
                    socket.emit(eventName, makeResponse(false, null, '이메일 인증 후 사용하시기 바랍니다.'));
                } else {
                    try{
                        await fn(data);
                    }catch(e){
                        socket.emit(eventName, makeResponse(false, data, '시스템 에러로 처리하지 못했습니다.'));
                    }
                }
            });
        };

        addEvent(SendVerification, async function () {
            let status = true, message = `인증 이메일이 ${email}로 전송되었습니다.`;

            const emailAuthToken = require('js-sha256')(email);
            if (!(await emailSender.sendEmailVerification(email, emailAuthToken))) {
                status = false;
                message = '인증 이메일 전송이 실패하였습니다.';
            }

            socket.emit(SendVerification, makeResponse(status, null, message));
        });

        /**
         * 고객정보
         */
        addEvent(GetCustomInfo, async function (data) {
            let status = true, message = '', resultData = {};
            let id = data.id;
            let contact = data.contact;
            let name = data.name;

            if(!id || (!contact && !name)){
                status = false;
                message = 'id는 필수이고 contact와 name은 둘 중 하나는 있어야 합니다.';
            }

            if(status){
                resultData.id = id;
                resultData.query = ((name === undefined || name === null || name === '') ? contact : name);
                let user = await db.getWebUser(email);
                if (user) {
                    let memberList = user.memberList;
                    let returnMemberList = [];
                    for(let i=0;i<memberList.length;i++){
                        let member = memberList[i];
                        if(contact){
                            if(member.contact.includes(contact)){
                                returnMemberList.push(member);
                            }
                        }else{
                            if(member.name){
                                if(hangul.search(member.name,name) !== -1){
                                    returnMemberList.push(member);
                                }else{
                                    //초성검색
                                    let names = await hangul.disassemble(member.name, true).map(function(nameList){
                                        return nameList[0];
                                    }).join('');
                                    if(names.includes(hangul.disassemble(name).join(''))){
                                        returnMemberList.push(member);
                                    }
                                }
                            }
                        }

                    }
                    resultData.result = returnMemberList;
                }
            }

            socket.emit(GetCustomInfo, makeResponse(status, resultData, message));
        })

        /**
         * AlrimTalk
         */
        addEvent(GetAlrimTalk, async function () {
            let status = true, message = null;
            let resultData = await db.getWebUser(email);
            if (!resultData) {
                status = false;
                message = '잘못된 접근입니다.';
            }

            socket.emit(GetAlrimTalk, makeResponse(status, resultData.alrimTalkInfo, message));
        });

        addEvent(UpdateAlirmTalk, async function (data) {
            let status = true, message = null;
            let alrimTalkInfo = user.alrimTalkInfo;

            if (data.useYn && data.useYn !== 'Y' && data.useYn !== 'N') {
                status = false;
                message = `useYn은 Y 또는 N 값만 가질 수 있습니다.(${data.useYn})`;
            } else if (data.callbackPhone && !util.phoneNumberValidation(data.callbackPhone)) {
                status = false;
                message = `callbackPhone이 전화번호 형식에 맞지 않습니다.(${data.callbackPhone})`;
            }

            if (status && alrimTalkInfo.useYn === 'N' && data.useYn === 'Y') {
                //알림톡 미사용 -> 사용으로 변경 할 때
                if (!alrimTalkInfo.callbackPhone && !data.callbackPhone) {
                    status = false;
                    message = '알림톡 미사용에서 사용으로 변경 할 때는 DB에 또는 업데이트 요청에 callbackPhone에 전화번호가 있어야 합니다.';
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

            socket.emit(UpdateAlirmTalk, makeResponse(status, null, message));

        });

        /**
         * Shop & Account
         */
        addEvent(UpdatePwd, async function (data) {
            let status = true, message = null;
            let pwd = data.password;
            if (!pwd) {
                status = false;
                message = '비밀번호 변경에 필요한 데이터가 없습니다.({"password":${변경할 패스워드, string}})';
            } else {
                let strengthCheck = util.passwordStrengthCheck(pwd);
                if (strengthCheck.result === false) {
                    status = false;
                    message = strengthCheck.message;
                }

                if (status) {
                    if (!await db.updateWebUser(email, {password: pwd})) {
                        status = false;
                        message = '시스템 오류입니다.(DB Update Error)';
                    }
                }
            }
            socket.emit(UpdatePwd, makeResponse(status, null, message));
        });

        addEvent(GetShop, async function () {
            let status = true, message = null;
            let resultData = await db.getWebUser(email);
            if (!resultData) {
                status = false;
                message = '잘못된 접근입니다.';
            } else {
                delete resultData.password;
            }

            socket.emit(GetShop, makeResponse(status, resultData, message));
        });

        addEvent(UpdateShop, async function (params) {
            let status = true, message = null, data = {};

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
            let user = await db.getWebUser(email);
            if (!user) {
                status = false;
                message = '잘못된 접근입니다';
            }
            if (status) {
                if (data.bizBeginTime && !moment(data.bizBeginTime, 'HHmm').isValid()) {
                    status = false;
                    message = 'bizBeginTime 시간 포맷이 올바르지 않습니다.(HHmm):' + data.bizBeginTime;
                } else if (data.bizEndTime && !moment(data.bizEndTime, 'HHmm').isValid()) {
                    status = false;
                    message = 'bizEndTime 시간 포맷이 올바르지 않습니다.(HHmm):' + data.bizEndTime;
                }

                if (status) {
                    if (!await db.updateWebUser(email, data)) {
                        status = false;
                        message = '시스템 오류입니다.(DB Update Error)';
                    }
                }
            }

            socket.emit(UpdateShop, makeResponse(status, null, message));

        });

        /**
         * Reservation
         */

        addEvent(GetReservationSummaryList, async function (data) {

            let status = true, message = null, resultData = null;
            let params = data || {};

            if (params.start && !moment(params.start, 'YYYYMMDDHHmm').isValid()) {
                status = false;
                message = `조회하려는 날짜가 날짜 형식에 맞지 않습니다.(YYYMMDDHHmm) start:${params.start}`;
            }
            if (params.end && !moment(params.end, 'YYYYMMDDHHmm').isValid()) {
                status = false;
                message = `조회하려는 날짜가 날짜 형식에 맞지 않습니다.(YYYMMDDHHmm) start:${params.end}`;
            }
            if (params.contact && !util.phoneNumberValidation(params.contact)) {
                status = false;
                message = `휴대전화번호 형식이 올바르지 않습니다.(${params.contact})`;
            }
            if (status) {
                resultData = await db.getReservationSummaryList(email, params);
            }

            socket.emit(GetReservationSummaryList, makeResponse(status, resultData, message));

        });

        addEvent(GetReservationList, async function (data) {
            let status = true;
            let message = null;
            let resultData = null;
            console.log(data);
            if (!data || !data.start || !data.end) {
                message = '예약정보 조회에 필요한 데이터가 없습니다.({"start":${조회 시작 일자, string, YYYYMMDDHHmm}, "end":${조회 종료 일자, string, YYYYMMDDHHmm}})'
                status = false;
            } else if (!moment(data.start, 'YYYYMMDDHHmm').isValid() || !moment(data.end, 'YYYYMMDDHHmm').isValid()) {
                message = `조회하려는 날짜가 날짜 형식에 맞지 않습니다.(YYYMMDDHHmm) start:${data.start}, end:${data.end}`;
                status = false;
            }

            if (status) {
                resultData = await db.getReservationList(email, data.start, data.end);
            }

            let response = makeResponse(status, resultData, message);
            response.holiday = getHolidays(data.start, data.end);

            socket.emit(GetReservationList, response);
        });

        addEvent(UpdateReservation, async function (newReservation) {

            console.log('UpdateReservation:', newReservation);

            let validationResult = reservationValidationForUdate(email, newReservation);
            let status = validationResult.status;
            let message = validationResult.message || '수정완료';

            if (status) {
                /*
                고객 없으면 추가
                고객 조회 한 뒤, 이름과 연락처가 일치하는 고객이 있으면 무시,
                이름과 연락처가 일치하는 고객이 없으면 추가
                 */
                if (newReservation.contact) {
                    let memberList = (await db.getWebUser(email)).memberList;
                    let newMember = true;
                    for (let i = 0; i < memberList.length; i++) {
                        let member = memberList[i];
                        if (newReservation.contact === member.contact) {
                            newMember = false;
                            if (newReservation.name && newReservation.name !== member.name) {
                                member.name = newReservation.name;
                                memberList[i] = member;
                                await db.updateWebUser(email, {memberList: memberList});
                            }
                            break;
                        }
                    }
                    if (newMember) {
                        memberList.push({contact: newReservation.contact, name: newReservation.name});
                        await db.updateWebUser(email, {memberList: memberList});
                    }
                }

                let reservationList = await db.getReservationList(email);
                let isItMyReservation = false;
                for (var i = 0; i < reservationList.length; i++) {
                    let reservation = reservationList[i];
                    if (reservation.id === newReservation.id) {
                        for (let x in reservation) {
                            if (newReservation.hasOwnProperty(x)) {
                                reservation[x] = newReservation[x];
                            }
                        }
                        console.log(reservation);
                        newReservation = reservation;
                        reservationList[i] = reservation;
                        isItMyReservation = true;
                        break;
                    }
                }
                if (isItMyReservation) {
                    if (!await db.updateReservation(email, reservationList)) {
                        status = false;
                        message = '시스템 오류입니다.(DB Update Error)';
                    }
                    if (newReservation.status === process.nmns.RESERVATION_STATUS.NOSHOW) {
                        //noShow 입력
                        let id = email + require('js-sha256')(newReservation.contact);
                        await db.addToNoShowList(email, newReservation.contact, newReservation.noShowCase, newReservation.start.substring(0,6), id);
                    }
                } else {
                    status = false;
                    message = '없는 예약입니다.';
                }

            }
            socket.emit(UpdateReservation, makeResponse(status, {id: newReservation.id}, message));
        });

        addEvent(AddReservation, async function (data) {
            console.log(data);

            let validationResult = reservationValidationForAdd(email, data);
            let status = validationResult.status;
            let message = validationResult.message || '저장완료';

            if (status) {
                /*
                TODO: 고객 없으면 추가
                고객 조회 한 뒤, 이름과 연락처가 일치하는 고객이 있으면 무시,
                이름과 연락처가 일치하는 고객이 없으면 추가
                 */
                let user = await db.getWebUser(email);
                let memberList = user.memberList;
                let newMember = true;
                for (let i = 0; i < memberList.length; i++) {
                    let member = memberList[i];
                    if (data.contact === member.contact) {
                        newMember = false;
                        if (data.name && data.name !== member.name) {
                            member.name = data.name;
                            memberList[i] = member;
                            await db.updateWebUser(email, {memberList: memberList});
                        }
                        break;
                    }
                }
                if (newMember) {
                    memberList.push({contact: data.contact, name: data.name});
                    await db.updateWebUser(email, {memberList: memberList});
                }

                let reservation = db.newReservation(data);
                if (!await db.addNewReservation(email, reservation)) {
                    status = false;
                    message = '시스템 오류입니다.(DB Update Error';
                }

                if (status) {
                    //TODO:알림톡 보내기
                    //await alrimTalk.sendReservationConfirm(user, reservation);
                }
            }
            socket.emit(AddReservation, makeResponse(status, {id: data.id}, message));
        });

        addEvent(GetManagerList, async function () {
            let managerList = await db.getStaffList(email);
            socket.emit(GetManagerList, makeResponse(true, managerList));
        });

        /**
         * Manager
         */

        addEvent(AddManager, async (staff) => {
            let status = true, message = null;
            let name = staff.name;
            let id = staff.id;

            if (!name || !id) {
                status = false;
                message = '담당자 추가에 필요한 데이터가 없습니다. ({"id": ${매니저 키}, "name":${매니저 이름, string}, "color":${저장할 색깔, string, #RRGGBB, optional}})';
            }

            if (status) {
                if (!await db.addNewStaff(email, db.newStaff(staff))) {
                    status = false;
                    message = '시스템 오류입니다.(DB Update Error';
                }
            }

            socket.emit(AddManager, makeResponse(status, {id: id}, message));
        });

        addEvent(UpdateManager, async (newStaff) => {
            let status = true, message = null;
            let name = newStaff.name;
            let color = newStaff.color;
            let id = newStaff.id;

            if (!name || !color || !id) {
                status = false;
                message = '담당자 수정에 필요한 데이터가 없습니다. ({"id": ${매니저 키}, "name":${변경후 매니저 이름, string}, "color":${변경할 색깔, string, #RRGGBB}})';
            }

            if (status) {
                let staffList = await db.getStaffList(email);
                let index = -1;
                for (let i = 0; i < staffList.length; i++) {
                    let staff = staffList[i];
                    if (staff.id === newStaff.id) {
                        index = i;
                        break;
                    }
                }
                if (index === -1) {
                    status = false;
                    message = '해당 담당자는 존재하지 않습니다.';
                } else {
                    staffList[index] = newStaff;
                    if (!await db.updateStaffList(email, staffList)) {
                        status = false;
                        message = '시스템 오류입니다.(DB Update Error)';
                    }
                }
            }

            socket.emit(UpdateManager, makeResponse(status, {id: id}, message));
        });
        addEvent(DelManager, async (newStaff) => {
            let status = true, message = null;
            let id = newStaff.id;

            if (!id) {
                status = false;
                message = '담당자 삭제에 필요한 데이터가 없습니다. ({"id": ${매니저 키}})';
            }

            if (status) {
                let staffList = await db.getStaffList(email);
                let index = -1;
                for (let i = 0; i < staffList.length; i++) {
                    let staff = staffList[i];
                    if (staff.id === newStaff.id) {
                        index = i;
                        break;
                    }
                }
                if (index === -1) {
                    status = false;
                    message = '해당 담당자는 존재하지 않습니다.';
                } else {
                    staffList.splice(index, 1);
                    if (!await db.updateStaffList(email, staffList)) {
                        status = false;
                        message = '시스템 오류입니다.(DB Update Error)';
                    }
                }
            }

            socket.emit(DelManager, makeResponse(status, {id: id}, message));
        });

        /**
         * NoShow
         */

        addEvent(GetNoShow, async function (data) {
            let status = true, message = null, resultData = null;
            let contact = data.contact;
            let mineOnly = data.mineOnly || false;

            console.log(data);

            if (!contact || (mineOnly !== false && mineOnly !== true)) {
                status = false;
                message = '노쇼 조회에 필요한 데이터가 없습니다. ({"contact":${고객 모바일, string}, "mineOnly":${내 노쇼만 볼것인지 여부, boolean, Optional}})';
            } else if (!util.phoneNumberValidation(contact)) {
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
                    detail : []
                };
                let summary = await db.getNoShow(contact);
                if(summary){
                    resultData.summary.noShowCount = summary.noShowCount;
                    resultData.summary.lastNoShowDate = summary.lastNoShowDate;

                    resultData.detail = await db.getMyNoShow(email);
                }
            }

            socket.emit(GetNoShow, makeResponse(status, resultData, message));
        });

        addEvent(AddNoShow, async function (data) {
            let status = true, message = null, resultData;
            const id = data.id;
            const contact = data.contact;
            const noShowCase = data.noShowCase;
            const noShowDate = data.date;

            //validation
            if (!contact || !id) {
                status = false;
                message = '노쇼 등록에 필요한 데이터가 없습니다. ({"id":${노쇼 ID, string}, "contact":${고객 모바일, string}, "noShowCase":${매장 코멘트, string, optional}, "date":${노쇼 날짜, string, YYYYMMDD}})';
            } else if (!util.phoneNumberValidation(contact)) {
                status = false;
                message = `휴대전화번호 형식이 올바르지 않습니다.(${contact})`;
            } else if (noShowDate && !moment(noShowDate, 'YYYYMMDD').isValid()){
                status = false;
                message = `날짜 형식이 올바르지 않습니다.(${noShowDate})`;

            }
            resultData = await db.addToNoShowList(email, contact, noShowCase, noShowDate, id);

            socket.emit(AddNoShow, makeResponse(status, resultData, message));
        });

        addEvent(DelNoShow, async function (data) {
            let status = true, message = null;
            const id = data.id;

            //validation
            if (!id) {
                status = false;
                message = '노쇼 등록에 필요한 데이터가 없습니다. ({"id":${노쇼ID, string}})';
            }

            let deleteResult = await db.deleteNoShow(email, id);
            if (!deleteResult) {
                status = false;
                message = '내가 추가한 노쇼만 삭제 할 수 있습니다.';
            }
            socket.emit(DelNoShow, makeResponse(status, null, message));
        });
    });
};

/**
 * validation
 * 필수: id, start, end, contact
 * 선택: name, type(default: R), isAllDay, contents, manager, etc
 */
const reservationValidationForAdd = function (email, data) {
    let status = false, message;
    if (!data.id || !data.start || !data.end || !data.contact) {
        message = '예약추가에 필요한 필수 데이터가 없습니다. ({"id": ${예약키}, "contact":${고객 전화번호, string}, "start":${시작일시, string, YYYYMMDDHHmm}, "end":${종료일시, string, YYYYMMDDHHmm})';
    } else if (!moment(data.start, 'YYYYMMDDHHmm').isValid() || !moment(data.end, 'YYYYMMDDHHmm').isValid()) {
        message = `날짜가 형식에 맞지 않습니다.(YYYMMDDHHmm) start:${data.start}, end:${data.end}`;
    } else if (!util.phoneNumberValidation(data.contact)) {
        message = `휴대전화번호 형식이 올바르지 않습니다.(${data.contact})`;
    } else if (data.type && data.type !== 'R' && data.type !== 'T') {
        message = `type은 R(예약) 또는 T(일정)만 가능합니다. type:${data.type}`;
    } else if (data.id && !data.id.startsWith(email)) {
        message = 'email 조작이 의심되어 거절합니다.';
    } else {
        status = true;
    }

    return {status: status, message: message};
}

const reservationValidationForUdate = function (email, data) {
    let status = false, message;

    if (!data.id) {
        message = '예약수정에 필요한 필수 데이터가 없습니다.({"id": ${예약키})';
    } else if (data.id && !data.id.startsWith(email)) {
        message = 'email 조작이 의심되어 거절합니다.';
    } else if (data.start && (!moment(data.start, 'YYYYMMDDHHmm').isValid())) {
        message = `날짜가 형식에 맞지 않습니다.(YYYMMDDHHmm) start:${data.start}`;
    } else if (data.end && (!moment(data.end, 'YYYYMMDDHHmm').isValid())) {
        message = `날짜가 형식에 맞지 않습니다.(YYYMMDDHHmm) end:${data.end}`;
    } else if (data.contact && !util.phoneNumberValidation(data.contact)) {
        message = `휴대전화번호 형식이 올바르지 않습니다.(${data.contact})`;
    } else if (data.type && data.type !== 'R' && data.type !== 'T') {
        message = `type은 R(예약) 또는 T(일정)만 가능합니다. type:${data.type}`;
    } else if (data.status && (data.status !== 'RESERVED' && data.status !== 'CANCELED' && data.status !== 'DELETED' && data.status !== 'NOSHOW')) {
        message = 'status값이 올바르지 않습니다.("status": ${상태, string, 값: RESERVED, CANCELED, DELETED, NOSHOW}})';
    } else {
        status = true;
    }
    return {status: status, message: message};
}

const makeResponse = function (status, data, message) {
    return {
        type: 'response',
        status: status,
        message: message,
        data: data
    };
}

const getHolidays = (function () {
    const holidays = [];

    const push = function (date, title) {
        holidays.push({
            date: date,
            title: title
        })
    }

    push('2018-01-01', '새해');
    push('2018-02-15', '설날');
    push('2018-02-16', '설날');
    push('2018-02-17', '설날');
    push('2018-03-01', '삼일절');
    push('2018-05-05', '어린이날');
    push('2018-05-22', '부처님오신날');
    push('2018-06-06', '현충일');
    push('2018-08-15', '광복절');
    push('2018-09-23', '추석');
    push('2018-09-24', '추석');
    push('2018-09-25', '추석');
    push('2018-10-03', '개천절');
    push('2018-10-09', '한글날');
    push('2018-12-25', '크리스마스');

    push('2019-01-01', '새해');
    push('2019-02-04', '설날');
    push('2019-02-05', '설날');
    push('2019-02-06', '설날');
    push('2019-03-01', '삼일절');
    push('2019-05-05', '어린이날');
    push('2019-05-12', '부처님오신날');
    push('2019-06-06', '현충일');
    push('2019-08-15', '광복절');
    push('2019-09-12', '추석');
    push('2019-09-13', '추석');
    push('2019-09-14', '추석');
    push('2019-10-03', '개천절');
    push('2019-10-09', '한글날');
    push('2019-12-25', '크리스마스');

    push('2020-01-01', '새해');
    push('2020-01-24', '설날');
    push('2020-01-25', '설날');
    push('2020-01-26', '설날');
    push('2020-03-01', '삼일절');
    push('2020-05-05', '어린이날');
    push('2020-04-30', '부처님오신날');
    push('2020-06-06', '현충일');
    push('2020-08-15', '광복절');
    push('2020-09-30', '추석');
    push('2020-10-01', '추석');
    push('2020-10-02', '추석');
    push('2020-10-03', '개천절');
    push('2020-10-09', '한글날');
    push('2020-12-25', '크리스마스');

    return function (start, end) {
        start = moment(start.substring(0, 8)).format('YYYY-MM-DD');
        end = moment(end.substring(0, 8)).format('YYYY-MM-DD');

        let returnHolidays = [];
        for (let i = 0; i < holidays.length; i++) {
            let holiday = holidays[i];
            if (holiday.date >= start && holiday.date <= end) {
                returnHolidays.push(holiday);
            }
        }
        return returnHolidays;
    };
})();