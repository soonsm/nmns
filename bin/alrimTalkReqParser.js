const util = require('./util');

exports.parseAlrimTalkReq = function (req, today) {
    today = today || new Date();

    //'내일 오전 11시 01028904311'
    let parsedData = null;
    if (req) {
        let data = req.replace(/ /g, "");
        let reservationDate;
        let reservationTime;
        let reservationPhone;
        let index = data.indexOf('내일');
        if (index) {
            data = data.substring(index + '내일'.length);
            today.setDate(today.getDate() + 1);
            reservationDate = getDateString(today);
        }
        index = data.indexOf('오전');
        if(index){
            data = data.substring(index + '오전'.length);
        }
        index = data.indexOf("시");
        if(index){
            let time = data.substring(0, index);
            if(time >= 0 && time <= 12){
                reservationTime = time + '00';
            }
            data = data.substring(index + '시'.length);
        }

        if(phoneNumberValidation(data)){
            reservationPhone = data;
        }

        parsedData = {
            reservationDate: reservationDate,
            reservationTime: reservationTime,
            phone: reservationPhone
        };
        if(!parsedData.reservationDate || !parsedData.reservationTime || !parsedData.phone){
            parsedData = null;
        }
    }
    return parsedData;
};

function phoneNumberValidation(phone){
    const phoneRex = /^01([016789]?)([0-9]{3,4})([0-9]{4})$/;
    return phoneRex.test(phone);
}

function getDateString(dt) {
    const year = dt.getFullYear();
    const month = dt.getMonth() + 1;
    const day = dt.getDate();
    return [year, (month < 10 ? '0' + month : month), (day < 10 ? '0' + day : day)].join('');
}
