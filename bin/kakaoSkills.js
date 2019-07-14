'use strict';
const
    router = require('express').Router(),
    db = require('./db'),
    util = require('./util'),
    moment = require('moment'),
    alrimTalkSender = require('./alrimTalkSender');

const getResponseTemplate = function (outputs) {

    return {
        version: "2.0",
        template: {
            outputs: outputs
        }
    };
};

const makeSimpleTextResponse = function (text) {
    return getResponseTemplate([{
        simpleText: {
            text: text
        }
    }]);
};

const makeBasicCardResponse = function (userKey) {
    let url = `https://www.washow.co.kr/signup?kakaotalk=${userKey}`;
    if (process.env.NODE_ENV == process.nmns.MODE.DEVELOPMENT) {
        url = `http://localhost:8088/signup?kakaotalk=${userKey}`;
    }
    return getResponseTemplate([{
        basicCard: {
            title: '이용안내',
            description: 'WA:SHOW 회원으로 등록되어 있지 않습니다.\n회원가입 후 이용해주세요.\n이미 가입하신 분은 로그인해주세요.',
            "buttons": [
                {
                    "action": "webLink",
                    "label": "회원가입/로그인",
                    "webLinkUrl": url
                }
            ]
        }
    }]);
}

const handlerTemplate = function (fn) {
    return async function (req, res) {
        let response = makeSimpleTextResponse('시스템 에러로 처리하지 못하였습니다.');
        try {
            let params = req.body.action.params;
            let userKey = req.body.userRequest.user.id;

            console.log(userKey);

            let user = await db.getUser(userKey);
            if (!user) {
                user = db.newUser(userKey);
                await db.saveUser(user);
            }
            if (!user.email) {
                //회원가입 하라는 안내 문구
                response = makeBasicCardResponse(userKey);
            }else{
                let webUser = await db.getWebUser(user.email);
                if (!webUser || webUser.authStatus !== process.nmns.AUTH_STATUS.EMAIL_VERIFICATED) {
                    //이메일 인증 하라는 안내 문구
                    response =  makeSimpleTextResponse(`${user.email}로 인증메일을 보냈습니다.\n이메일 인증 후 사용하세요.\n이메일 인증후 홈페이지의 더 많은 기능도 이용하실 수 있습니다.`);
                }else{
                    fn.userKey = userKey;
                    fn.user = user;
                    fn.webUser = webUser;
                    fn.params = params;
                    fn.phoneNo = params.phoneNumber;
                    fn.datetime = params.datetime;
                    response = await fn.call(fn, req, res);
                }
            }
        } catch (e) {
            response = makeSimpleTextResponse('시스템 에러로 처리하지 못하였습니다.');
        }

        res.status(200).send(response);

    }
};


/**
 * 노쇼 전적 조회
 */
router.post('/getNoshow', handlerTemplate(async function () {
    let user = this.user;
    let phoneNo = this.phoneNo;

    let returnMessage = "노쇼전적\n";
    let myNoShow = await db.getMyNoShow(user, phoneNo);
    if (myNoShow) {
        const lastNoShowDateStr = moment(myNoShow.lastNoShowDate, 'YYYYMMDD').format('YYYY년MM월DD일');
        returnMessage += `우리 매장에서 ${myNoShow.noShowCount}번\n마지막 노쇼: ${lastNoShowDateStr}\n`;
    }

    let noShow = await db.getNoShow(phoneNo);
    if (noShow && noShow.noShowCount > 0) {
        const lastNoShowDateStr = moment(myNoShow.lastNoShowDate, 'YYYYMMDD').format('YYYY년MM월DD일');
        returnMessage += `전체 매장에서 ${noShow.noShowCount}번\n마지막 노쇼: ${lastNoShowDateStr}`;
    } else {
        returnMessage = '노쇼 전적이 없습니다.';
    }
    return makeSimpleTextResponse(returnMessage);
}));

/**
 * 노쇼 등록
 */
router.post('/addNoshow', handlerTemplate(async function(){
    let user = this.user;
    let phoneNo = this.phoneNo;
    await db.addToNoShowList(user, phoneNo);

    return makeSimpleTextResponse('등록되었습니다.');
}));

/**
 * 알림톡 전송
 */
