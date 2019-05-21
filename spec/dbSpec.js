'user strict';

if (!global.nmns) {
    global.nmns = {};
}

require('./../bin/logger');
require('./../bin/constant');

// process.env.NODE_ENV = process.nmns.MODE.PRODUCTION;
process.env.NODE_ENV = process.nmns.MODE.DEVELOPMENT;

const db = require('./../bin/newDb');
const moment = require('moment');


let email = 'soonsm@gmail.com';
/*
describe("NoShow", function() {

    let phone = '01011112222';
    let email2 = 'soonsm2@gmail.com'
    let noShowDate = '20190516';
    let noShowCase = '단순지각';

    let del = async function(){
        let deleted = await db.delNoShowWithPhone(phone, email);
        do{
            deleted = await db.delNoShowWithPhone(phone, email);
        }while(deleted);

        deleted = await db.delNoShowWithPhone(phone, email2);
        do{
            deleted = await db.delNoShowWithPhone(phone, email2);
        }while(deleted);
    }

    beforeEach(del);

    afterEach(del);

    describe("addNoShow(email, phone, noShowdate, noShowCase, id)", function() {
        it("추가 시 추가된 항목 반환", async function() {

            let result = await db.addNoShow(email,phone,noShowDate, noShowCase);

            expect(result.email).toEqual(email);
        });

        it("전화번호가 잘못되었을 때 exception", async function(){
            try{
                await db.addNoShow(email, 'sdaddasdasd', noShowDate, noShowCase);
                fail('에러가 발생해야함');
            }catch(e){
                expect(e).not.toBe(null);
            }
        });
    });

    describe("getNoShow(phone, email)", function(){
        beforeEach(async function(){
            await db.addNoShow(email,phone,noShowDate, noShowCase);
            await db.addNoShow(email2,phone,noShowDate, noShowCase);
        });

        it('전화번호로 조회 시 리스트 반환', async function(){
            let list = await db.getNoShow(phone);

            expect(Array.isArray(list)).toBe(true);
        });

        it('전화번호와 이메일로 조회 시 이메일에 국한된 리스트만 조회', async function(){
            let list = await db.getNoShow(phone, email);

            list.forEach(item => {
                expect(item.email).toBe(email);
            })
        })
    });

    describe("delNoShow(id)", function(){
        let noshow;
        beforeEach(async function(){
            noshow = await db.addNoShow(email,phone,noShowDate, noShowCase);
        });

        it('삭제 성공 시 true 반환', async function(){
            expect((await db.delNoShow(noshow.id)).id).toBe(noshow.id);
        });

        it('삭제 실패 시 undefined 반환', async function(){
            expect(await db.delNoShow('asd')).toBe(undefined);
        });
    });
});

describe("VisitLog", function() {

    let moment = require('moment');
    let device = 'pc';

    it('visitLog(email, device)', async function(){
        let visitLog = await db.visitLog(email, device);

        expect(visitLog.email).toEqual(email);
        expect(visitLog.device).toEqual(device);
        expect(visitLog.timestamp).toContain(moment().format('YYYYMMDDhhmm'));
    });

    it('exitLog(visitLog)', async function(){
        let visitLog = await db.visitLog(email, device);

        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        await sleep(2000);

        let exitLog = await db.exitLog(visitLog);
        expect(exitLog.diff).toEqual(2);
    });
});
describe("Customer", function() {

    beforeEach(async function(){
        await db.deleteAllCustomer(email);
    });

    describe('getCustomerList(email, contact, name)', function(){

        it('여러명 있을 때 이름과 연락처로 한정하면 한 개 조회 성공', async function(){
            await db.saveCustomer(email, 'aaaaa', '김승민', '01011112222');
            await db.saveCustomer(email, 'aaaaabbbb', '김승민', '01011113333');

            let list = await db.getCustomerList(email, '01011112222', '김승민');

            expect(list.length).toEqual(1);
            expect(list[0].id).toEqual('aaaaa');
        });

        it('여러명 있을 때 이름으로 사람 수 만큼 조회 성공', async function(){
            await db.saveCustomer(email, 'aaaaa', '김승민', '01011112222');
            await db.saveCustomer(email, 'aaaaabbbb', '김승민', '01011113333');
            await db.saveCustomer(email, 'aaaaabccccc', '김승민', '01011113333');

            let list = await db.getCustomerList(email, undefined, '김승민');

            expect(list.length).toEqual(3);
        });

        it('여러명 있을 때 연락처로 사람 수 만큼 조회 성공', async function(){
            await db.saveCustomer(email, 'aaaaa', '김승만', '01011112222');
            await db.saveCustomer(email, 'aaaaabbbb', '김승만2', '01011112222');
            await db.saveCustomer(email, 'aaaaabccccc', '김승만3', '01011112223');

            let list = await db.getCustomerList(email, '01011112222');

            expect(list.length).toEqual(2);
        });

        it('없을 때 0개의 list 리턴', async function(){

            let list = await db.getCustomerList(email, '01011112222');

            expect(list.length).toEqual(0);
        });
    });

    describe('deleteCustomer(email,id)', function(){
       it('삭제 성공시 true 리턴', async function(){
          await db.saveCustomer(email, 'aaa', '김승민', '01028904311');

          expect((await db.deleteCustomer(email, 'aaa')).id).toEqual('aaa');
       });
       it('삭제 실패 시 undefined 리턴', async function(){
          expect(await db.deleteCustomer(email, '121212')).toEqual(undefined);
       });
    });

    describe('saveCustomer(email, id, name, contact, managerId, etc)', function(){
        it('성공 시 customer 리턴', async () => {

            let customer = {
                email: 'soonsm@gmail.com',
                id: 'aaaaa',
                name: '김승민',
                contact: '01028904311',
                managerId: 'asdasdasdasdasd',
                etc: 'etcetc'
            };

            let result = await db.saveCustomer(customer.email, customer.id, customer.name, customer.contact, customer.managerId, customer.etc);

            expect(result).toEqual(customer);
        });

        it('email이나 id 없으면 exception', async function(){

            try{
                await db.saveCustomer(undefined, 'asd', 'name', 'contact');
                fail();
            }catch(e){
                console.log(e);
            }
        });
        it('name contact 모두 없으면 exception', async function(){

            try{
                await db.saveCustomer('email', 'asd', undefined, undefined);
                fail();
            }catch(e){
                console.log(e);
            }
        });
        it('이미 있으면 업데이트', async function(){
            let customer = {
                email: 'soonsm@gmail.com',
                id: 'aaaaa',
                name: '김승민',
                contact: '01028904311',
                managerId: 'asdasdasdasdasd',
                etc: 'etcetc'
            };

            let result = await db.saveCustomer(customer.email, customer.id, customer.name, customer.contact, customer.managerId, customer.etc);

            expect(result).toEqual(customer);

            customer.etc = 'etc';
            result = await db.saveCustomer(customer.email, customer.id, customer.name, customer.contact, customer.managerId, customer.etc);

            expect(result).toEqual(customer);
        });
    });
});
describe('AlrimTalkHist', function(){

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

    describe('getAlrimTalkList(email, start, end, contact)', function(){

        it('email로만 조회 했을 때 전체 조회됨', async function(){
            await db.addAlrmTalk(alrimTalk);

            alrimTalk.contact = '01011112222';
            alrimTalk.name = '김승만';
            alrimTalk.contents = '예약했어';
            alrimTalk.reservationKey = '11';
            await db.addAlrmTalk(alrimTalk);

            alrimTalk.contact = '01011113333';
            alrimTalk.name = '김승만2';
            alrimTalk.contents = '예약했어2';
            alrimTalk.reservationKey = '1221';
            await db.addAlrmTalk(alrimTalk);

            let list = await db.getAlrimTalkList(email);

            expect(list.length).toEqual(3);
        });

        it('email과 연락처로 조회 시 조회됨', async function(){
            await db.addAlrmTalk(alrimTalk);

            alrimTalk.contact = '01011112222';
            alrimTalk.name = '김승만';
            alrimTalk.contents = '예약했어';
            alrimTalk.reservationKey = '11';
            await db.addAlrmTalk(alrimTalk);

            alrimTalk.contact = '01011113333';
            alrimTalk.name = '김승만2';
            alrimTalk.contents = '예약했어2';
            alrimTalk.reservationKey = '1221';
            await db.addAlrmTalk(alrimTalk);

            let list = await db.getAlrimTalkList(email, undefined, undefined, '01028904311');

            expect(list.length).toEqual(1);
            expect(list[0].contact).toEqual('01028904311');
        });

        it('start에 값 있을 때 적용되는지 확인', async function(){
            await db.addAlrmTalk(alrimTalk);

            alrimTalk.contact = '01011112222';
            alrimTalk.name = '김승만';
            alrimTalk.contents = '예약했어';
            alrimTalk.reservationKey = '11';
            await db.addAlrmTalk(alrimTalk);

            alrimTalk.contact = '01011113333';
            alrimTalk.name = '김승만2';
            alrimTalk.contents = '예약했어2';
            alrimTalk.reservationKey = '1221';
            await db.addAlrmTalk(alrimTalk);

            alrimTalk.contact = '01011114444';
            alrimTalk.name = '김승만3';
            alrimTalk.contents = '예약했어3';
            alrimTalk.reservationKey = '1223';
            alrimTalk.date = '20180102';
            alrimTalk.sendDate = '20180102121212000';
            await db.addAlrmTalkRaw(alrimTalk);

            let list = await db.getAlrimTalkList(email, '20190101', undefined);

            expect(list.length).toEqual(3);
        });

        it('end에 값 있을 때 적용되는지 확인', async function(){
            await db.addAlrmTalk(alrimTalk);

            alrimTalk.contact = '01011112222';
            alrimTalk.name = '김승만';
            alrimTalk.contents = '예약했어';
            alrimTalk.reservationKey = '11';
            await db.addAlrmTalk(alrimTalk);

            alrimTalk.contact = '01011113333';
            alrimTalk.name = '김승만2';
            alrimTalk.contents = '예약했어2';
            alrimTalk.reservationKey = '1221';
            await db.addAlrmTalk(alrimTalk);

            alrimTalk.contact = '01011114444';
            alrimTalk.name = '김승만3';
            alrimTalk.contents = '예약했어3';
            alrimTalk.reservationKey = '1223';
            alrimTalk.date = '20180102';
            alrimTalk.sendDate = '20180102121212000';
            await db.addAlrmTalkRaw(alrimTalk);

            let list = await db.getAlrimTalkList(email, undefined, '20190101');

            expect(list.length).toEqual(1);
        });

        it('start와 end에 값 있을 때 적용되는지 확인', async function(){
            await db.addAlrmTalk(alrimTalk);

            alrimTalk.contact = '01011112222';
            alrimTalk.name = '김승만';
            alrimTalk.contents = '예약했어';
            alrimTalk.reservationKey = '11';
            await db.addAlrmTalk(alrimTalk);

            alrimTalk.contact = '01011113333';
            alrimTalk.name = '김승만2';
            alrimTalk.contents = '예약했어2';
            alrimTalk.reservationKey = '1221';
            await db.addAlrmTalk(alrimTalk);

            alrimTalk.contact = '01011114444';
            alrimTalk.name = '김승만3';
            alrimTalk.contents = '예약했어3';
            alrimTalk.reservationKey = '1223';
            alrimTalk.date = '20180102';
            alrimTalk.sendDate = '20180102121212000';
            await db.addAlrmTalkRaw(alrimTalk);

            alrimTalk.contact = '01011114444';
            alrimTalk.name = '김승만4';
            alrimTalk.contents = '예약했어4';
            alrimTalk.reservationKey = '1224';
            alrimTalk.date = '20180103';
            alrimTalk.sendDate = '20180103121212000';
            await db.addAlrmTalkRaw(alrimTalk);

            let list = await db.getAlrimTalkList(email, '20180103', '20190101');

            expect(list.length).toEqual(1);
        });

        it('start와 end와 contact에 값 있을 때 적용되는지 확인', async function(){
            await db.addAlrmTalk(alrimTalk);

            alrimTalk.contact = '01044444444';
            alrimTalk.name = '김승만';
            alrimTalk.contents = '예약했어';
            alrimTalk.reservationKey = '11';
            await db.addAlrmTalk(alrimTalk);

            alrimTalk.contact = '01044444444';
            alrimTalk.name = '김승만2';
            alrimTalk.contents = '예약했어2';
            alrimTalk.reservationKey = '1221';
            await db.addAlrmTalk(alrimTalk);

            alrimTalk.contact = '01044444444';
            alrimTalk.name = '김승만3';
            alrimTalk.contents = '예약했어3';
            alrimTalk.reservationKey = '1223';
            alrimTalk.date = '20180102';
            alrimTalk.sendDate = '20180102121212000';
            await db.addAlrmTalkRaw(alrimTalk);

            alrimTalk.contact = '01044444444';
            alrimTalk.name = '김승만4';
            alrimTalk.contents = '예약했어4';
            alrimTalk.reservationKey = '1224';
            alrimTalk.date = '20180103';
            alrimTalk.sendDate = '20180103121212000';
            await db.addAlrmTalkRaw(alrimTalk);

            alrimTalk.contact = '01044444444';
            alrimTalk.name = '김승만4';
            alrimTalk.contents = '예약했어4';
            alrimTalk.reservationKey = '1224';
            alrimTalk.date = '20180110';
            alrimTalk.sendDate = '20180110121212000';
            await db.addAlrmTalkRaw(alrimTalk);

            let list = await db.getAlrimTalkList(email, '20180104', '20190101', '01044444444');

            expect(list.length).toEqual(1);
        });
    });
    
    describe('addAlrimTalk({email, isCancel, contact, name, contents, reservationKey})',function(){
        it('성공 시 결과 확인', async function(){
            let result = await db.addAlrmTalk(alrimTalk);
            expect(alrimTalk).toEqual(result);
        });
        it('email 없을 때 실패 확인', async function(){
            delete alrimTalk.email;
            try{
                await db.addAlrmTalk(alrimTalk);
                fail();
            }catch(e){
                expect(e).toBeTruthy();
            }
        });
        it('inCancel 오류일 때 실패 확인', async function(){
            alrimTalk.isCancel = 'aaa';
            try{
                await db.addAlrmTalk(alrimTalk);
                fail();
            }catch(e){
                expect(e).toBeTruthy();
            }
        });
        it('contacnt 오류일 때 실패 확인', async function(){
            alrimTalk.contact = 'aaa';
            try{
                await db.addAlrmTalk(alrimTalk);
                fail();
            }catch(e){
                expect(e).toBeTruthy();
            }
        });
        it('reservationKey 오류일 때 실패 확인', async function(){
            delete alrimTalk.reservationKey;
            try{
                await db.addAlrmTalk(alrimTalk);
                fail();
            }catch(e){
                expect(e).toBeTruthy();
            }
        });
    });
});


describe('Push', function(){
    let push = {};
    beforeEach(async function(){
        push = {
            email: email,
            title: 'title',
            contents: 'contents',
            data: {},
            type: 'SCHEDULE_CANCELED',
            isRead: false
        }
        await db.deleteAllPush(email);
    })

    describe('addPush({email, title, contents, data, type, isRead})', function(){
        it('성공 시 반환', async function(){
           let result = await db.addPush(push);

           expect(result).toEqual(push);
        });
        it('email 없을 때 exception 반환', async function(){

            delete push.email;

            try{
                await db.addPush(push);
                fail();
            }catch(e){
            }
        });
    });

    describe('getPushList(email, pageSize, page)', function(){
        it('조회 시 역순으로 반환되는지 확인', async function(){

            push.id = '20190102010101000';
            push.registeredDate = push.id.substring(0,12);
            await db.addPushRaw(push);

            push.id = '20190104010101000';
            push.registeredDate = push.id.substring(0,12);
            await db.addPushRaw(push);

            push.id = '20190103010101000';
            push.registeredDate = push.id.substring(0,12);
            await db.addPushRaw(push);

            push.id = '20190101010101000';
            push.registeredDate = push.id.substring(0,12);
            await db.addPushRaw(push);

            let list = await db.getPushList(email, 5, 1);

            expect(list.length).toEqual(4);

            expect(list[0].id).toEqual('20190104010101000');
            expect(list[1].id).toEqual('20190103010101000');
            expect(list[2].id).toEqual('20190102010101000');
            expect(list[3].id).toEqual('20190101010101000');
        })

        it('2page 조회 조회되는지 확인', async function(){

            let date = '20190101';
            for(let i=1; i<= 10; i++){
                date = moment(date,'YYYYMMDD').add(1,'d').format('YYYYMMDD');
                push.registeredDate = date;
                push.id = push.registeredDate + '010101000';
                await db.addPushRaw(push);
            }

            let list = await db.getPushList(email, 5, 1);
            expect(list.length).toEqual(5);
            expect(list[0].registeredDate).toEqual('20190111');

            list = await db.getPushList(email, 5, 2);
            expect(list.length).toEqual(5);
            expect(list[0].registeredDate).toEqual('20190106');
        });

        it('page 넘어가면 빈 list 반환', async function(){
            let date = '20190101';
            for(let i=1; i<= 10; i++){
                date = moment(date,'YYYYMMDD').add(1,'d').format('YYYYMMDD');
                push.registeredDate = date;
                push.id = push.registeredDate + '010101000';
                await db.addPushRaw(push);
            }

            let list = await db.getPushList(email, 5, 1);
            expect(list.length).toEqual(5);
            expect(list[0].registeredDate).toEqual('20190111');

            list = await db.getPushList(email, 5, 2);
            expect(list.length).toEqual(5);
            expect(list[0].registeredDate).toEqual('20190106');

            list = await db.getPushList(email, 5, 3);
            expect(list.length).toEqual(0);
        });

        it('page 및 pageSize 잘못 세팅시 에러', async function(){
            try{
                await db.getPushList(email, 0, 0);
                fail();
            }catch(e){
                expect(e).toBeTruthy();
            }
        });
    });
});
describe('Reservation', function () {
    let reservation;
    beforeEach(async function () {
        reservation = {
            email: email,
            start: '201905191230',
            end: '201905191330',
            id: 'aaaaa',
            member: 'memberId',
            manager: 'managerId',
            contentList: ['Nail Cleaning'],
            etc: 'etc',
            status: process.nmns.RESERVATION_STATUS.RESERVED

        };
        await db.deleteAllReservation(email);
    });

    describe('addReservation(data)', function () {
        it('추가 시 리턴 값 확인', async function () {
            let result = await db.addReservation(reservation);
            delete result.timestamp;
            delete result.isAllDay;
            delete result.type;
            delete result.cancelDate;

            expect(result).toEqual(reservation);
        });
        it('수정 시 리턴 값 확인', async function () {
            await db.addReservation(reservation);

            reservation.etc = 'etc2';

            let result = await db.addReservation(reservation);
            delete result.timestamp;
            delete result.isAllDay;
            delete result.type;
            delete result.cancelDate;

            expect(result).toEqual(reservation);
        });
        it('에러 시 exception', async function () {
            try {
                delete reservation.email;
                await db.addReservation(reservation);
                fail();
            } catch (e) {
                expect(e).toBeTruthy();
            }
        });
    });

    describe('getReservationList(email, start, end)', function(){
       it('start와 end사이 조회 성공', async function(){
           reservation.start = '201905101230';
           reservation.end = '201905201330';
           await db.addReservation(reservation);

           reservation.start = '201906101230';
           reservation.end = '201906201330';
           await db.addReservation(reservation);

           reservation.start = '201907101230';
           reservation.end = '201907201330';
           await db.addReservation(reservation);

           let list = await db.getReservationList(email, '201905211330', '201906091230');
           expect(list.length).toEqual(0);

           list = await db.getReservationList(email, '201906101230', '201906201330');
           expect(list.length).toEqual(1);

           list = await db.getReservationList(email, '201906091230', '201906211330');
           expect(list.length).toEqual(1);

           list = await db.getReservationList(email, '201906201330', '201908201330');
           expect(list.length).toEqual(2);

           list = await db.getReservationList(email, '201907191330', '201908201330');
           expect(list.length).toEqual(1);
       });

        it('조회 시 start 오름차순으로 리턴', async function(){

            reservation.start = '201906101230';
            reservation.end = '201906201330';
            await db.addReservation(reservation);

            reservation.start = '201907101230';
            reservation.end = '201907201330';
            await db.addReservation(reservation);

            reservation.start = '201905101230';
            reservation.end = '201905201330';
            await db.addReservation(reservation);

            let list = await db.getReservationList(email, '201905101230', '201907201330');

            expect(list[0].start).toEqual('201905101230');
            expect(list[1].start).toEqual('201906101230');
            expect(list[2].start).toEqual('201907101230');

        });
       
       it('조회 실패 시 빈 list 리턴', async function(){
           list = await db.getReservationList(email, '201906201330', '201908201330');
           expect(list.length).toEqual(0);
       })
        it('조회시 삭제 된거 빼고 리턴', async function(){
            reservation.start = '201906101230';
            reservation.end = '201906201330';
            await db.addReservation(reservation);

            reservation.start = '201907101230';
            reservation.end = '201907201330';
            await db.addReservation(reservation);

            reservation.start = '201905101230';
            reservation.end = '201905201330';
            reservation.status = 'DELETED'
            await db.addReservation(reservation);

            let list = await db.getReservationList(email, '201905101230', '201907201330');

            expect(list.length).toEqual(2);
       })
    });
});
*/

