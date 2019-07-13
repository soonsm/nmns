'use strict';

const logger = global.nmns.LOGGER;

const srcEmail = process.env.EMAIL_SOURCE;
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_ID, // generated ethereal user
        pass: process.env.EMAIL_PASSWORD // generated ethereal password
    }
});



function sendMail(mailOptions){
    return new Promise((resolve) => {
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                logger.log('Email send fail: ', error);
                resolve(false);
            } else {
                logger.log('Email sent: ' + info.response);
                resolve(true);
            }
        });
    });
};

exports.sendEmailVerification = async function(email, token){

    if(process.env.NODE_ENV == process.nmns.MODE.DEVELOPMENT) {
        return true;
    }

    const authLinkParams=`emailVerification/email=${email}&token=${token}`;

    return await sendMail({
        from: srcEmail,
        to: email,
        subject: 'WA:SHOW 인증 메일입니다.',
        html: getEmailVerificaitonText(authLinkParams)
    });
};

exports.sendTempPasswordEmail = async function(email, pwd){
    return await sendMail({
        from: srcEmail,
        to: email,
        subject: 'WA:SHOW 임시 비밀번호 발급 이메일입니다.',
        html: getPasswordResetText(pwd)
    });
};

exports.sendFeedbackAlrim = async function(email, feedback){
    return await sendMail({
        from: srcEmail,
        to: srcEmail,
        subject: 'WA:SHOW 피드백 알림',
        text: `피드백 내용: ${feedback} \n 발신자: ${email}`
    });
};

const getEmailVerificaitonText = function(param){
    return '\n' +
        '<div style="margin:0;padding:0">\n' +
        '<link href="https://fonts.googleapis.com/css?family=Montserrat:700|Nanum+Gothic" rel="stylesheet">\n' +
        '<div style="max-width:100%;padding:15px;background-color:#f0f0f0;box-sizing:border-box">\n' +
        '<table style="margin:0 auto;padding:0;width:100%;max-width:630px;font-family:\'NanumGothic\',dotum" cellspacing="0" cellpadding="0">\n' +
        '<tbody>\n' +
        '<tr style="background-color:#009688;height:50px">\n' +
        '<td style="vertical-align:middle;padding-left:10px;padding-top:5px;"><a href="https://www.nomorenoshow.co.kr" style="font-family:\'Montserrat\', \'sans-serif\'; font-weight:700;height:40px;display:inline-block;color:white;font-size:1.8rem;text-decoration:none;" >No More No Show</a></td>\n' +
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
        '<a href="https://www.nomorenoshow.co.kr/' + param + '" style="border-radius:none;border:1px solid #009688;cursor:pointer;color:#fff;text-align:center;font-size:1.2rem;display:inline-block;background-color:#009688;font-family:\'NanumGothic\';font-weight:normal;text-decoration:none; padding:12px 30px;"><span style="height:40px;">인증하기</span></a>\n' +
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
        '<td style="font-size:13px;line-height:20px;color:#666">\n' +
        '<a href="https://www.nomorenoshow.co.kr">No More No Show</a><br>\n' +
        '이메일 : <a href="mailto:support@nomorenoshow.co.kr" style="color:#666;text-decoration:none" target="_blank">support@nomorenoshow.co.kr</a><br>\n' +
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
};

const getPasswordResetText = function(newPassword){
    return '\n' +
        '<div style="margin:0;padding:0">\n' +
        '<link href="https://fonts.googleapis.com/css?family=Montserrat:700|Nanum+Gothic" rel="stylesheet">\n' +
        '<div style="max-width:100%;padding:15px;background-color:#f0f0f0;box-sizing:border-box">\n' +
        '<table style="margin:0 auto;padding:0;width:100%;max-width:630px;font-family:\'NanumGothic\',dotum" cellspacing="0" cellpadding="0">\n' +
        '<tbody>\n' +
        '<tr style="background-color:#009688;height:50px">\n' +
        '<td style="vertical-align:middle;padding-left:10px;padding-top:5px;"><a href="https://www.nomorenoshow.co.kr" style="font-family:\'Montserrat\', \'sans-serif\'; font-weight:700;height:40px;display:inline-block;color:white;font-size:1.8rem;text-decoration:none;" >No More No Show</a></td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '<td style="padding:50px 20px;background:#fff">\n' +
        '<table cellspacing="0" cellpadding="0">\n' +
        '<tbody>\n' +
        '<tr>\n' +
        '<td style="padding:27px 0 17px;font-size:30px;line-height:34px;color:#333"><strong style="color:#009688;font-weight:normal">임시비밀번호 발급</strong>안내</td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '<td style="padding:10px 0 30px;font-size:15px;line-height:27px;color:#303030">안녕하세요. No More No Show입니다.<br>\n' +
        '항상 No More No Show를 사랑해 주시는 고객님께 진심으로 감사 드립니다.<br>\n' +
        '<br>\n' +
        '본 메일은 고객님의 임시 비밀번호 발급을 위하여 발송된 것입니다.<br>\n' +
        '임시 비밀번호는 아래와 같습니다.\n' +
        '</tr>\n' +
        '<tr>\n' +
        '<td style="padding:30px 0 0;border-top:1px solid #e0e0e0">\n' +
        newPassword + '\n' +
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
        '<td style="font-size:13px;line-height:20px;color:#666">\n' +
        '<a href="https://www.nomorenoshow.co.kr">No More No Show</a><br>\n' +
        '이메일 : <a href="mailto:support@nomorenoshow.co.kr" style="color:#666;text-decoration:none" target="_blank">support@nomorenoshow.co.kr</a><br>\n' +
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
};