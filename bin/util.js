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