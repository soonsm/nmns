const
    newDb = require('./newDb'),
    util = require('./util');

function phoneJob(afterValidation){
    let validation = async function(phone){
        let result = {};

        if(util.phoneNumberValidation(phone)){
            result = await afterValidation(phone);
        }else{
            result.err = '휴대전화 포맷이 아닙니다.';
        }

        return result;
    }

    return validation;
}

exports.getNoShow = phoneJob(async function(phone){
    let result = {};
    let noShowList = await newDb.getNoShow(phone);
    let numOfNoShow = noShowList.length;

    result.noShowCount = numOfNoShow;
    result.lastNoShowDate = noShowList[numOfNoShow-1].date;

    return result;
})

exports.addNoShow = phoneJob(async function(phone){
    if(await newDb.addNoShow(phone)){
        return {result: 'ok'};
    }else{
        return {result: 'fail'};
    }
});