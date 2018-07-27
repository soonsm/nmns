'use strict';

const nodemailer = require('nodemailer');
const srcEmail = 'nomorenoshow@gmail.com';
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: srcEmail,
        pass: '1313nomorenoshow!!'
    }
});

function sendMail(mailOptions){
    return new Promise((resolve) => {
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log('Email send fail: ', error);
                resolve(false);
            } else {
                console.log('Email sent: ' + info.response);
                resolve(true);
            }
        });
    });

};

exports.sendEmailVerification = async function(email, token){

    const authLinkParams=`auth?email=${email}&token=${token}`;

    return await sendMail({
        from: srcEmail,
        to: email,
        subject: 'NoMoreNoShow 인증 메일입니다.',
        text: emailText
    });
};

exports.sendTempPasswordEmail = async function(email, pwd){
    return await sendMail({
        from: srcEmail,
        to: email,
        subject: 'NoMoreNoShow 임시 비밀번호 발급 이메일입니다.',
        text: emailText
    });
};

const emailText = '\n' +
    '<div style="margin:0;padding:0">\n' +
    '<div style="max-width:100%;padding:15px;background-color:#f0f0f0;box-sizing:border-box">\n' +
    '<table style="margin:0 auto;padding:0;width:100%;max-width:630px;font-family:\'\\00b3cb\\00c6c0\',dotum" cellspacing="0" cellpadding="0">\n' +
    '<tbody>\n' +
    '<tr style="background-color:#009688;height:50px">\n' +
    '<td style="vertical-align:middle;padding-left:5px"><a href="https://www.nomorenoshow.com" style="width:250px;height:40px;display:inline-block;background-repeat:no-repeat;background-size:250px;background-image:url(\'data:image/png;base64,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\')" /></td>\n' +
    '</tr>\n' +
    '<tr>\n' +
    '<td style="padding:50px 20px;background:#fff">\n' +
    '<table cellspacing="0" cellpadding="0">\n' +
    '<tbody>\n' +
    '<tr>\n' +
    '<td style="padding:27px 0 17px;font-size:30px;line-height:34px;color:#333"><strong style="color:#009688;font-weight:normal">이메일 계정 인증</strong>안내</td>\n' +
    '</tr>\n' +
    '<tr>\n' +
    '<td style="padding:10px 0 30px;font-size:15px;line-height:27px;color:#303030">안녕하세요. No More No Show입니다.<br>\n' +
    '항상 No More No Show를 사랑해 주시는 고객님께 진심으로 감사 드립니다.<br>\n' +
    '<br>\n' +
    '본 메일은 고객님의 이메일 계정 인증을 위하여 발송된 것입니다.<br>\n' +
    '아래의 버튼을 누르시면 인증이 완료됩니다.\n' +
    '</tr>\n' +
    '<tr>\n' +
    '<td style="padding:30px 0 0;border-top:1px solid #e0e0e0">\n' +
    '<a href="https://www.nomorenoshow.com/auth" style="width:200px;height:60px;display:inline-block;background-repeat:no-repeat;background-size:200px;background-image: url(\'data:image/png;base64,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\')"/>\n' +
    '</td>\n' +
    '</tr>\n' +
    '<tr>\n' +
    '<td style="padding-top:30px;font-size:15px;line-height:27px;color:#303030">감사합니다.<br>\n' +
    '<br>\n' +
    '<strong style="color:#333">No More No Show 드림</strong>\n' +
    '</td>\n' +
    '</tr>\n' +
    '</tbody>\n' +
    '</table>\n' +
    '</td>\n' +
    '</tr>\n' +
    '<tr>\n' +
    '<td style="padding:25px 0;background:#f0f0f0">\n' +
    '<table style="margin:0;padding:0;width:100%" cellspacing="0" cellpadding="0">\n' +
    '<tbody>\n' +
    '<tr>\n' +
    '<td style="font-size:13px;line-height:20px;color:#666">본 메일은 발신 전용입니다.<br>\n' +
    '<a href="https://www.nomorenoshow.com">No More No Show</a> | 주소 : 서울시 강남구 역삼동 1234번지<br>\n' +
    '사업자등록번호 : 120-87-65763 | 통신판매업신고번호 : 2012-서울송파-0515<br>\n' +
    '개인정보보호책임자 : 박성철 | 고객센터 : 1644-0025 | 이메일 : <a href="mailto:nomorenoshow@gmail.com" style="color:#666;text-decoration:none" target="_blank">nomorenoshow@gmail.com</a><br>\n' +
    '©No More No Show</td>\n' +
    '</tr>\n' +
    '</tbody>\n' +
    '</table>\n' +
    '</td>\n' +
    '</tr>\n' +
    '</tbody>\n' +
    '</table>\n' +
    '</div>\n' +
    '</div>';