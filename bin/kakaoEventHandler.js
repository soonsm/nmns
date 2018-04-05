const
    message = require('./message'),
    db = require('./db'),
    userStatus = require('./userStatus'),
    request = require('request'),
    moment = require('moment');

const
    apiStoreId = 'soonsm',
    apiStoreKey = 'Nzc4MS0xNTIwNDI3MTgxMzc4LTMyMTQ4M2I1LTBiODUtNDYxNC05NDgzLWI1MGI4NWY2MTQzNw==';

function formatPhone(phone){
    return phone.length === 11 ? (phone.substring(0,3) + '-' + phone.substring(3, 7) + '-' + phone.substring(7)) : (phone.substring(0,3) + '-' + phone.substring(3, 6) + '-' + phone.substring(6));
}

function phoneNumberValidation(phone){
    const phoneRex = /^01([016789]?)([0-9]{3,4})([0-9]{4})$/;
    return phoneRex.test(phone);
}


/*
TODO List
1. 노쇼 구분해서 보여주기(우리샵 노쇼, 다른샵 노쇼)
2. 노쇼 등록 취소하기(마지막으로 등록한 노쇼취소, 전화번호 입력받아서 취소(단, 내가 등록한 노쇼에 한하여))
 */

async function sendReservationCancelNotify(user, alrimTalk){

    let msg = `[${user.shopName} 예약취소알림]\n예약 취소를 알려드립니다.\n예약날짜: ${moment(alrimTalk.reservationDate, 'MMDD').format('MM[월]DD[일]')}\n예약시간: ${moment(alrimTalk.reservationTime,'HHmm').format('HH[시]mm[분]')} \n예약자 전화번호: ${formatPhone(alrimTalk.receiverPhone)}`;
    let result = false;

    await request({
        "uri": `http://api.apistore.co.kr/kko/1/msg/${apiStoreId}`,
        "headers": {'x-waple-authorization': apiStoreKey},
        "method": "POST",
        "json": {
            phone: user.userPhone,
            callback: user.userPhone,
            reqdate: moment().format('YYYYMMDDHHmmss'),
            msg: msg,
            template_code: 'A002',
        }
    }, (err, res, body) => {
        if (!err) {
            console.log('ReservationCancelNotify sent!: ', body)
            if(body.result_code === '200'){
                result = true;
            }
        } else {
            console.error("Unable to send ReservationCancelNotify:", body);
        }
    });

    return result;
}


async function sendAlrimTalk(user, alrimTalk) {

    let msg = `[${user.shopName} 예약안내]\n예약날짜: ${moment(alrimTalk.reservationDate, 'MMDD').format('MM[월]DD[일]')}\n예약시간: ${moment(alrimTalk.reservationTime,'HHmm').format('HH[시]mm[분]')}\n방문시준비사항: ${user.messageWithConfirm}\n- 예약취소는 ${user.cancelDue}전까지 가능합니다.\n- 예약취소를 원하실 때는 꼭 예약취소 버튼을 눌러주시기 바랍니다.`;
    let result = false;

    await request({
        "uri": `http://api.apistore.co.kr/kko/1/msg/${apiStoreId}`,
        "headers": {'x-waple-authorization': apiStoreKey},
        "method": "POST",
        "json": {
            phone: alrimTalk.receiverPhone,
            callback: user.userPhone,
            reqdate: moment().format('YYYYMMDDHHmmss'),
            msg: msg,
            template_code: 'A003',
            url: `http://ec2-13-125-29-64.ap-northeast-2.compute.amazonaws.com/cancel/key=${alrimTalk.reservationKey}`,
            url_button_txt: '예약취소'
        }
    }, (err, res, body) => {
        if (!err) {
            console.log('ReservationCancelNotify sent!: ', body)
            if(body.result_code === '200'){
                result = true;
            }
        } else {
            console.error("Unable to send message:" + body);
        }
    });
}

