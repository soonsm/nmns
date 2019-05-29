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
const handler = require('./../bin/alrimTalkHandler');
const moment = require('moment');

describe('alrimTalkHandler', function() {

    let email = 'soonsm@gmail.com';
    let alrimTalk = {};

    beforeEach(async function(){
        alrimTalk = {
            email: email,
            isCancel: false,
            contact: '01028904311',
            name: '김승민',
            contents: '예약취소됐어',
            reservationKey: '123123123123'
        };
        await db.deleteAllAlrimTalk(email);
    });

    describe('getAlrimTalkHistory', function() {
        it('조회 시 스펙에 정의된 항목이 있는지 확인', async function(){
            try{
                await db.addAlrmTalk(alrimTalk);

                let fn = handler.getAlrimTalkHistory;
                fn.email = email;
                let result = await fn.call(fn, {});

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);
                expect(result.data.length).toEqual(1);

                let data = result.data[0];
                expect(data.date.length).toEqual(12);
                expect(moment(data.date, 'YYYYMMDDHHmm').isValid()).toEqual(true);
                expect(data.name).toEqual(alrimTalk.name);
                expect(data.contact).toEqual(alrimTalk.contact);
                expect(data.contact).toEqual(alrimTalk.contact);
                expect(data.contents).toEqual(alrimTalk.contents);

            }catch(e){
                logger.error(e);
                fail();
            }
        });
    });
});