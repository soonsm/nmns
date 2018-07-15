exports.getToday = function(){
    const dt = new Date();
    const year = dt.getFullYear();
    const month = dt.getMonth() + 1;
    const day = dt.getDate();
    return [year, (month < 10 ? '0' + month : month), (day < 10 ? '0' + day : day)].join('');
};

exports.phoneNumberValidation = function(phone){
    const phoneRex = /^01([016789]?)([0-9]{3,4})([0-9]{4})$/;
    return phoneRex.test(phone);
}

exports.passwordStrengthCheck = function(pwd){

    let result = {
        result : true
    };
    let passwordValidator = require('password-validator');
    let schema = new passwordValidator();
    schema
        .is().min(8)                                    // Minimum length 8
        .is().max(30)                                  // Maximum length 30
        .has().digits()                                 // Must have digits
        .has().symbols();                               // Must have symbols
    let passwordFailRules = schema.validate(pwd, { list: true });
    if(passwordFailRules && passwordFailRules.length > 0){
        //password strength check fail
        let passwordMessages = {
            min: '길이제한 8글자 이상',
            max: '길이제한 30글자 이하',
            digits: '숫자포함',
            symbols: '특수문자 포함'
        }
        let errorMessage = '입력하신 비밀번호는 다음의 조건을 만족하지 않습니다.(';
        for(var i=0; i<passwordFailRules.length; i++){
            errorMessage += passwordMessages[passwordFailRules[i]];
            if(i < passwordFailRules.length-1){
                errorMessage += ', ';
            }
        }
        errorMessage += ')';
        result.result = false;
        result.message = errorMessage;
    }

    return result;
};

exports.formatPhone = function(phone){
    try{
        return phone.length === 11 ? (phone.substring(0,3) + '-' + phone.substring(3, 7) + '-' + phone.substring(7)) : (phone.substring(0,3) + '-' + phone.substring(3, 6) + '-' + phone.substring(6));
    }catch(e){
        return '';
    }
}