const
    db = require('./db'),
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
    let noShow = await db.getNoShow(phone);
    if(noShow && noShow.noShowCount > 0){
        const lastNoShowDate = noShow.lastNoShowDate;
        result.noShowCount = noShow.noShowCount;
        result.lastNoShowDate = lastNoShowDate;
    }else{
        result.noShowCount=0;
    }
    return result;
})

exports.addNoShow = phoneJob(async function(phone){
    if(await db.addToNoShowList(phone)){
        return {result: 'ok'};
    }else{
        return {result: 'fail'};
    }
});