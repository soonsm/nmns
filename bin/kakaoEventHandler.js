const
    message = require('./message'),
    db = require('./db'),
    newDb = require('./newDb'),
    userStatus = require('./userStatus'),
    request = require('request'),
    moment = require('moment'),
    util = require('./util');

const
    apiStoreId = 'soonsm',
    apiStoreKey = 'Nzc4MS0xNTIwNDI3MTgxMzc4LTMyMTQ4M2I1LTBiODUtNDYxNC05NDgzLWI1MGI4NWY2MTQzNw==';

function formatPhone(phone){
    try{
        return phone.length === 11 ? (phone.substring(0,3) + '-' + phone.substring(3, 7) + '-' + phone.substring(7)) : (phone.substring(0,3) + '-' + phone.substring(3, 6) + '-' + phone.substring(6));
    }catch(e){
        return '';
    }
}


/*
TODO List
1. 노쇼 구분해서 보여주기(우리샵 노쇼, 다른샵 노쇼)
 저장할 때: KaKaoUserList에 내 노쇼 리스트 따로 저장 후 NoShowList에 추가
 조회할 때: KaKaoUserList에 내 노쇼 리스트 조회 + NoShowList 조회
2. 노쇼 등록 취소하기(마지막으로 등록한 노쇼취소, 전화번호 입력받아서 취소(단, 내가 등록한 노쇼에 한하여))
 저장할 때: 마지막 저장한 노쇼 컬럼에 해당 노쇼키 저장
 취소할 때: 마지막 등록한 노쇼 취소 일 때는 KaKaoUserList에서 NoShowKey 갖고와서 지운다.(내 리스트, NoShowList)
          전화번호 입력시에는 내 노쇼 리스트에 있으면 내 리스트와 전체 리스트에서 지우고, 아니면 에러 리턴
 */

async function sendAlrimTalk(param){

    return new Promise(resolve => {
        request({
            "uri": `http://api.apistore.co.kr/kko/1/msg/${apiStoreId}`,
            "headers": {'x-waple-authorization': apiStoreKey},
            "method": "POST",
            'form' : param
        }, (err, res, body) => {
            if (!err) {
                console.log('sendAlrimTalk sending result: ', body)
                if(JSON.parse(body).result_code === '200'){
                    resolve(true);
                }
                resolve(false);
            } else {
                console.error("Unable to send sendAlrimTalk:", err);
                resolve(false);
            }
        });
    });
}

async function sendReservationCancelNotify(user, alrimTalk){

    let msg = `[${user.shopName} 예약취소알림]\n예약 취소를 알려드립니다.\n예약날짜: ${moment(alrimTalk.reservationDate, 'MMDD').format('MM[월]DD[일]')}\n예약시간: ${moment(alrimTalk.reservationTime,'HHmm').format('HH[시]mm[분]')} \n예약자 전화번호: ${formatPhone(alrimTalk.receiverPhone)}`;

    return await sendAlrimTalk({
        phone: user.userPhone,
        callback: '01028904311',
        msg: msg,
        template_code: 'A003',
        apiVersion: 1,
        client_id: apiStoreId
    });
}


async function sendReservationConfirm(user, alrimTalk) {

    let msg = `[${user.shopName} 예약안내]\n예약날짜: ${moment(alrimTalk.reservationDate, 'MMDD').format('MM[월]DD[일]')}\n예약시간: ${moment(alrimTalk.reservationTime,'HHmm').format('HH[시]mm[분]')}\n안내말씀: ${user.messageWithConfirm}\n- 예약취소는 ${user.cancelDue}전까지 가능합니다.\n- 예약취소를 원하실 때는 꼭 예약취소 버튼을 눌러주시기 바랍니다.`;

    return await sendAlrimTalk({
        phone: alrimTalk.receiverPhone,
        callback: '01028904311',
        msg: msg,
        template_code: 'A002',
        btn_types: '웹링크',
        btn_txts: '예약취소',
        btn_urls1: `https://www.washow.co.kr/cancel/key=${alrimTalk.reservationKey}`,
        btn_urls2: `https://www.washow.co.kr/cancel/key=${alrimTalk.reservationKey}`,
        apiVersion: 1,
        client_id: apiStoreId
    });
}

async function sendSenderRegister(){
    await request({
        "uri": `http://api.apistore.co.kr/kko/2/sendnumber/save/${apiStoreId}`,
        "headers": {'x-waple-authorization': apiStoreKey},
        "method": "POST",
        'form' : {
            sendnumber : '01028904311',
            comment: 'NoMoreNoShow대표번호',
            pintype: 'SMS',
            pincode: '280483'
        }
    }, (err, res, body) => {
        if (!err) {
            console.log('발신번호 인증/등록 전송 성공: ', body)
            if(body.result_code === '200'){
                resolve(true);
            }
        } else {
            console.error("발신번호 인증/등록 전송 실패:", body);
        }
    });
}

