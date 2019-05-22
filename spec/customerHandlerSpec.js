'user strict';

if(!global.nmns){
    global.nmns = {};
}

require('./../bin/logger');
require('./../bin/constant');

// process.env.NODE_ENV = process.nmns.MODE.PRODUCTION;
process.env.NODE_ENV = process.nmns.MODE.DEVELOPMENT;

const logger = global.nmns.LOGGER;

const db = require('./../bin/newDb');
const handler = require('./../bin/customerHandler');

describe('customerHandler', function() {

    let email = 'soonsm@gmail.com';

    beforeEach(async function(){
        await db.deleteAllCustomer(email);
    });

    describe('getCustomerList', function() {

    });
});