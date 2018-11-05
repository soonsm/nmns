exports.noshowRegister = 'NoShow 등록하기';
exports.noshowRetrieve = 'NoShow 조회하기';
exports.confirmReservation = '예약취소버튼 보내기';

exports.yesAlrmTalkInfo = "예(전송)";
exports.noAlrmTalkInfo = "아니오(다시입력)";

exports.homeKeyboard = {
    'type': 'buttons',
    'buttons': [exports.confirmReservation, exports.noshowRegister, exports.noshowRetrieve]
};

exports.homeKeyboardBeforeLogin = {
    'type': 'buttons',
    'buttons': ['회원가입하기', '로그인하기', exports.confirmReservation, exports.noshowRegister, exports.noshowRetrieve]
};

exports.confirmAlrimTalkInfoKeyboard = {
    'type': 'buttons',
    'buttons': [exports.yesAlrmTalkInfo, exports.noAlrmTalkInfo]
}

exports.messageWithConfirmAlrimTalkInfoKeyboard = function (text) {
    return {
        'message': {
            'text': text
        },
        'keyboard': exports.confirmAlrimTalkInfoKeyboard
    }
}

exports.messageWithButton = function (text, buttonLabel, buttonUrl) {
    return {
        'message': {
            'text': text,
            'message_button': {
                'label': buttonLabel,
                'url': buttonUrl
            }
        },
        'keyboard': exports.homeKeyboard
    };
};

exports.messageWithHomeKeyboard = function (text) {
    return {
        'message': {
            'text': text
        },
        'keyboard': exports.homeKeyboard
    };
};

exports.messageWithTyping = function (text) {
    return {
        'message': {
            'text': text
        }
    };
};

exports.typePhoneNumber = {
    'message': {
        'text': '전화번호를 입력하세요.\n(숫자만 입력하세요.\n처음으로 돌아가려면 \'1\' 입력)'
    }
};

exports.typeAlrimTalkInfo = function (text) {
    return {
        'message': {
            'text': `${text === undefined ? '' : text}예약날짜, 예약시간, 예약자 전화번호를 입력하세요.\n(예:\n4월5일 오후5시30분 01012341234 => 0405 1730 01012341234)\n처음으로 돌아가려면 \'1\' 입력'`
        }
    };
};