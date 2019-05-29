'user strict';

if (!global.nmns) {
    global.nmns = {};
}

require('./../bin/logger');
require('./../bin/constant');

// process.env.NODE_ENV = process.nmns.MODE.PRODUCTION;
process.env.NODE_ENV = process.nmns.MODE.DEVELOPMENT;

const db = require('./../bin/newDb');
const webDb = require('./../bin/webDb');
const handler = require('./../bin/reservationHandler');
const moment = require('moment');

const logger = global.nmns.LOGGER;

let email = 'soonsm@gmail.com';

describe('Reservation', function () {
    let reservation, customer;
    beforeEach(async () => {
        customer = {
            email: 'soonsm@gmail.com',
            id: 'customerId',
            name: '김승민',
            contact: '01028904311',
            managerId: 'asdasdasdasdasd',
            etc: 'etcetc',
            pointMembership: 0,
            cardSales: 0,
            cashSales: 0,
            pointSales: 0
        };

        reservation = {
            email: email,
            start: '201905191230',
            end: '201905191330',
            id: 'reservationId',
            contact: '01028904311',
            name: '김승민',
            member: 'customerId',
            manager: 'managerId',
            etc: 'etc',
            isAllDay: false,
            status: process.nmns.RESERVATION_STATUS.RESERVED
        };
        await db.deleteAllReservation(email);
        await db.deleteAllCustomer(email);
        await db.deleteAllAlrimTalk(email);
        await db.delAllNoShowWithPhone(reservation.contact);
    });

    describe('add reserv', function () {
        it('contact 없으면 exception', async function () {
            try {
                let fn = handler.addReservation;
                fn.email = email;
                let result = await fn.call(fn, {});

                expect(result.status).toEqual(false);
                expect(result.message).toContain('연락처는 필수입니다.');
            } catch (e) {
                fail();
                logger.error(e);
            }
        });
        it('예약 추가 후 항목 비교', async function () {
            try {

                reservation.contents = '[{"id": 0, "value":"네일케어"},{"id": 1, "value":"페디케어"}]';

                let fn = handler.addReservation;
                fn.email = email;
                let result = await fn.call(fn, reservation);

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                let data = await db.getReservation(email, reservation.id);

                reservation.contentList = [{"id": 0, "value":"네일케어"},{"id": 1, "value":"페디케어"}];
                reservation.type = 'R';
                delete reservation.contents;
                delete data.timestamp;

                expect(data).toEqual(reservation);
            } catch (e) {
                fail();
                logger.error(e);
            }
        });
        it('예약 추가 후 고객 추가되었는지 확인 ', async function () {
            try {

                reservation.contents = '[{"id": 0, "value":"네일케어"},{"id": 1, "value":"페디케어"}]';

                let fn = handler.addReservation;
                fn.email = email;
                let result = await fn.call(fn, reservation);

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                let customerList = await db.getCustomerList(email, reservation.contact, reservation.name);

                expect(customerList.length).toEqual(1);
                expect(customerList[0].name).toEqual(reservation.name);
                expect(customerList[0].contact).toEqual(reservation.contact);
            } catch (e) {
                fail();
                logger.error(e);
            }
        });
        it('예약 추가 후 알림톡 추가되었는지 확인 ', async function () {
            try {

                reservation.contents = '[{"id": 0, "value":"네일케어"},{"id": 1, "value":"페디케어"}]';

                let fn = handler.addReservation;
                fn.email = email;
                let result = await fn.call(fn, reservation);

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                let list = await db.getAlrimTalkList(email);
                expect(list.length).toEqual(1);
                expect(list[0].name).toEqual(reservation.name);
                expect(list[0].contact).toEqual(reservation.contact);

            } catch (e) {
                fail();
                logger.error(e);
            }
        });
    });

    describe('updateReservation', function () {
        it('should 없는 예약일 때 exception', async function () {
            try {
                let fn = handler.updateReservation;
                fn.email = email;
                let result = await fn.call(fn, reservation);
                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(false);
            } catch (e) {
                logger.error(e);
                fail();
            }
        });

        it('should 예약 수정 후 바뀐 내용으로 조회되는지 확인', async function () {
            try {
                reservation.contents = '[{"id": 0, "value":"네일케어"},{"id": 1, "value":"페디케어"}]';
                let fn = handler.addReservation;
                fn.email = email;
                let result = await fn.call(fn, reservation);

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                reservation.contents = '[{"id": 0, "value":"네일케어2"},{"id": 1, "value":"페디케어2"}]';
                reservation.etc = 'sdfsdf';
                fn = handler.updateReservation;
                fn.email = email;
                result = await fn.call(fn, reservation);
                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                let data = await db.getReservation(email, reservation.id);
                delete reservation.contents;
                reservation.contentList = [{"id": 0, "value":"네일케어2"},{"id": 1, "value":"페디케어2"}];
                expect(data).toEqual(reservation);
            } catch (e) {
                logger.error(e);
                fail();
            }
        });

        it('should 예약 수정 시 신규 고객이 있으면 고객 추가 됨', async function () {
            try {
                reservation.contents = '[{"id": 0, "value":"네일케어"},{"id": 1, "value":"페디케어"}]';
                let fn = handler.addReservation;
                fn.email = email;
                let result = await fn.call(fn, reservation);

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                reservation.name = '김승민2';
                reservation.contact = '01011112222';
                fn = handler.updateReservation;
                fn.email = email;
                result = await fn.call(fn, reservation);
                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                let data = await db.getReservation(email, reservation.id);
                delete reservation.contents;
                expect(data).toEqual(reservation);

                let list = await db.getCustomerList(email, reservation.contact, reservation.name);
                expect(list.length).toEqual(1);
                expect(list[0].name).toEqual('김승민2');
                expect(list[0].contact).toEqual('01011112222');
            } catch (e) {
                logger.error(e);
                fail();
            }
        });

        it('should 노쇼 처리 시 노쇼 리스트에 추가됨', async function () {
            try {
                reservation.contents = '[{"id": 0, "value":"네일케어"},{"id": 1, "value":"페디케어"}]';
                let fn = handler.addReservation;
                fn.email = email;
                let result = await fn.call(fn, reservation);

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                reservation.status = process.nmns.RESERVATION_STATUS.NOSHOW;
                fn = handler.updateReservation;
                fn.email = email;
                result = await fn.call(fn, reservation);
                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                let data = await db.getReservation(email, reservation.id);
                delete reservation.contents;
                expect(data).toEqual(reservation);

                let list = await db.getNoShow(reservation.contact, email);
                expect(list.length).toEqual(1);
                expect(list[0].date).toEqual(data.start.substring(0, 8));
            } catch (e) {
                logger.error(e);
                fail();
            }
        });

        it('should 노쇼 상태에서 예약 상태로 되돌리면 노쇼 삭제됨', async function () {
            try {
                reservation.contents = '[{"id": 0, "value":"네일케어"},{"id": 1, "value":"페디케어"}]';
                let fn = handler.addReservation;
                fn.email = email;
                let result = await fn.call(fn, reservation);

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                reservation.status = process.nmns.RESERVATION_STATUS.NOSHOW;
                fn = handler.updateReservation;
                fn.email = email;
                result = await fn.call(fn, reservation);
                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                let data = await db.getReservation(email, reservation.id);
                delete reservation.contents;
                expect(data).toEqual(reservation);

                let list = await db.getNoShow(reservation.contact, email);
                expect(list.length).toEqual(1);
                expect(list[0].date).toEqual(data.start.substring(0, 8));

                reservation.status = process.nmns.RESERVATION_STATUS.CANCELED;
                result = await fn.call(fn, reservation);
                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                data = await db.getReservation(email, reservation.id);
                delete reservation.contents;
                expect(data).toEqual(reservation);

                list = await db.getNoShow(reservation.contact, email);
                expect(list.length).toEqual(0);
            } catch (e) {
                logger.error(e);
                fail();
            }
        });

        it('should 전화번호 바뀌고 상태가 예약 상태면 알림톡 전송', async function () {
            try {
                reservation.contents = '[{"id": 0, "value":"네일케어"},{"id": 1, "value":"페디케어"}]';
                let fn = handler.addReservation;
                fn.email = email;
                let result = await fn.call(fn, reservation);

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                await db.deleteAllAlrimTalk(email);

                reservation.contact = '01011112323';
                fn = handler.updateReservation;
                fn.email = email;
                result = await fn.call(fn, reservation);
                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                let data = await db.getReservation(email, reservation.id);
                delete reservation.contents;
                expect(data).toEqual(reservation);

                let list = await db.getAlrimTalkList(email);
                expect(list.length).toEqual(1);
                expect(list[0].name).toEqual(reservation.name);
                expect(list[0].contact).toEqual(reservation.contact);
                logger.error(list);
            } catch (e) {
                logger.error(e);
                fail();
            }
        });
    });

    describe('getReservationRaw', function(){
        it('should 파라메터 없어도 조회', async function () {
            try {
                let fn = handler.getReservationListRaw;
                fn.email = email;
                let result = await fn.call(fn, {});
                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);
                expect(result.data.length).toEqual(0);
            } catch (e) {
                fail();
                logger.error(e);
            }
        });
        it('should 개수만큼 조회', async function () {
            try {
                reservation.contents = '[{"id": 0, "value":"네일케어"},{"id": 1, "value":"페디케어"}]';

                let fn = handler.addReservation;
                fn.email = email;
                let result = await fn.call(fn, reservation);

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                fn = handler.getReservationListRaw;
                fn.email = email;
                result = await fn.call(fn, {start:'20190519', end:'20190519'});

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);
                let list = result.data;
                expect(list.length).toEqual(1);

                let data = list[0];
                expect(data.id).toEqual(reservation.id);
                expect(data.type).toEqual('R');
                expect(data.name).toEqual(reservation.name);
                expect(data.contact).toEqual(reservation.contact);
                expect(data.start).toEqual(reservation.start);
                expect(data.end).toEqual(reservation.end);
                expect(data.isAllDay).toEqual(false);
                expect(data.contentList).toEqual([{"id": 0, "value":"네일케어"},{"id": 1, "value":"페디케어"}]);
                expect(data.manager).toEqual(reservation.manager);
                expect(data.etc).toEqual(reservation.etc);
                expect(data.status).toEqual(reservation.status);
            } catch (e) {
                fail();
                logger.error(e);
            }
        });
    });

    describe('getReservationSummaryList', function(){
        it('아무 것도 없이 조회 하면 전체 리스트 조회', async function(){
            try {
                reservation.start = '201905191230';
                reservation.end = '201905191330';
                reservation.contents = '[{"id": 0, "value":"네일케어"},{"id": 1, "value":"페디케어"}]';

                let fn = handler.addReservation;
                fn.email = email;
                let result = await fn.call(fn, reservation);

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                let reservation2 = JSON.parse(JSON.stringify(reservation));
                reservation2.start = '201805191230';
                reservation2.end = '201805191330';
                reservation2.contents = '[{"id": 0, "value":"네일케어2"},{"id": 1, "value":"페디케어2"}]';

                result = await fn.call(fn, reservation2);

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                fn = handler.getReservationSummaryList;
                fn.email = email;
                result = await fn.call(fn, {});

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);
                let list = result.data;
                expect(list.length).toEqual(2);

                let data = list[1];
                expect(data.id).toEqual(reservation.id);
                expect(data.name).toEqual(reservation.name);
                expect(data.contact).toEqual(reservation.contact);
                expect(data.start).toEqual(reservation.start);
                expect(data.end).toEqual(reservation.end);
                expect(JSON.parse(data.contents)).toEqual(JSON.parse(reservation.contents));
                expect(data.status).toEqual(reservation.status);

                data = list[0];
                expect(data.id).toEqual(reservation2.id);
                expect(data.name).toEqual(reservation2.name);
                expect(data.contact).toEqual(reservation2.contact);
                expect(data.start).toEqual(reservation2.start);
                expect(data.end).toEqual(reservation2.end);
                expect(JSON.parse(data.contents)).toEqual(JSON.parse(reservation2.contents));
                expect(data.status).toEqual(reservation2.status);
            } catch (e) {
                fail();
                logger.error(e);
            }
        });
    });
});

