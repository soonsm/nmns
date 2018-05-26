const
    db = require('./db'),
    util = require('./util');

exports.getNoShow = async function(phone){
    let result = {};

    if(util.phoneNumberValidation(phone)){
        let noShow = await db.getNoShow(phone);
        if(noShow && noShow.noShowCount > 0){
            const lastNoShowDate = noShow.lastNoShowDate;
            result.noShowCount = noShow.noShowCount;
            result.lastNoShowDate = lastNoShowDate;
        }else{
            result.noShowCount=0;
        }
    }else{
        result.err = '휴대전화 포맷이 아닙니다.';
    }

    return result;
}