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
const handler = require('./../bin/noShowHandler');
const sha256 = require('js-sha256');

describe("getNoShow", function() {

    let phone = '01011112222';
    let email = 'soonsm@gmail.com';

    let del = async function(){
        await db.delAllNoShowWithPhone(phone);
    }

    beforeEach(del);

    let fn = handler.getNoShow;
    fn.email = email;

    it("전화번호가 없을 때 status false", async function() {
        let result = await fn.call(fn, {});

        expect(result.status).toEqual(false);
        expect(result.message).toEqual('조회할 전화번호를 입력하세요.');
    });

    it("전화번호가 올바르지 않을 때 status false", async function(){
        let result = await fn.call(fn, {contact: 'aaa'});

        expect(result.status).toEqual(false);
        expect(result.message).toContain('휴대전화번호 형식이 올바르지 않습니다.');
    });


    it("3개의 노쇼기록이 있을 때", async function(){
        await db.addNoShow(email, phone, '20190501', '지각');
        await db.addNoShow(email, phone, '20190401', '지각');
        await db.addNoShow(email, phone, '20190301', '지각');

        let result = await fn.call(fn, {contact: phone});

        let data = result.data;
        let summary = data.summary;
        let list = data.detail;

        expect(summary.contact).toEqual(phone);
        expect(summary.noShowCount).toEqual(3);
        expect(summary.lastNoShowDate).toEqual('20190501');

        expect(list.length).toEqual(3);
        list.forEach(noShow => {
            expect(noShow.noShowKey).toEqual(sha256(phone));
        });

        expect(list[2].date).toEqual('20190501');
    });

    it("노쇼기록이 없을 때", async function(){
        let result = await fn.call(fn, {contact: phone});

        let data = result.data;
        let summary = data.summary;
        let list = data.detail;

        expect(summary.contact).toEqual(phone);
        expect(summary.noShowCount).toEqual(0);
        expect(summary.lastNoShowDate).toEqual('');

        expect(list.length).toEqual(0);
    });
});

describe("addNoShow", function() {

    let phone = '01011112222';
    let email = 'soonsm@gmail.com';

    let del = async function(){
        await db.delAllNoShowWithPhone(phone);
    }

    beforeEach(del);

    let fn = handler.addNoShow;
    fn.email = email;

    it("노쇼 추가 시 리턴 값 확인", async function(){
        let noshow = {id: 'aasdasdasd',
            contact: phone,
            name: '김승민',
            noShowCase: '지각',
            date: '20190606'};

        let result = await fn.call(fn, noshow);

        expect(result.status).toEqual(true);
        let data = result.data;
        expect(data.id).toEqual(noshow.id);
        expect(data.contact).toEqual(noshow.contact);
        expect(data.name).toEqual(noshow.name);
        expect(data.noShowCase).toEqual(noshow.noShowCase);
        expect(data.date).toEqual(noshow.date);
        expect(data.noShowCount).toEqual(1);
    });

    it("노쇼 추가 시 아이디가 겹칠 때 에러 리턴", async function(){
        let noshow = {id: 'aasdasdasd',
            contact: phone,
            name: '김승민',
            noShowCase: '지각',
            date: '20190606'};

        let result = await fn.call(fn, noshow);

        expect(result.status).toEqual(true);
        let data = result.data;
        expect(data.id).toEqual(noshow.id);
        expect(data.contact).toEqual(noshow.contact);
        expect(data.name).toEqual(noshow.name);
        expect(data.noShowCase).toEqual(noshow.noShowCase);
        expect(data.date).toEqual(noshow.date);
        expect(data.noShowCount).toEqual(1);

        result = await fn.call(fn, noshow);

        expect(result.status).toEqual(false);
        expect(result.message).toEqual('노쇼 아이디가 겹칩니다.');
    });
});

describe("delNoShow", function() {

    let phone = '01011112222';
    let email = 'soonsm@gmail.com';

    let del = async function(){
        await db.delAllNoShowWithPhone(phone);
    }

    beforeEach(del);

    let fn = handler.delNoShow;
    fn.email = email;

    it("노쇼 삭제 성공 시 status true", async function(){
        let noshow = await db.addNoShow(email, phone, '20190501', '지각');

        let result = await fn.call(fn, noshow);

        expect(result.status).toEqual(true);
    });

    it("노쇼 삭제 실패 시 status false", async function(){
        await db.addNoShow(email, phone, '20190501', '지각');

        let result = await fn.call(fn, {id: 'aa'});

        expect(result.status).toEqual(false);
    });


});