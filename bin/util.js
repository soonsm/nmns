exports.getToday = function(){
    const dt = new Date();
    const year = dt.getFullYear();
    const month = dt.getMonth() + 1;
    const day = dt.getDate();
    return [year, (month < 10 ? '0' + month : month), (day < 10 ? '0' + day : day)].join('');
};