async function sendTestAlrimTalk() {

    let msg = `[승민네일샵 예약안내]\n예약날짜: 4월5일\n예약시간: 17시30분\n방문시준비사항: 씻고와라\n- 예약취소는 하루전까지 가능합니다.\n- 예약취소를 원하실 때는 꼭 예약취소 버튼을 눌러주시기 바랍니다.`;

    return await sendAlrimTalk({
        phone: '01028904311',
        callback: '01028904311',
        msg: msg,
        template_code: 'A003',
        url: `http://203.128.198.113:8088/cancel/key=20180328111018.686DBxu7bqxT_q25e9fcdbe3812c9c8d768e4ba2e6b52eebde96e89be3266278f31feef91065263`,
        url_button_txt: '예약취소',
        apiVersion: 1,
        client_id: apiStoreId
    });
}

let getResFunc = function(res){
    return function(returnMessage){
        res.status(200).json(returnMessage);
    };
}

exports.messageHandler = async function(userKey, content, res){

    let returnMessage = null;
    let sendRes = getResFunc(res);

    let user = await db.getUser(userKey);
    if(!user){
        user = db.newUser(userKey);
        await db.saveUser(user);
    }
    if(!user.email){
        //회원가입 하라는 안내 문구
        let url = `https://www.washow.co.kr/index?kakaotalk=${userKey}`;
        if (process.env.NODE_ENV == process.nmns.MODE.DEVELOPMENT) {
            url = `http://localhost:8080/index?kakaotalk=${userKey}`;
        }
        return sendRes(message.messageWithButton('WA:SHOW 회원으로 등록되어 있지 않습니다.\n회원가입 후 이용해주세요.\n이미 가입하신 분은 로그인해주세요.', '회원가입/로그인', url));
        // return sendRes(message.messageWithHomeKeyboard(`No More No Show 회원으로 등록되어 있지 않습니다. \n회원가입 후 이용해주세요.\n${url}\n이미 가입하신 분은 로그인해주세요.`));
    }
    let webUser = await db.getWebUser(user.email);
    if(!webUser || webUser.authStatus !== process.nmns.AUTH_STATUS.EMAIL_VERIFICATED){
        //이메일 인증 하라는 안내 문구
        return sendRes(message.messageWithHomeKeyboard('가입하신 이메일로 인증메일을 보냈습니다.\n이메일 인증 후 사용하세요.\n이메일 인증후 홈페이지의 더 많은 기능도 이용하실 수 있습니다.'));
    }

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
            // if(user.hasRightToSendConfirm){
                await db.setUserStatus(userKey, userStatus.beforeTypeAlrimTalkInfo, 'sendConfirmTryCount');
                returnMessage = message.typeAlrimTalkInfo();
            // }else{
            //     await db.setUserStatus(userKey, userStatus.beforeTypeAlrimTalkKey);
            //     returnMessage = message.messageWithTyping('상호명과 등록키를 입력하세요.\n(예:상암네일샵 A01eAoC)\n(등록키 발급 방법: 노쇼그만 카카오톡 프로필 클릭 -> 화면 하단의 "알림톡 등록키 발급 방법" 확인)');
            // }
        }
    }else if(content === message.yesAlrmTalkInfo || content === message.noAlrmTalkInfo){
        if(user.userStatus === userStatus.beforeConfirmAlrimTalkInfo){
            if(content === message.noAlrmTalkInfo){
                await db.setUserStatus(userKey, userStatus.beforeTypeAlrimTalkInfo);
                returnMessage = message.typeAlrimTalkInfo();
            }else{
                if(user.onGoingAlrimTalkKey){
                    let alrimTalk = await db.getAlrimTalk(user.onGoingAlrimTalkKey);
                    const sendResult = await sendReservationConfirm(user,alrimTalk);
                    if(sendResult){
                        alrimTalk.isSent = true;
                        await db.saveAlrimTalk(alrimTalk);
                        await db.setUserAlrimTalkSend(user);
                        returnMessage = message.messageWithHomeKeyboard('전송되었습니다.');
                    }else{
                        returnMessage = message.messageWithHomeKeyboard('알림톡 전송을 실패하였습니다.\nnomorenoshow@gmail.com으로 연락바랍니다.');
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
        if(user){
            switch(user.userStatus){
                case userStatus.beforeRegister:

                    if(util.phoneNumberValidation(content)){
                        await newDb.addNoShow(user.email, content);
                        returnMessage = message.messageWithHomeKeyboard('등록되었습니다.');
                        await db.setUserStatus(userKey, userStatus.beforeSelection, 'registerCount');
                    }else{
                        returnMessage = message.messageWithTyping('잘못입력하였습니다. 다시 입력하세요.\n(처음으로 돌아가려면 \'1\' 입력).');
                    }
                    break;
                case userStatus.beforeRetrieve:
                    if(util.phoneNumberValidation(content)){

                        let resultMessage = "노쇼전적\n";

                        let noShowList = await newDb.getNoShow(content);
                        if(noShowList.length > 0){

                            let myNoShowList = noShowList.filter(noshow => noshow.email === user.email);
                            let numOfMyNoShow = myNoShowList.length;
                            if(numOfMyNoShow > 0){
                                let last = myNoShowList[numOfMyNoShow -1];
                                resultMessage += `우리 매장에서 ${numOfMyNoShow}번\n마지막 노쇼: ${moment(last.date, 'YYYYMMDD').format('YYYY[년]MM[월]DD[일]')}\n`;
                            }

                            let numOfNoShow = noShowList.length;
                            let last = noShowList[numOfNoShow - 1];
                            resultMessage += `전체 매장에서 ${numOfNoShow}번\n마지막 노쇼: ${moment(last.date, 'YYYYMMDD').format('YYYY[년]MM[월]DD[일]')}`;
                            returnMessage = message.messageWithHomeKeyboard(resultMessage);
                        }else{
                            returnMessage = message.messageWithHomeKeyboard('노쇼 전적이 없습니다.');
                        }

                        await db.setUserStatus(userKey, userStatus.beforeSelection, 'searchCount');
                    }else{
                        returnMessage = message.messageWithTyping('잘못입력하였습니다. 다시 입력하세요.\n(처음으로 돌아가려면 \'1\' 입력).');
                    }
                    break;
                case userStatus.beforeTypeAlrimTalkInfo:
                    // if(user.hasRightToSendConfirm){
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
                        if(!util.phoneNumberValidation(receiverPhone)){
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
                    // }else{
                    //     returnMessage = message.messageWithHomeKeyboard('서비스 준비중입니다.');
                    // }
                    break;
                case userStatus.beforeTypeAlrimTalkKey:
                    //정보가 맞으면 User에 권한 추가
                    //정보가 맞지 않으면 처음으로 돌아가
                    // const keyList = [
                    //     {shopName: '승민샵', key: 'ABCABC121212', messageWithConfirm: '발톱 깍고와라', userPhone: '01028904311', cancelDue: '이틀'}
                    // ]
                    const keyList = await db.getAlrimTalkUserList();
                    const shopNameAndKey = content.split(" ");
                    let isRight = false;
                    if(shopNameAndKey.length === 2){
                        const shopName = shopNameAndKey[0];
                        const key = shopNameAndKey[1];
                        for(let i=0; i <keyList.length; i++){
                            let keyMap = keyList[i];
                            if(shopName === keyMap.shopName && key === keyMap.key){
                                user.shopName = shopName;
                                user.hasRightToSendConfirm = 1;
                                user.userStatus = userStatus.beforeSelection;
                                user.messageWithConfirm = keyMap.messageWithConfirm;
                                user.userPhone = keyMap.userPhone;
                                user.cancelDue = keyMap.cancelDue;
                                if(await db.saveUser(user)){
                                    isRight = true;
                                    returnMessage = message.messageWithHomeKeyboard('등록되었습니다.');
                                }
                            }
                        }
                    }
                    if(!isRight){
                        await db.setUserStatus(userKey, userStatus.beforeSelection);
                        returnMessage = message.messageWithHomeKeyboard('사전에 등록된 정보가 아닙니다.\n(베타 테스터로 등록된 사용자만 이용 가능합니다.)');
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
    let returnMsg = '예약 정보가 없습니다.';
    let contents = '노쇼하지 않고 예약취소해주셔서 감사합니다. 다음에 다시 찾아주세요.';
    let alrimTalk = await db.getAlrimTalk(reservationKey);
    if(alrimTalk){
        if(alrimTalk.isCanceled){
            returnMsg = '이미 취소된 예약';
            contents = '이미 취소된 예약압니다.';
        }else if(!alrimTalk.isCanceled){
            let user = await db.getUser(alrimTalk.userKey);
            if(user){
                //알림톡 전송
                const sendResult = await sendReservationCancelNotify(user, alrimTalk);
                if(sendResult){
                    //알림톡 Update (취소) && User Update (취소 카운트 up)
                    await db.cancelReservation(alrimTalk, user)
                    returnMsg = '예약취소완료';
                }else{
                    returnMsg = '예약취소실패';
                    contents = `예약취소를 실패했습니다.\n${formatPhone(user.userPhone)}으로 전화나 카톡으로 취소하시기 바랍니다.`;
                }
            }else{
                returnMsg = '사용자 정보가 없습니다.';
            }
        }
    }
    // res.status(200).send(returnMsg);
    res.marko(require('../client/template/reservationCancel'), {title: returnMsg, contents: contents});
};

exports.friendAddHandler = async function(userKey, res){
    db.addFriend(userKey);
    res.status(200).send('SUCCESS');
};

exports.friendDelHandler = async function(userKey, res){
    db.deleteFriend(userKey);
    res.status(200).send('SUCCESS');
};