describe('Task', function () {
    let task;
    beforeEach(async function () {
        task = {
            email: email,
            start: '201905191230',
            end: '201905191330',
            id: 'aaaaa',
            manager: 'managerId',
            contents: 'contents',
            etc: 'etc',
            isDone: false,
            status: process.nmns.RESERVATION_STATUS.RESERVED

        };
        await db.deleteAllTask(email);
    });

    describe('saveTask(data)', function () {
        it('추가 시 리턴 값 확인', async function () {
            let result = await db.saveTask(task);
            delete result.timestamp;
            delete result.isAllDay;
            delete result.type;

            expect(result).toEqual(task);
        });
        it('수정 시 리턴 값 확인', async function () {
            await db.saveTask(task);

            task.etc = 'etc2';

            let result = await db.saveTask(task);
            delete result.timestamp;
            delete result.isAllDay;
            delete result.type;

            expect(result).toEqual(task);
        });
        it('에러 시 exception', async function () {
            try {
                delete task.email;
                await db.saveTask(task);
                fail();
            } catch (e) {
                expect(e).toBeTruthy();
            }
        });
    });

    describe('getTaskList(email, start, end)', function(){

        it('조회 실패 시 빈 list 리턴', async function(){
            let list = await db.getTaskList(email, '201906201330', '201908201330');
            expect(list.length).toEqual(0);
        })
        it('조회시 삭제 된거 빼고 리턴', async function(){
            task.start = '201906101230';
            task.end = '201906201330';
            await db.saveTask(task);

            task.start = '201907101230';
            task.end = '201907201330';
            await db.saveTask(task);

            task.start = '201905101230';
            task.end = '201905201330';
            task.status = 'DELETED'
            await db.saveTask(task);

            let list = await db.getTaskList(email, '201905101230', '201907201330');

            expect(list.length).toEqual(2);
        });
        it('start와 end사이 조회 성공', async function(){
            task.start = '201905101230';
            task.end = '201905201330';
            await db.saveTask(task);

            task.start = '201906101230';
            task.end = '201906201330';
            await db.saveTask(task);

            task.start = '201907101230';
            task.end = '201907201330';
            await db.saveTask(task);

            let list = await db.getTaskList(email, '201905211330', '201906091230');
            expect(list.length).toEqual(0);

            list = await db.getTaskList(email, '201906101230', '201906201330');
            expect(list.length).toEqual(1);

            list = await db.getTaskList(email, '201906091230', '201906211330');
            expect(list.length).toEqual(1);

            list = await db.getTaskList(email, '201906201330', '201908201330');
            expect(list.length).toEqual(2);

            list = await db.getTaskList(email, '201907191330', '201908201330');
            expect(list.length).toEqual(1);
        });

        it('조회 시 start 오름차순으로 리턴', async function(){

            task.start = '201906101230';
            task.end = '201906201330';
            await db.saveTask(task);

            task.start = '201907101230';
            task.end = '201907201330';
            await db.saveTask(task);

            task.start = '201905101230';
            task.end = '201905201330';
            await db.saveTask(task);

            let list = await db.getTaskList(email, '201905101230', '201907201330');

            expect(list[0].start).toEqual('201905101230');
            expect(list[1].start).toEqual('201906101230');
            expect(list[2].start).toEqual('201907101230');

        });
    });
});