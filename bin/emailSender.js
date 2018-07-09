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

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};

exports.sendEmailVerification = function(email, token){

    const authLinkParams=`auth?email=${email}&token=${token}`;

    sendMail({
        from: srcEmail,
        to: email,
        subject: 'NoMoreNoShow Email 인증 메일입니다.',
        text: 'That was easy!'
    });
};

exports.sendTempPasswordEmail = function(email, pwd){
    sendMail({
        from: srcEmail,
        to: email,
        subject: 'NoMoreNoShow 임시 비밀번호 발급 이메일입니다.',
        text: 'That was easy!'
    });
};