exports.messageHandler = async function(userKey, content, res){

    let returnMessage = null;

    if(content === message.noshowRegister){
        await db.setUserStatus(userKey, userStatus.beforeRegister, 'registerTryCount');
        returnMessage = message.typePhoneNumber;
    }else if(content === message.noshowRetrieve){
        await db.setUserStatus(userKey, userStatus.beforeRetrieve, 'searchTryCount');
        returnMessage = message.typePhoneNumber;
    }else if(content === '1'){
        await db.setUserStatus(userKey, userStatus.beforeSelection);
        returnMessage = message.messageWithHomeKeyboard('선택하세요.');
    }else if(content === message.confirmReservation){
        let user = await db.getUser(userKey);
        if(user){
            if(user.hasRightToSendConfirm){
                await db.setUserStatus(userKey, userStatus.beforeTypeAlrimTalkInfo, 'sendConfirmTryCount');
                returnMessage = message.typeAlrimTalkInfo();
            }else{
                returnMessage = message.messageWithHomeKeyboard('서비스 준비중입니다.');
            }
        }
    }else if(content === message.yesAlrmTalkInfo || content === message.noAlrmTalkInfo){
        let user = await db.getUser(userKey);
        if(user.userStatus === userStatus.beforeConfirmAlrimTalkInfo){
            if(content === message.noAlrmTalkInfo){
                await db.setUserStatus(userKey, userStatus.beforeTypeAlrimTalkInfo);
                returnMessage = message.typeAlrimTalkInfo();
            }else{
                if(user.onGoingAlrimTalkKey){
                    let alrimTalk = await db.getAlrimTalk(user.onGoingAlrimTalkKey);
                    alrimTalk.isConfirmed = true;
                    if(await sendAlrimTalk(user,alrimTalk)){
                        alrimTalk.isSent = true;
                        await db.saveAlrimTalk(alrimTalk);
                        //사용자 정보에 전송 횟수 업데이트
                        await db.setUserStatus(userKey, userStatus.beforeSelection, 'sendConfirmCount');
                        returnMessage = message.messageWithHomeKeyboard('전송되었습니다.');
                    }else{
                        //TODO: 알림톡 전송 실패 처리 강화
                        returnMessage = message.messageWithHomeKeyboard('알림톡 전송을 실패하였습니다.');
                    }

                }else{
                    await db.setUserStatus(userKey, userStatus.beforeSelection);
                    returnMessage = message.messageWithHomeKeyboard('진행중인 알림톡이 없습니다.');
                }
            }
        }else{
            returnMessage = message.messageWithHomeKeyboard('잘못된 접근입니다.');
        }
    }else{
        let user = await db.getUser(userKey);
        if(user){

            let phoneNumber = content;
            if(user.userStatus !== userStatus.beforeTypeAlrimTalkInfo &&!phoneNumberValidation(phoneNumber)){
                returnMessage = message.messageWithHomeKeyboard('잘못입력하였습니다. 다시 입력하세요.\n(처음으로 돌아가려면 \'1\' 입력).');
            }

            switch(user.userStatus){
                case userStatus.beforeRegister:
                    await db.addToNoShowList(phoneNumber);
                    returnMessage = message.messageWithHomeKeyboard('등록되었습니다.');
                    await db.setUserStatus(userKey, userStatus.beforeSelection, 'registerCount');
                    break;
                case userStatus.beforeRetrieve:
                    let noShow = await db.getNoShow(phoneNumber);
                    if(noShow){
                        const lastNoShowDate = noShow.lastNoShowDate;
                        const lastNoShowDateStr = `${lastNoShowDate.substring(0,4)}년 ${lastNoShowDate.substring(4,6)}월 ${lastNoShowDate.substring(6)}일`;
                        returnMessage = message.messageWithHomeKeyboard(`입력하신 번호는 NoShow 전적이 ${noShow.noShowCount}번 있습니다.\n(마지막 NoShow: ${lastNoShowDateStr})`);
                    }else{
                        returnMessage = message.messageWithHomeKeyboard('입력하신 전화번호는 NoShow 전적이 없습니다.');
                    }
                    await db.setUserStatus(userKey, userStatus.beforeSelection, 'searchCount');
                    break;
                case userStatus.beforeTypeAlrimTalkInfo:
                    if(user.hasRightToSendConfirm){
                        let alrimTalkInfo = content.replace(/ /g, "");
                        let date = alrimTalkInfo.substring(0, 4);;
                        let time = alrimTalkInfo.substring(4,8);
                        let receiverPhone = alrimTalkInfo.substring(8);
                        let isValid = true;
                        let errorMsg;
                        //날짜 검증
                        if(!moment(date,'MMDD').isValid()){
                            isValid = false;
                            errorMsg = `예약날짜가 올바르지 않습니다.${date}\n`;
                        }
                        // 시간 검증
                        if(!moment(time, 'HHmm').isValid()){
                            isValid = false;
                            errorMsg += `예약시간이 올바르지 않습니다.${time}\n`;
                        }
                        // 핸드폰 번호 검증
                        if(!phoneNumberValidation(receiverPhone)){
                            isValid = false;
                            errorMsg += `번호가 올바르지 않습니다.${receiverPhone}\n`;
                        }
                        if(isValid){
                            await db.setUserStatus(userKey, userStatus.beforeConfirmAlrimTalkInfo);
                            await db.addAlrimTalk(userKey, receiverPhone, date, time);
                            let confirm = `예약날짜: ${moment(date, 'MMDD').format('MM[월]DD[일]')}\n`;
                            confirm += `예약시간: ${moment(time,'HHmm').format('HH[시]mm[분]')}\n`;
                            confirm += `예약자 번호: ${formatPhone(receiverPhone)}\n`;
                            returnMessage = message.messageWithConfirmAlrimTalkInfoKeyboard(confirm + '입력하신 정보가 맞습니까?');
                        }else{
                            returnMessage = message.typeAlrimTalkInfo(errorMsg);
                        }
                    }else{
                        returnMessage = message.messageWithHomeKeyboard('서비스 준비중입니다.');
                    }
                    break;
                default:
                    //사용자 상태가 적합한 상태가 아닐 때
                    await db.setUserStatus(userKey, userStatus.beforeSelection);
                    returnMessage = message.messageWithHomeKeyboard('잘못된 접근입니다.');
                    break;
            }
        }else{
            //사용자 정보가 조회되지 않을 때
            await db.setUserStatus(userKey, userStatus.beforeSelection);
            returnMessage = message.messageWithHomeKeyboard('사용자 정보가 조회되지 않습니다.\n다시 선택해주세요.');
        }
    }

    res.status(200).json(returnMessage);
};

/**
 * 예약취소 처리
 * @param reservationKey
 * @param res
 * @returns {Promise<void>}
 */
exports.cancelReservation = async function(reservationKey, res){
    let alrimTalk = await db.getAlrimTalk(reservationKey);
    let returnMsg = '예약 정보가 없습니다.';
    if(alrimTalk){
        let user = await db.getUser(alrimTalk.userKey);
        if(user){
            //알림톡 전송
            if(await sendReservationCancelNotify(user, alrimTalk)){
                //알림톡 Update (취소) && User Update (취소 카운트 up)
                await db.cancelReservation(alrimTalk, user)
                returnMsg = '예약이 취소되었습니다.';
            }else{
                returnMsg = `예약취소를 실패했습니다.\n${formatPhone(user.userPhone)}으로 전화나 카톡으로 취소하시기 바랍니다.`;
            }
        }
    }
    res.status(200).send(returnMsg);
};

exports.friendAddHandler = async function(userKey, res){
    db.addFriend(userKey);
    res.status(200).send('SUCCESS');
};

exports.friendDelHandler = async function(userKey, res){
    db.deleteFriend(userKey);
    res.status(200).send('SUCCESS');
};