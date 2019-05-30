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
const webDb = require('./../bin/webDb');
const handler = require('./../bin/customerHandler');
const moment = require('moment');

describe('customerHandler', function() {

    let email = 'soonsm@gmail.com';
    let customer, reservation, sales;
    beforeEach(async () => {
        customer = {
            email: 'soonsm@gmail.com',
            id: 'customerId',
            name: '김승민',
            contact: '01028904311',
            managerId: 'managerId',
            etc: 'etcetc',
            pointMembership: 0,
            cardSales: 0,
            cashSales: 0,
            pointSales: 10
        };

        reservation = {
            email: email,
            start: '201905191230',
            end: '201905191330',
            id: 'reservationId',
            contact: '01028904311',
            member: 'customerId',
            manager: 'managerId',
            contentList: [{"id": 0, "value":"네일케어2"},{"id": 1, "value":"페디케어2"}],
            etc: 'etc',
            status: process.nmns.RESERVATION_STATUS.RESERVED
        };

        sales = {
            email: email,
            id: moment().format('YYYYMMDDHHmmssSSS'),
            date: moment().format('YYYYMMDD'),
            time: moment().format('HHmm'),
            item: '네일클리닝',
            price: 30000,
            customerId: 'customerId',
            payment: process.nmns.PAYMENT_METHOD.CARD,
            managerId: 'managerId',
            type: process.nmns.SALE_HIST_TYPE.SALES_CARD,
            scheduleId: 'reservationId',
            membershipChange: 10,
            balanceMembership: 0
        };

        await db.deleteAllSales(email);
        await db.deleteAllReservation(email);
        await db.deleteAllCustomer(email);
        await db.delAllNoShowWithPhone(customer.contact);

        let staffList = [
            {
                id: 'managerId',
                name: '매니저',
                color: 'RED'
            },
            {
                id: 'managerId2',
                name: '나매니저',
                color: 'RED'
            },
            {
                id: 'managerId3',
                name: '가매니저',
                color: 'RED'
            }
        ];
        await webDb.updateWebUser(email, {staffList: staffList});
    });

    describe('getCustomerDetail', function() {
        it('name contact 둘 다 없으면 에러', async function () {
            try{
                let fn = handler.getCustomerDetail;
                fn.email = email;
                let result = await fn.call(fn, {});

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(false);
            }catch(e){
                logger.error(e);
                fail();
            }
        });
        it('스펙에 나와있는 항목 확인', async function () {
            try{
                await db.saveCustomer(customer);
                await db.saveReservation(reservation);
                await db.addNoShow(email, customer.contact, '20190501', '지각');
                await db.addNoShow('soonsm2@gmail.com', customer.contact, '20190601', '지각');

                let fn = handler.getCustomerDetail;
                fn.email = email;
                let result = await fn.call(fn, {name: customer.name, contact: customer.contact});

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);
                let data = result.data;
                expect(data.id).toEqual(customer.id);
                expect(data.name).toEqual(customer.name);
                expect(data.contact).toEqual(customer.contact);
                expect(data.totalNoShow).toEqual(2);
                expect(data.myNoShow).toEqual(1);
                expect(data.isAllDay).toEqual(false);
                expect(data.managerId).toEqual(customer.managerId);
                expect(JSON.parse(data.contents)).toEqual(reservation.contentList);
                expect(data.pointMembership).toEqual(0);
                expect(data.cardSales).toEqual(0);
                expect(data.cashSales).toEqual(0);
                expect(data.pointSales).toEqual(10);

            }catch(e){
                logger.error(e);
                fail();
            }
        });
        it('연락처로만 조회 가능', async function () {
            try{
                await db.saveCustomer(customer);
                await db.saveReservation(reservation);
                await db.addNoShow(email, customer.contact, '20190501', '지각');
                await db.addNoShow('soonsm2@gmail.com', customer.contact, '20190601', '지각');

                let fn = handler.getCustomerDetail;
                fn.email = email;
                let result = await fn.call(fn, {contact: customer.contact});

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);
                let data = result.data;
                expect(data.id).toEqual(customer.id);
                expect(data.name).toEqual(customer.name);
                expect(data.contact).toEqual(customer.contact);
                expect(data.totalNoShow).toEqual(2);
                expect(data.myNoShow).toEqual(1);
                expect(data.isAllDay).toEqual(false);
                expect(data.managerId).toEqual(customer.managerId);
                expect(JSON.parse(data.contents)).toEqual(reservation.contentList);
                expect(data.pointMembership).toEqual(0);
                expect(data.cardSales).toEqual(0);
                expect(data.cashSales).toEqual(0);
                expect(data.pointSales).toEqual(10);

            }catch(e){
                logger.error(e);
                fail();
            }
        });

        it('이름으로만 조회 가능', async function () {
            try{
                await db.saveCustomer(customer);
                await db.saveReservation(reservation);
                await db.addNoShow(email, customer.contact, '20190501', '지각');
                await db.addNoShow('soonsm2@gmail.com', customer.contact, '20190601', '지각');

                let fn = handler.getCustomerDetail;
                fn.email = email;
                let result = await fn.call(fn, {name: customer.name});

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);
                let data = result.data;
                expect(data.id).toEqual(customer.id);
                expect(data.name).toEqual(customer.name);
                expect(data.contact).toEqual(customer.contact);
                expect(data.totalNoShow).toEqual(undefined);
                expect(data.myNoShow).toEqual(undefined);
                expect(data.isAllDay).toEqual(false);
                expect(data.managerId).toEqual(customer.managerId);
                expect(JSON.parse(data.contents)).toEqual(reservation.contentList);
                expect(data.pointMembership).toEqual(0);
                expect(data.cardSales).toEqual(0);
                expect(data.cashSales).toEqual(0);
                expect(data.pointSales).toEqual(10);

            }catch(e){
                logger.error(e);
                fail();
            }
        });

        it('가장 최근의 예약의 contents를 가져온다.', async function () {
            try{
                await db.saveCustomer(customer);
                await db.saveReservation(reservation);
                reservation.id = 'id2';
                reservation.contentList = [{"id": 0, "value":"네일케어3"},{"id": 1, "value":"페디케어3"}];
                await db.saveReservation(reservation);
                await db.addNoShow(email, customer.contact, '20190501', '지각');
                await db.addNoShow('soonsm2@gmail.com', customer.contact, '20190601', '지각');

                let fn = handler.getCustomerDetail;
                fn.email = email;
                let result = await fn.call(fn, {name: customer.name});

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);
                let data = result.data;
                expect(data.id).toEqual(customer.id);
                expect(data.name).toEqual(customer.name);
                expect(data.contact).toEqual(customer.contact);
                expect(data.totalNoShow).toEqual(undefined);
                expect(data.myNoShow).toEqual(undefined);
                expect(data.isAllDay).toEqual(false);
                expect(data.managerId).toEqual(customer.managerId);
                expect(JSON.parse(data.contents)).toEqual(reservation.contentList);
                expect(data.pointMembership).toEqual(0);
                expect(data.cardSales).toEqual(0);
                expect(data.cashSales).toEqual(0);
                expect(data.pointSales).toEqual(10);

            }catch(e){
                logger.error(e);
                fail();
            }
        });
    });

    describe('getCustomerInfo', () => {
        it('target, name, contact 모두 없을 때 에러', async function () {
            try{
                await db.saveCustomer(customer);

                let fn = handler.getCustomerInfo;
                fn.email = email;
                let result = await fn.call(fn, {});

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(false);
            }catch(e){
                logger.error(e);
                fail();
            }
        });
        it('형식에 맞게 오는지 확인', async function () {
            try{
                await db.saveCustomer(customer);

                let fn = handler.getCustomerInfo;
                fn.email = email;
                let result = await fn.call(fn, {target: customer.name, id: 'what'});

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                let data = result.data;
                expect(data.id).toEqual('what');
                expect(data.query).toEqual(customer.name);
                expect(data.result.length).toEqual(1);

                data = data.result[0];
                expect(data.name).toEqual(customer.name);
                expect(data.contact).toEqual(customer.contact);
            }catch(e){
                logger.error(e);
                fail();
            }
        });
        it('초성 검색 확인', async function () {
            try{
                await db.saveCustomer(customer);

                let fn = handler.getCustomerInfo;
                fn.email = email;
                let result = await fn.call(fn, {target: 'ㄱㅅㅁ', id: 'what'});

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                let data = result.data;
                expect(data.id).toEqual('what');
                expect(data.query).toEqual('ㄱㅅㅁ');
                expect(data.result.length).toEqual(1);

                data = data.result[0];
                expect(data.name).toEqual(customer.name);
                expect(data.contact).toEqual(customer.contact);
            }catch(e){
                logger.error(e);
                fail();
            }
        });
        it('연락처 검색 확인', async function () {
            try{
                await db.saveCustomer(customer);

                let fn = handler.getCustomerInfo;
                fn.email = email;
                let result = await fn.call(fn, {contact: '0102890', id: 'what'});

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                let data = result.data;
                expect(data.id).toEqual('what');
                expect(data.query).toEqual('0102890');
                expect(data.result.length).toEqual(1);

                data = data.result[0];
                expect(data.name).toEqual(customer.name);
                expect(data.contact).toEqual(customer.contact);
            }catch(e){
                logger.error(e);
                fail();
            }
        });
    });

    describe('getCustomerList', function () {
       it('형식에 맞게 오는지 확인', async function () {
           try{
               await db.saveCustomer(customer);
               await db.addNoShow(email, customer.contact, '20190501', '지각');
               await db.addNoShow('soonsm2@gmail.com', customer.contact, '20190601', '지각');
               await db.saveReservation(reservation);
               await db.saveSales(sales);

               let fn = handler.getCustomerList;
               fn.email = email;
               let result = await fn.call(fn, {type: 'all'});

               if(!result.status){
                   logger.error(result.message);
               }
               expect(result.status).toEqual(true);

               let list = result.data;
               expect(list.length).toEqual(1);

               let data = list[0];
               expect(data.id).toEqual(customer.id);
               expect(data.name).toEqual(customer.name);
               expect(data.contact).toEqual(customer.contact);
               expect(data.reservCount).toEqual(1);
               expect(data.totalNoShow).toEqual(2);
               expect(data.myNoShow).toEqual(1);
               expect(data.etc).toEqual(customer.etc);
               expect(data.managerId).toEqual(customer.managerId);
               expect(data.pointMembership).toEqual(0);
               expect(data.cardSales).toEqual(sales.price);
               expect(data.cashSales).toEqual(0);
               expect(data.pointSales).toEqual(10);

               list = data.history;
               expect(list.length).toEqual(1);

               data = list[0];
               expect(data.start).toEqual(reservation.start);
               expect(data.end).toEqual(reservation.end);
               expect(data.managerId).toEqual(reservation.manager);
               expect(data.managerName).toEqual('매니저');
               expect(data.managerColor).toEqual('RED');
               expect(JSON.parse(data.contents)).toEqual(reservation.contentList);
               expect(data.status).toEqual(reservation.status);
               expect(data.price).toEqual(sales.price);

           }catch(e){
               logger.error(e);
               fail();
           }
       });

        it('예약 없을 때 history 빈 array 확인', async function () {
            try{
                await db.saveCustomer(customer);

                let fn = handler.getCustomerList;
                fn.email = email;
                let result = await fn.call(fn, {type: 'all'});

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                let list = result.data;
                expect(list.length).toEqual(1);

                let data = list[0];
                expect(data.id).toEqual(customer.id);
                expect(data.name).toEqual(customer.name);
                expect(data.contact).toEqual(customer.contact);
                expect(data.reservCount).toEqual(0);
                expect(data.totalNoShow).toEqual(0);
                expect(data.myNoShow).toEqual(0);
                expect(data.etc).toEqual(customer.etc);
                expect(data.managerId).toEqual(customer.managerId);
                expect(data.pointMembership).toEqual(0);
                expect(data.cardSales).toEqual(0);
                expect(data.cashSales).toEqual(0);
                expect(data.pointSales).toEqual(customer.pointSales);

                list = data.history;
                expect(list.length).toEqual(0);
            }catch(e){
                logger.error(e);
                fail();
            }
        });

        it('매출 2개일 때 제대로 누적되는지', async function () {
            try{
                await db.saveCustomer(customer);
                await db.addNoShow(email, customer.contact, '20190501', '지각');
                await db.addNoShow('soonsm2@gmail.com', customer.contact, '20190601', '지각');
                await db.saveReservation(reservation);
                await db.saveSales(sales);
                sales.id = moment().format('YYYYMMDDHHmmssSSS');
                await db.saveSales(sales);

                let fn = handler.getCustomerList;
                fn.email = email;
                let result = await fn.call(fn, {type: 'all'});

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                let list = result.data;
                expect(list.length).toEqual(1);

                let data = list[0];
                expect(data.id).toEqual(customer.id);
                expect(data.name).toEqual(customer.name);
                expect(data.contact).toEqual(customer.contact);
                expect(data.reservCount).toEqual(1);
                expect(data.totalNoShow).toEqual(2);
                expect(data.myNoShow).toEqual(1);
                expect(data.etc).toEqual(customer.etc);
                expect(data.managerId).toEqual(customer.managerId);
                expect(data.pointMembership).toEqual(0);
                expect(data.cardSales).toEqual(sales.price * 2);
                expect(data.cashSales).toEqual(0);
                expect(data.pointSales).toEqual(10);

                list = data.history;
                expect(list.length).toEqual(1);

                data = list[0];
                expect(data.start).toEqual(reservation.start);
                expect(data.end).toEqual(reservation.end);
                expect(data.managerId).toEqual(reservation.manager);
                expect(data.managerName).toEqual('매니저');
                expect(data.managerColor).toEqual('RED');
                expect(JSON.parse(data.contents)).toEqual(reservation.contentList);
                expect(data.status).toEqual(reservation.status);
                expect(data.price).toEqual(sales.price * 2);

            }catch(e){
                logger.error(e);
                fail();
            }
        });
        it('예약 2개일 때 제대로 조회 되는지', async function () {
            try{
                await db.saveCustomer(customer);
                await db.addNoShow(email, customer.contact, '20190501', '지각');
                await db.addNoShow('soonsm2@gmail.com', customer.contact, '20190601', '지각');
                await db.saveReservation(reservation);
                reservation = {
                    email: email,
                    start: '201905201230',
                    end: '201905201330',
                    id: 'reservationId2',
                    contact: '01028904311',
                    member: 'customerId',
                    manager: 'managerId',
                    contentList: [{"id": 0, "value":"네일케어3"},{"id": 1, "value":"페디케어3"}],
                    etc: 'etc',
                    status: process.nmns.RESERVATION_STATUS.RESERVED
                };
                await db.saveReservation(reservation);
                await db.saveSales(sales);

                let fn = handler.getCustomerList;
                fn.email = email;
                let result = await fn.call(fn, {type: 'all'});

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                let list = result.data;
                expect(list.length).toEqual(1);

                let data = list[0];
                expect(data.id).toEqual(customer.id);
                expect(data.name).toEqual(customer.name);
                expect(data.contact).toEqual(customer.contact);
                expect(data.reservCount).toEqual(2);
                expect(data.totalNoShow).toEqual(2);
                expect(data.myNoShow).toEqual(1);
                expect(data.etc).toEqual(customer.etc);
                expect(data.managerId).toEqual(customer.managerId);
                expect(data.pointMembership).toEqual(0);
                expect(data.cardSales).toEqual(sales.price);
                expect(data.cashSales).toEqual(0);
                expect(data.pointSales).toEqual(10);

                list = data.history;
                expect(list.length).toEqual(2);

                data = list[0];
                expect(data.start).toEqual(reservation.start);
                expect(data.end).toEqual(reservation.end);
                expect(data.managerId).toEqual(reservation.manager);
                expect(data.managerName).toEqual('매니저');
                expect(data.managerColor).toEqual('RED');
                expect(JSON.parse(data.contents)).toEqual(reservation.contentList);
                expect(data.status).toEqual(reservation.status);
                expect(data.price).toEqual(0);

            }catch(e){
                logger.error(e);
                fail();
            }
        });

        it('검색 되는지 확인', async function () {
            try{
                await db.saveCustomer(customer);
                await db.addNoShow(email, customer.contact, '20190501', '지각');
                await db.addNoShow('soonsm2@gmail.com', customer.contact, '20190601', '지각');
                await db.saveReservation(reservation);
                await db.saveSales(sales);

                let fn = handler.getCustomerList;
                fn.email = email;
                let result = await fn.call(fn, {type: 'name', target: '김승민'});

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                let list = result.data;
                expect(list.length).toEqual(1);

                let data = list[0];
                expect(data.id).toEqual(customer.id);
                expect(data.name).toEqual(customer.name);
                expect(data.contact).toEqual(customer.contact);
                expect(data.reservCount).toEqual(1);
                expect(data.totalNoShow).toEqual(2);
                expect(data.myNoShow).toEqual(1);
                expect(data.etc).toEqual(customer.etc);
                expect(data.managerId).toEqual(customer.managerId);
                expect(data.pointMembership).toEqual(0);
                expect(data.cardSales).toEqual(sales.price);
                expect(data.cashSales).toEqual(0);
                expect(data.pointSales).toEqual(10);

                list = data.history;
                expect(list.length).toEqual(1);

                data = list[0];
                expect(data.start).toEqual(reservation.start);
                expect(data.end).toEqual(reservation.end);
                expect(data.managerId).toEqual(reservation.manager);
                expect(data.managerName).toEqual('매니저');
                expect(data.managerColor).toEqual('RED');
                expect(JSON.parse(data.contents)).toEqual(reservation.contentList);
                expect(data.status).toEqual(reservation.status);
                expect(data.price).toEqual(sales.price);

                result = await fn.call(fn, {type: 'contact', target: '01028904311'});

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                list = result.data;
                expect(list.length).toEqual(1);

                data = list[0];
                expect(data.id).toEqual(customer.id);
                expect(data.name).toEqual(customer.name);
                expect(data.contact).toEqual(customer.contact);
                expect(data.reservCount).toEqual(1);
                expect(data.totalNoShow).toEqual(2);
                expect(data.myNoShow).toEqual(1);
                expect(data.etc).toEqual(customer.etc);
                expect(data.managerId).toEqual(customer.managerId);
                expect(data.pointMembership).toEqual(0);
                expect(data.cardSales).toEqual(sales.price);
                expect(data.cashSales).toEqual(0);
                expect(data.pointSales).toEqual(10);

                list = data.history;
                expect(list.length).toEqual(1);

                data = list[0];
                expect(data.start).toEqual(reservation.start);
                expect(data.end).toEqual(reservation.end);
                expect(data.managerId).toEqual(reservation.manager);
                expect(data.managerName).toEqual('매니저');
                expect(data.managerColor).toEqual('RED');
                expect(JSON.parse(data.contents)).toEqual(reservation.contentList);
                expect(data.status).toEqual(reservation.status);
                expect(data.price).toEqual(sales.price);

                result = await fn.call(fn, {type: 'manager', target: '매니저'});

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                list = result.data;
                expect(list.length).toEqual(1);

                data = list[0];
                expect(data.id).toEqual(customer.id);
                expect(data.name).toEqual(customer.name);
                expect(data.contact).toEqual(customer.contact);
                expect(data.reservCount).toEqual(1);
                expect(data.totalNoShow).toEqual(2);
                expect(data.myNoShow).toEqual(1);
                expect(data.etc).toEqual(customer.etc);
                expect(data.managerId).toEqual(customer.managerId);
                expect(data.pointMembership).toEqual(0);
                expect(data.cardSales).toEqual(sales.price);
                expect(data.cashSales).toEqual(0);
                expect(data.pointSales).toEqual(10);

                list = data.history;
                expect(list.length).toEqual(1);

                data = list[0];
                expect(data.start).toEqual(reservation.start);
                expect(data.end).toEqual(reservation.end);
                expect(data.managerId).toEqual(reservation.manager);
                expect(data.managerName).toEqual('매니저');
                expect(data.managerColor).toEqual('RED');
                expect(JSON.parse(data.contents)).toEqual(reservation.contentList);
                expect(data.status).toEqual(reservation.status);
                expect(data.price).toEqual(sales.price);

                result = await fn.call(fn, {type: 'manager', target: '와와'});

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                list = result.data;
                expect(list.length).toEqual(0);

            }catch(e){
                logger.error(e);
                fail();
            }
        });

        it('이름 오름차순 정렬 되는지 확인', async function () {
            try{
                await db.saveCustomer(customer);
                customer = {
                    email: 'soonsm@gmail.com',
                    id: 'customerId2',
                    name: '김아자',
                    contact: '01028904312',
                    managerId: 'managerId',
                    etc: 'etcetc',
                    pointMembership: 0,
                    cardSales: 0,
                    cashSales: 0,
                    pointSales: 10
                };
                await db.saveCustomer(customer);
                customer = {
                    email: 'soonsm@gmail.com',
                    id: 'customerId3',
                    name: '김차자',
                    contact: '01028904313',
                    managerId: 'managerId',
                    etc: 'etcetc',
                    pointMembership: 0,
                    cardSales: 0,
                    cashSales: 0,
                    pointSales: 10
                };
                await db.saveCustomer(customer);

                await db.addNoShow(email, customer.contact, '20190501', '지각');
                await db.addNoShow('soonsm2@gmail.com', customer.contact, '20190601', '지각');
                await db.saveReservation(reservation);
                await db.saveSales(sales);

                let fn = handler.getCustomerList;
                fn.email = email;
                let result = await fn.call(fn, {type: 'all'});

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                let list = result.data;
                expect(list.length).toEqual(3);

                expect(list[0].name).toEqual('김승민');
                expect(list[1].name).toEqual('김아자');
                expect(list[2].name).toEqual('김차자');

            }catch(e){
                logger.error(e);
                fail();
            }
        });

        it('마지막 방문일 내림차순 정렬 되는지 확인', async function () {
            try{
                await db.saveCustomer(customer);
                reservation.start = '201905191230';
                await db.saveReservation(reservation);

                customer = {
                    email: 'soonsm@gmail.com',
                    id: 'customerId2',
                    name: '김아자',
                    contact: '01028904312',
                    managerId: 'managerId',
                    etc: 'etcetc',
                    pointMembership: 0,
                    cardSales: 0,
                    cashSales: 0,
                    pointSales: 10
                };
                await db.saveCustomer(customer);
                reservation.member = 'customerId2';
                reservation.start = '201906181230';
                await db.saveReservation(reservation);

                customer = {
                    email: 'soonsm@gmail.com',
                    id: 'customerId3',
                    name: '김차자',
                    contact: '01028904313',
                    managerId: 'managerId',
                    etc: 'etcetc',
                    pointMembership: 0,
                    cardSales: 0,
                    cashSales: 0,
                    pointSales: 10
                };
                await db.saveCustomer(customer);
                reservation.member = 'customerId3';
                reservation.start = '201907171230';
                await db.saveReservation(reservation);

                await db.saveSales(sales);

                let fn = handler.getCustomerList;
                fn.email = email;
                let result = await fn.call(fn, {type: 'all', sort: 'sort-date'});

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                let list = result.data;
                expect(list.length).toEqual(3);

                expect(list[0].name).toEqual('김차자');
                expect(list[1].name).toEqual('김아자');
                expect(list[2].name).toEqual('김승민');

            }catch(e){
                logger.error(e);
                fail();
            }
        });

        it('매니저 이름 오름차순 정렬 되는지 확인', async function () {
            try{

                await db.saveCustomer(customer);
                customer = {
                    email: 'soonsm@gmail.com',
                    id: 'customerId2',
                    name: '김아자',
                    contact: '01028904312',
                    managerId: 'managerId3',
                    etc: 'etcetc',
                    pointMembership: 0,
                    cardSales: 0,
                    cashSales: 0,
                    pointSales: 10
                };
                await db.saveCustomer(customer);
                customer = {
                    email: 'soonsm@gmail.com',
                    id: 'customerId3',
                    name: '김차자',
                    contact: '01028904313',
                    managerId: 'managerId2',
                    etc: 'etcetc',
                    pointMembership: 0,
                    cardSales: 0,
                    cashSales: 0,
                    pointSales: 10
                };
                await db.saveCustomer(customer);

                await db.addNoShow(email, customer.contact, '20190501', '지각');
                await db.addNoShow('soonsm2@gmail.com', customer.contact, '20190601', '지각');

                let fn = handler.getCustomerList;
                fn.email = email;
                let result = await fn.call(fn, {type: 'all', sort: 'sort-manager'});

                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                let list = result.data;
                expect(list.length).toEqual(3);

                expect(list[0].name).toEqual('김아자');
                expect(list[1].name).toEqual('김차자');
                expect(list[2].name).toEqual('김승민');

            }catch(e){
                logger.error(e);
                fail();
            }
        });
    });

    describe('addCustomer', ()=>{
        it('추가 후 반환 값 확인', async function(){
            await db.addNoShow(email, customer.contact, '20190501', '지각');

            let fn = handler.addCustomer;
            fn.email = email;
            let result = await fn.call(fn, customer);

            if(!result.status){
                logger.error(result.message);
            }
            expect(result.status).toEqual(true);

            let data = result.data;
            expect(data.id).toEqual(customer.id);
            expect(data.totalNoShow).toEqual(1);

            data = await db.getCustomer(email, customer.id);
            customer.pointSales = 0;
            expect(customer).toEqual(data);
        });
    });

    describe('deleteCustomer', ()=>{
        it('삭제 후 확인', async function(){
            let fn = handler.addCustomer;
            fn.email = email;
            let result = await fn.call(fn, customer);

            if(!result.status){
                logger.error(result.message);
            }
            expect(result.status).toEqual(true);

            data = await db.getCustomer(email, customer.id);
            customer.pointSales = 0;
            expect(customer).toEqual(data);

            fn = handler.deleteCustomer;
            fn.email = email;
            result = await fn.call(fn, customer);

            if(!result.status){
                logger.error(result.message);
            }
            expect(result.status).toEqual(true);
            data = await db.getCustomer(email, customer.id);
            expect(data).toBeFalsy();

        });
    });

    describe('updateCustomer', ()=>{
        it('추가 후 수정 확인', async function(){
            let fn = handler.addCustomer;
            fn.email = email;
            let result = await fn.call(fn, customer);

            if(!result.status){
                logger.error(result.message);
            }
            expect(result.status).toEqual(true);

            fn = handler.updateCustomer;
            fn.email = email;

            customer.name = '와우';
            result = await fn.call(fn, customer);

            if(!result.status){
                logger.error(result.message);
            }
            expect(result.status).toEqual(true);

            let data = result.data;
            expect(data.id).toEqual(customer.id);

            data = await db.getCustomer(email, customer.id);
            customer.pointSales = 0;
            expect(customer).toEqual(data);
        });

        it('수정 할 때 이미 이름과 연락처가 겹치는 경우', async function(){
            let fn = handler.addCustomer;
            fn.email = email;
            let result = await fn.call(fn, customer);
            if(!result.status){
                logger.error(result.message);
            }
            expect(result.status).toEqual(true);

            customer.id = 'aws';
            customer.name = '이종현';
            result = await fn.call(fn, customer);
            if(!result.status){
                logger.error(result.message);
            }
            expect(result.status).toEqual(true);

            fn = handler.updateCustomer;
            fn.email = email;

            customer.name = '김승민';
            result = await fn.call(fn, customer);

            if(!result.status){
                logger.error(result.message);
            }
            expect(result.status).toEqual(false);

            let data = result.data;
            expect(data.id).toEqual(customer.id);
            expect(data.reason).toEqual('DUPLICATED');

        });
    });

    describe('mergeCustomer', function () {
       it('merge 후 확인', async function(){
           customer = {
               email: 'soonsm@gmail.com',
               id: 'customerId',
               name: '김승민',
               contact: '01028904311',
               managerId: 'managerId',
               etc: 'etcetc',
               pointMembership: 0,
               cardSales: 0,
               cashSales: 0,
               pointSales: 10
           };
           await db.saveCustomer(customer);
           await db.saveReservation(reservation);
           await db.saveSales(sales);

           customer.id = 'customerId2';
           customer.name = '김승민2';
           await db.saveCustomer(customer);

           try{
               let fn = handler.mergeCustomer;
               fn.email = email;
               let result = await fn.call(fn, {
                   id: 'customerId',
                   name: '김승민2',
                   contact: '01028904311',
                   etc: 'etcetc',
                   managerId: 'managermanager'
               });
               if(!result.status){
                   logger.error(result.message);
               }
               expect(result.status).toEqual(true);

               let data = await db.getCustomer(email, 'customerId');
               expect(data).toBeFalsy();

               data = await db.getReservation(email, reservation.id);
               expect(data.member).toEqual('customerId2');
               expect(data.name).toEqual('김승민2');

               data = await db.getSales(email, sales.id);
               expect(data.customerId).toEqual('customerId2');
           }catch(e){
               logger.error(e);
               fail();
           }
       });
        it('merge 대상 없으면 에러', async function(){
            customer = {
                email: 'soonsm@gmail.com',
                id: 'customerId',
                name: '김승민',
                contact: '01028904311',
                managerId: 'managerId',
                etc: 'etcetc',
                pointMembership: 0,
                cardSales: 0,
                cashSales: 0,
                pointSales: 10
            };
            await db.saveCustomer(customer);
            await db.saveReservation(reservation);
            await db.saveSales(sales);

            customer.id = 'customerId2';
            customer.name = '김승민2';
            await db.saveCustomer(customer);

            try{
                let fn = handler.mergeCustomer;
                fn.email = email;
                let result = await fn.call(fn, {
                    id: 'customerId',
                    name: '김승민3',
                    contact: '01028904311',
                    etc: 'etcetc',
                    managerId: 'managermanager'
                });
                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(false);

            }catch(e){
                logger.error(e);
                fail();
            }
        });
    });
});