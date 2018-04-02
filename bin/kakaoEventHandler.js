const
    message = require('./message'),
    db = require('./db'),
    userStatus = require('./userStatus'),
    request = require('request'),
    moment = require('moment');

function phoneNumberValidation(phone){
    const phoneRex = /^01([016789]?)([0-9]{3,4})([0-9]{4})$/;
    return phoneRex.test(phone);
}

async function sendAlrimTalk(phone, callback, msg) {
    const apiVersion = null, clientId = null, clientKey = null;
    const templateCode = null;

    request({
        "uri": `http://api.apistore.co.kr/kko/${apiVersion}/msg/${clientId}`,
        "headers": {'x-waple-authorization': clientKey},
        "method": "POST",
        "json": {
            phone: phone,
            callback: callback,
            msg: msg,
            template_code: templateCode,
            failed_type: 'SMS',
            url: url,
            url_button_txt: url_button_txt,
            failed_subject: '예약알림',
            failed_msg: failed_msg,
            btn_types: btn_types,
            btn_txts: btn_txts,
            btn_urls1: btn_urls1
        }
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!: ', body)
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
                    //TODO: 알림톡 API 호출
                    // await sendAlrimTalk('01028904311', '01028904311', user.messageWithConfirm);
                    alrimTalk.isSent = true;
                    await db.saveAlrimTalk(alrimTalk);
                    //사용자 정보에 전송 횟수 업데이트
                    await db.setUserStatus(userKey, userStatus.beforeSelection, 'sendConfirmCount');
                    returnMessage = message.messageWithHomeKeyboard('전송되었습니다.');
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
                            confirm += `예약자 번호: ${receiverPhone.length === 11 ? (receiverPhone.substring(0,3) + '-' + receiverPhone.substring(3, 7) + '-' + receiverPhone.substring(7)) : (receiverPhone.substring(0,3) + '-' + receiverPhone.substring(3, 6) + '-' + receiverPhone.substring(6))}\n`;
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

exports.cancelReservation = async function(reservationKey){
    let reservationInfo = await db.getAlrimTalk(reservationKey);
    if(reservationInfo){
        let user = await db.getUser(reservationInfo.userKey);
        if(user){
            //알림톡 전송
            //알림톡 Update (취소)
            //User Update (취소 카운트 up)
        }
    }
};

exports.friendAddHandler = async function(userKey, res){
    db.addFriend(userKey);
    res.status(200).send('SUCCESS');
};

exports.friendDelHandler = async function(userKey, res){
    db.deleteFriend(userKey);
    res.status(200).send('SUCCESS');
};