'user strict';

if(!global.nmns){
    global.nmns = {};
}

require('./logger');
require('./constant');

// process.env.NODE_ENV = process.nmns.MODE.PRODUCTION;
process.env.NODE_ENV = process.nmns.MODE.DEVELOPMENT;

const db = require('./newDb');
const handler = require('./../bin/noShowHandler');


(async function(){
    let phone = '01011112222';
    let email = 'soonsm@gmail.com';


    let fn = handler.addNoShow;
    fn.email = email;

    let noshow = {id: 'aasdasdasd',
        contact: phone,
        name: '김승민',
        noShowCase: '지각',
        date: '20190606'};

    let result = await fn.call(fn, noshow);

    result = await fn.call(fn, noshow);
})();