describe('Task', function(){
    let task;
    beforeEach(async function () {
        task = {
            email: email,
            start: '201905191230',
            end: '201905191330',
            id: 'aaaaa',
            name: '관리비 내기',
            manager: 'managerId',
            contents: 'contents',
            contact: '01011112222',
            etc: 'etc',
            isDone: false,
            status: process.nmns.RESERVATION_STATUS.RESERVED

        };
        await db.deleteAllTask(email);
    });
    describe('addTask', function(){
        it('추가 후 확인', async function(){
            try{
                let fn = handler.addTask;
                fn.email = email;
                let result = await fn.call(fn, task);

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);
                let data = await db.getTask(email, task.id);
                expect(data.id).toEqual(task.id);
                expect(data.type).toEqual('T');
                expect(data.name).toEqual(task.name);
                expect(data.contact).toEqual(task.contact);
                expect(data.start).toEqual(task.start);
                expect(data.isAllDay).toEqual(false);
                expect(data.isDone).toEqual(task.isDone);
                expect(data.manager).toEqual(task.manager);
                expect(data.status).toEqual(task.status);
                expect(data.contents).toEqual(task.contents);
            }catch(e){
                logger.error(e);
                fail();
            }
        });
    });
    describe('updateTask', function(){
        it('조회되는 일정 없으면 에러', async function () {
            try{
                let fn = handler.updateTask;
                fn.email = email;
                let result = await fn.call(fn, task);

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(false);

            }catch(e){
                logger.error(e);
                fail();
            }
        });
        it('수정 후 확인', async function(){
            try{
                let fn = handler.addTask;
                fn.email = email;
                let result = await fn.call(fn, task);

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);
                let data = await db.getTask(email, task.id);
                expect(data.id).toEqual(task.id);
                expect(data.type).toEqual('T');
                expect(data.name).toEqual(task.name);
                expect(data.contact).toEqual(task.contact);
                expect(data.start).toEqual(task.start);
                expect(data.isAllDay).toEqual(false);
                expect(data.isDone).toEqual(task.isDone);
                expect(data.manager).toEqual(task.manager);
                expect(data.status).toEqual(task.status);
                expect(data.contents).toEqual(task.contents);

                fn = handler.updateTask;
                fn.email = email;
                task.name = 'cccccc';
                task.contents = 'wowwowowow';
                task.isDone = true;
                task.isAllDay = true;
                result = await fn.call(fn, task);

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);
                data = await db.getTask(email, task.id);
                expect(data.id).toEqual(task.id);
                expect(data.type).toEqual('T');
                expect(data.name).toEqual(task.name);
                expect(data.contact).toEqual(task.contact);
                expect(data.start).toEqual(task.start);
                expect(data.isAllDay).toEqual(true);
                expect(data.isDone).toEqual(task.isDone);
                expect(data.manager).toEqual(task.manager);
                expect(data.status).toEqual(task.status);
                expect(data.contents).toEqual(task.contents);
            }catch(e){
                logger.error(e);
                fail();
            }
        });
    });

    describe('getTaskList', function(){
        it('should 파라메터 없어도 조회', async function () {
            try {
                let fn = handler.getTaskList;
                fn.email = email;
                let result = await fn.call(fn, {});
                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);
                expect(result.data.length).toEqual(0);

                fn = handler.addTask;
                fn.email = email;
                result = await fn.call(fn, task);

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                fn = handler.getTaskList;
                fn.email = email;
                result = await fn.call(fn, {});

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);
                let list = result.data;
                expect(list.length).toEqual(1);

                let data = list[0];
                expect(data.id).toEqual(task.id);
                expect(data.type).toEqual('T');
                expect(data.name).toEqual(task.name);
                expect(data.contact).toEqual(task.contact);
                expect(data.start).toEqual(task.start);
                expect(data.isAllDay).toEqual(false);
                expect(data.isDone).toEqual(task.isDone);
                expect(data.manager).toEqual(task.manager);
                expect(data.status).toEqual(task.status);
                expect(data.contents).toEqual(task.contents);
            } catch (e) {
                fail();
                logger.error(e);
            }
        });
        it('should 개수만큼 조회', async function () {
            try {

                let fn = handler.addTask;
                fn.email = email;
                let result = await fn.call(fn, task);

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                fn = handler.getTaskList;
                fn.email = email;
                result = await fn.call(fn, {start:'20190519', end:'20190519'});

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);
                let list = result.data;
                expect(list.length).toEqual(1);

                let data = list[0];
                expect(data.id).toEqual(task.id);
                expect(data.type).toEqual('T');
                expect(data.name).toEqual(task.name);
                expect(data.contact).toEqual(task.contact);
                expect(data.start).toEqual(task.start);
                expect(data.isAllDay).toEqual(false);
                expect(data.isDone).toEqual(task.isDone);
                expect(data.manager).toEqual(task.manager);
                expect(data.status).toEqual(task.status);
                expect(data.contents).toEqual(task.contents);
            } catch (e) {
                fail();
                logger.error(e);
            }
        });
        it('should 없으면 0개 조회', async function () {
            try {

                let fn = handler.addTask;
                fn.email = email;
                let result = await fn.call(fn, task);

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                fn = handler.getTaskList;
                fn.email = email;
                result = await fn.call(fn, {start:'20180519', end:'20180519'});

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);
                let list = result.data;
                expect(list.length).toEqual(0);

            } catch (e) {
                fail();
                logger.error(e);
            }
        });
    });
});