router.post('/addAlrimtalk', handlerTemplate(async function(){
    let user = this.user;
    let phoneNo = this.phoneNo;
    let datetime = moment(this.datetime, 'YYYY-MM-DDTHH:mm:ss').format('YYYYMMDDHHmm'); //ex: 2019-04-26T13:00:00

    let date = datetime.substring(0,8);
    let time = datetime.substring(8,12);

    let alrimTalk = await db.addAlrimTalk(this.userKey, phoneNo, date, time);
    const sendResult = await alrimTalkSender.sendReservationConfirmKaKao(user,alrimTalk);
    if(sendResult){
        alrimTalk.isSent = true;
        await db.saveAlrimTalk(alrimTalk);
        await db.setUserAlrimTalkSend(user);
        return makeSimpleTextResponse('예약내용과 함께 취소 버튼이 전송되었습니다.');
    }else{
        return makeSimpleTextResponse('알림톡 전송을 실패하였습니다.\nnomorenoshow@gmail.com으로 연락바랍니다.');
    }
}));

/**
 * 핸드폰 번호 검증 API
 */
router.post('/phone_validation', function (req, res) {
    let status = 'FAIL';
    let phoneNo;
    try {
        phoneNo = req.body.value.origin.replace(/-/gi, '');
        if (util.phoneNumberValidation(phoneNo)) {
            status = 'SUCCESS';
        }
    } catch (e) {
        status = 'FAIL';
    }

    return res.status(200).send({
        status: status,
        value: phoneNo
    });
});

let contents = [
    {
        title: '축구인들이 평가하는 안정환, 이영표, 박지성 해설',
        images : [
            'https://4.bp.blogspot.com/-aUYE8q0BImI/XMmDYqEaCdI/AAAAAAALd58/fZrh0LOCPs46TDV4qwewUYtS6wlgMup6wCLcBGAs/s1600/01.jpg',
            'https://1.bp.blogspot.com/-giinAGGgbeU/XMmDY65hCGI/AAAAAAALd6A/Anca9i3Ok1AVqUgbsGQEDZ4dkqHEuwHHQCLcBGAs/s1600/02.jpg',
            'https://3.bp.blogspot.com/-Q7tHw1f2ClY/XMmDYrJlaOI/AAAAAAALd54/zgfOOm1MmjAU6Uf9NDmL0x1Kw1oScL1UACLcBGAs/s1600/03.jpg',
            'https://1.bp.blogspot.com/-pTdytyRFrVI/XMmDZtcClLI/AAAAAAALd6E/SCKyOJZ39sMxDCmWsoEaQbsXmQpFWAGkACLcBGAs/s1600/04.jpg',
            'https://3.bp.blogspot.com/-KXExQZwlIS4/XMmDZ4jC0wI/AAAAAAALd6I/7T8_2MTm-uAa0g7-nz5FNjfCFdt-S9cMACLcBGAs/s1600/05.jpg'
        ]
    },
    {
        title: '이낙연을 나경원으로 바꾸면',
        images: [
            'http://www.paxnet.co.kr/tbbs/files/N10841/20190501/415b8236-bdbf-4111-9734-605fce2585b4.jpg'
        ]
    },
    {
        title: '사나 아웃 고백투재팬',
        images: [
            'http://www.paxnet.co.kr/tbbs/files/N10841/20190501/6c1d08a4-4a0f-4d21-b15a-4e0bdac78ce8.jpg'
        ]
    },
    {
        title: '짠내투어 귀신투어행',
        images: [
            'https://4.bp.blogspot.com/-saS6PyuaebE/XMmEULmQ4eI/AAAAAAALd-A/G3wjRTZqb_U9u_KpR7pAMDz3Vui0AdHpACLcBGAs/s1600/1.jpg',
            'https://4.bp.blogspot.com/-fSOCT4yNW88/XMmET4jJPlI/AAAAAAALd94/EdMm_lOo2Xw-AFKCC_A85PeDsYCWfF8ZgCLcBGAs/s1600/2.jpg',
            'https://1.bp.blogspot.com/-3qIaalx-WhE/XMmET1EQI3I/AAAAAAALd98/hINU2MDSW_kXy-zY1-NT-MCGqNGnBt40ACLcBGAs/s1600/3.jpg',
            'https://3.bp.blogspot.com/-VmB7v5V5qMg/XMmEVTYeDQI/AAAAAAALd-E/x_pMb0RNzawZHoNKMSuz-0yNNVgspfyGQCLcBGAs/s1600/4.jpg',
            'https://1.bp.blogspot.com/-DKrGPeM4BxA/XMmEV1mnrWI/AAAAAAALd-I/RVHVhZ8XrjgiBO815VOBU37Sv8QzYI1XACLcBGAs/s1600/5.jpg',
            'https://1.bp.blogspot.com/-ygGRucSPAXA/XMmEWYNnjmI/AAAAAAALd-M/GD0eJD8O4Xko-2MdFKN28lc0PoK9RStoQCLcBGAs/s1600/6.jpg',
            'https://3.bp.blogspot.com/-0zRKEXK8FCQ/XMmEWtwOcOI/AAAAAAALd-Q/whohBAnTRT4iZ7QD9Q6AT0uXa1VoWn8hgCLcBGAs/s1600/7.jpg',
            'https://4.bp.blogspot.com/-Caalpsl3JvA/XMmEWxBX9rI/AAAAAAALd-U/MykhT2TRZdAwluscxWJj0r_KXtEbLcpYACLcBGAs/s1600/8.jpg',
            'https://4.bp.blogspot.com/-_HIHspYa7xs/XMmEXUZWW0I/AAAAAAALd-Y/2f051wZTneIAMIn7d3NqLGNZbu3gS4xeACLcBGAs/s1600/9.jpg'
        ]
    }
]

router.post('/list', async function(req, res){

    let items = [];

    contents.forEach(content => {
        items.push({
            title: content.title,
            thumbnail: content.images[0],
            buttons: [{
                label: '보기',
                action: 'block',
                messageText: content.title,
                blockId: '테스트'

            }]
        });
    })

    res.status(200).send({
        version: "2.0",
        template: {
            carousel: {
                type: 'basicCard',
                items: items
            }
        }
    });
});
/**
 * 테스트
 */
let imgNo = 0;
router.post('/test', async function(req,res){
    let key = req.body.userRequest.utterance;

    let title = '축구인들이 평가하는 안정환, 이영표, 박지성 해설';
    let imageList = [
        'https://4.bp.blogspot.com/-aUYE8q0BImI/XMmDYqEaCdI/AAAAAAALd58/fZrh0LOCPs46TDV4qwewUYtS6wlgMup6wCLcBGAs/s1600/01.jpg',
        'https://1.bp.blogspot.com/-giinAGGgbeU/XMmDY65hCGI/AAAAAAALd6A/Anca9i3Ok1AVqUgbsGQEDZ4dkqHEuwHHQCLcBGAs/s1600/02.jpg',
        'https://3.bp.blogspot.com/-Q7tHw1f2ClY/XMmDYrJlaOI/AAAAAAALd54/zgfOOm1MmjAU6Uf9NDmL0x1Kw1oScL1UACLcBGAs/s1600/03.jpg',
        'https://1.bp.blogspot.com/-pTdytyRFrVI/XMmDZtcClLI/AAAAAAALd6E/SCKyOJZ39sMxDCmWsoEaQbsXmQpFWAGkACLcBGAs/s1600/04.jpg',
        'https://3.bp.blogspot.com/-KXExQZwlIS4/XMmDZ4jC0wI/AAAAAAALd6I/7T8_2MTm-uAa0g7-nz5FNjfCFdt-S9cMACLcBGAs/s1600/05.jpg'
    ];
    let length = imageList.length;

    let template = {outputs: []};
    if(imgNo === 0){
        template.outputs.push({
            "simpleText": {
                "text": title
            }
        });
    }
    template.outputs.push({
        "simpleImage": {
            "imageUrl": imageList[imgNo++],
            "altText": "이미지"
        }
    });
    if(imgNo < length -1 ){
        template.outputs.push({
            "simpleImage": {
                "imageUrl": imageList[imgNo++],
                "altText": "이미지"
            }
        });
    }
    if(imgNo < length){
        template.quickReplies = [
            {
                label: '다음',
                action: 'message',
                messageText: '다음'
            }
        ];
    }
    res.status(200).send({
        version: "2.0",
        template: template
    });


});

module.exports = router;