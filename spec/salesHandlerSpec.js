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
const handler = require('./../bin/salesHistHandler');
const moment = require('moment');

const logger = global.nmns.LOGGER;

let email = 'soonsm@gmail.com';

describe('Sales', function () {
    let sales, customer, reservation;
    beforeEach(async () => {
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
            member: 'customerId',
            manager: 'managerId',
            contentList: [{id: 0, value: 'Nail Cleaning'}],
            etc: 'etc',
            status: process.nmns.RESERVATION_STATUS.RESERVED
        };

        await db.deleteAllSales(email);
        await db.deleteAllReservation(email);
        await db.deleteAllCustomer(email);

        let user = await webDb.getWebUser(email);
        user.menuList = [
            {
                "name": "네일케어",
                "priceCard": 11000,
                "id": "1",
                "priceMembership": 10000,
                "priceCash": 10500
            },
            {
                "name": "페디케어",
                "priceCard": 21000,
                "id": "2",
                "priceMembership": 20000,
                "priceCash": 20500
            }
        ];
        await webDb.updateWebUser(email, {menuList: user.menuList});
    });
    describe('saveSales', () => {
        it('type이 SALES_CARD, MEMBERSHIP_USER, SALES_CASH 아니면 exception', async function(){
            await db.saveCustomer(customer);
            await db.saveReservation(reservation);
            sales.type = process.nmns.SALE_HIST_TYPE.MEMBERSHIP_ADD;
            try{
                let data = [sales];
                let fn = handler.saveSales;
                fn.email = email;
                let result = await fn.apply(fn, [data]);
                expect(result.status).toEqual(false);
                expect(result.message).toContain('예약에서 매출내역을 추가하는 경우는 카드 매출, 현금 매출, 멤버십 사용만 가능합니다.');
            }catch(e){
                logger.error(e);
            }
        });

        it('1개 저장 성공 후 결과 데이터 비교', async function(){
            await db.saveCustomer(customer);
            await db.saveReservation(reservation);

            try{
                let data = [sales];
                let fn = handler.saveSales;
                fn.email = email;
                let result = await fn.apply(fn, [data]);

                expect(result.status).toEqual(true);

                let returnData = result.data;
                let search = await db.getSales(email, sales.id);
                expect(returnData[0]).toEqual(search);
            }catch(e){
                logger.error(e);
            }
        });

        it('2개 저장 성공 후 결과 데이터 비교', async function(){
            await db.saveCustomer(customer);
            await db.saveReservation(reservation);

            try{
                let sales2 = {
                    email: email,
                    id: moment().format('YYYYMMDDHHmmssSSS'),
                    date: moment().format('YYYYMMDD'),
                    time: moment().format('HHmm'),
                    item: '네일클리닝2',
                    price: 31000,
                    customerId: 'customerId',
                    payment: process.nmns.PAYMENT_METHOD.CARD,
                    managerId: 'managerId',
                    type: process.nmns.SALE_HIST_TYPE.SALES_CARD,
                    scheduleId: 'reservationId',
                    membershipChange: 10,
                    balanceMembership: 0
                };
                let data = [sales, sales2];
                let fn = handler.saveSales;
                fn.email = email;
                let result = await fn.apply(fn, [data]);

                expect(result.status).toEqual(true);

                let returnData = result.data;
                expect(returnData.length).toEqual(2);
                let search = await db.getSales(email, sales.id);
                let search2 = await db.getSales(email, sales2.id);
                expect(returnData[0]).toEqual(search);
                expect(returnData[1]).toEqual(search2);
            }catch(e){
                logger.error(e);
            }
        });
    });

    describe('addMembershipHistory', function(){
        it('type이 MEMBERSHIP_ADD, MEMBERSHIP_INCREMENT, MEMBERSHIP_DECREMENT 아니면 exception', async function(){
            await db.saveCustomer(customer);
            await db.saveReservation(reservation);
            sales.type = process.nmns.SALE_HIST_TYPE.MEMBERSHIP_USE;
            try{
                let fn = handler.addMembershipHistory;
                fn.email = email;
                let result = await fn.apply(fn, [sales]);
                expect(result.status).toEqual(false);
                expect(result.message).toContain('멤버십 증감 내역 추가는 멤버십 사용, 멤버십 증가, 멤버십 감소, 멤버십 적립만 가능합니다.');
            }catch(e){
                logger.error(e);
            }
        });

        it('1개 저장 성공 후 결과 데이터 비교(전송한 id가 그대로 리턴되고, 서버에는 다른 id 들어가는지 확인)', async function(){
            await db.saveCustomer(customer);
            await db.saveReservation(reservation);

            try{
                sales.type = process.nmns.SALE_HIST_TYPE.MEMBERSHIP_ADD;
                sales.id = 'id from client';
                let fn = handler.addMembershipHistory;
                fn.email = email;
                let result = await fn.apply(fn, [sales]);
                expect(result.status).toEqual(true);

                let returnData = result.data;
                expect(returnData.id).toEqual('id from client');

                let search = await db.getSales(email, returnData.serverId);
                expect(moment(search.id, 'YYYYMMDDHHmmssSSS').isValid()).toEqual(true);

                returnData.id = returnData.serverId;
                delete returnData.serverId;

                expect(search).toEqual(returnData);

            }catch(e){
                fail(e);
                logger.error(e);
            }
        });
    });

    describe('getMembershipHistory', function(){
        it('고객 아이디 없으면 exception', async ()=>{
            try{
                let fn = handler.getMembershipHistory;
                fn.email = email;
                let result = await fn.apply(fn, [{}]);

                expect(result.status).toEqual(false);
                expect(result.message).toContain('고객 아이디는 필수입니다.');
            }catch(e){
                logger.error(e);
            }
        });
        it('고객 없으면 exception', async ()=>{
            try{
                let fn = handler.getMembershipHistory;
                fn.email = email;
                let result = await fn.apply(fn, [{customerId: 'aaaa'}]);

                expect(result.status).toEqual(false);
                expect(result.message).toContain('조회되는 고객이 없습니다.');
            }catch(e){
                logger.error(e);
            }
        });
        it('조회 시 각 항목 있는지 확인', async function(){
            await db.saveCustomer(customer);
            await db.saveReservation(reservation);

            sales.id = '20190524103055000';
            sales.date = '20190524';
            sales.time = '1030';
            sales.type = process.nmns.SALE_HIST_TYPE.MEMBERSHIP_INCREMENT;
            sales.payment = process.nmns.PAYMENT_METHOD.CARD;
            await db.saveSales(sales);
            let fn = handler.getMembershipHistory;
            fn.email = email;
            let result = await fn.apply(fn, [{customerId: customer.id}]);

            let data = result.data;
            expect(result.status).toEqual(true);
            expect(data.length).toEqual(1);

            data = data[0];
            expect(data.id).toBeTruthy();
            expect(data.type).toEqual(sales.type);
            expect(data.date).toEqual(sales.date);
            expect(data.time).toEqual(sales.time);
            expect(data.scheduleId).toEqual(sales.scheduleId);
            expect(data.item).toEqual(sales.item);
            expect(data.payment).toEqual(sales.payment);
            expect(data.price).toEqual(sales.price);
            expect(data.membershipChange).toEqual(sales.membershipChange);
            expect(data.managerId).toEqual(sales.managerId);
            expect(data.balanceMembership).toEqual(10);
        });
        it('멤버십 사용, 멤버십 증가, 멤버십 감소, 멤버십 적립만 조회됨', async ()=>{
            await db.saveCustomer(customer);
            await db.saveReservation(reservation);

            sales.id = '20190524103055000';
            sales.date = '20190524';
            sales.time = '1030';
            sales.type = process.nmns.SALE_HIST_TYPE.SALES_CARD;
            sales.payment = process.nmns.PAYMENT_METHOD.CARD;
            await db.saveSales(sales);

            sales.id = '20190525103055000';
            sales.date = '20190525';
            sales.time = '1030';
            sales.type = process.nmns.SALE_HIST_TYPE.SALES_CARD;
            sales.payment = process.nmns.PAYMENT_METHOD.CARD;
            await db.saveSales(sales);

            sales.id = '20190526103055000';
            sales.date = '20190526';
            sales.time = '1030';
            sales.type = process.nmns.SALE_HIST_TYPE.SALES_CASH;
            sales.payment = process.nmns.PAYMENT_METHOD.CASH;
            await db.saveSales(sales);

            sales.id = '20190527103055000';
            sales.date = '20190527';
            sales.time = '1030';
            sales.type = process.nmns.SALE_HIST_TYPE.MEMBERSHIP_USE;
            sales.payment = process.nmns.PAYMENT_METHOD.MEMBERSHIP;
            await db.saveSales(sales);

            sales.id = '20190527103055001';
            sales.date = '20190527';
            sales.time = '1030';
            sales.type = process.nmns.SALE_HIST_TYPE.MEMBERSHIP_ADD;
            sales.payment = process.nmns.PAYMENT_METHOD.CARD;
            await db.saveSales(sales);

            sales.id = '20190527103055002';
            sales.date = '20190527';
            sales.time = '1030';
            sales.type = process.nmns.SALE_HIST_TYPE.MEMBERSHIP_INCREMENT;
            sales.payment = process.nmns.PAYMENT_METHOD.CARD;
            await db.saveSales(sales);

            let fn = handler.getMembershipHistory;
            fn.email = email;
            let result = await fn.apply(fn, [{customerId: customer.id}]);

            let data = result.data;
            expect(result.status).toEqual(true);
            expect(data.length).toEqual(3);

            //내림차순 정렬 확인
            for(let i=1; i< data.length; i++){
                if(data[i].id > data[i-1].id){
                    fail();
                }
            }
        });
    });

    describe('getSalesForReservation', function(){

        it('예약 아이디 없으면 exception', async function(){
           try{
               let fn = handler.getSalesForReservation;
               fn.email = email;
               let result = await fn.apply(fn, [{}]);
               expect(result.status).toEqual(false);
               expect(result.message).toContain('예약아이디는 필수 입니다.');
           }catch(e){
               logger.error(e);
               fail();
           }
        });

        it('예약 없으면 exception', async function(){
            try{
                let fn = handler.getSalesForReservation;
                fn.email = email;
                let result = await fn.apply(fn, [{scheduleId: 'sdfsdf'}]);
                expect(result.status).toEqual(false);
                expect(result.message).toContain('조회되는 예약이 없습니다.');
            }catch(e){
                logger.error(e);
                fail();
            }
        });

        it('예약이 1개 있을 때 결과 항목 비교', async function(){
            try{
                await db.saveCustomer(customer);
                await db.saveReservation(reservation);

                sales.item = '네일케어';
                await db.saveSales(sales);

                let fn = handler.getSalesForReservation;
                fn.email = email;
                let result = await fn.apply(fn, [{scheduleId: reservation.id}]);

                expect(result.status).toEqual(true);

                let data = result.data[0];
                expect(data.id).toBeTruthy();
                expect(data.type).toEqual(sales.type);
                expect(data.date).toEqual(sales.date);
                expect(data.time).toEqual(sales.time);
                expect(data.scheduleId).toEqual(sales.scheduleId);
                expect(data.customerId).toEqual(sales.customerId);
                expect(data.item).toEqual(sales.item);
                expect(data.payment).toEqual(sales.payment);
                expect(data.price).toEqual(sales.price);
                expect(data.priceCash).toEqual(10500);
                expect(data.priceCard).toEqual(11000);
                expect(data.priceMembership).toEqual(10000);
                expect(data.balanceMembership).toEqual(0);

            }catch(e){
                logger.error(e);
                fail();
            }
        });

        it('예약이 2개 있을 때 결과 항목 비교', async function(){
            try{
                await db.saveCustomer(customer);
                await db.saveReservation(reservation);

                sales.item = '네일케어';
                await db.saveSales(sales);


                let sales2 = {
                    email: email,
                    id: moment().format('YYYYMMDDHHmmssSSS'),
                    date: moment().format('YYYYMMDD'),
                    time: moment().format('HHmm'),
                    item: '페디케어',
                    price: 30000,
                    customerId: 'customerId',
                    payment: process.nmns.PAYMENT_METHOD.CARD,
                    managerId: 'managerId',
                    type: process.nmns.SALE_HIST_TYPE.SALES_CARD,
                    scheduleId: 'reservationId',
                    membershipChange: 10,
                    balanceMembership: 0
                };
                await db.saveSales(sales2);

                let fn = handler.getSalesForReservation;
                fn.email = email;
                let result = await fn.apply(fn, [{scheduleId: reservation.id}]);

                expect(result.status).toEqual(true);
                expect(result.data.length).toEqual(2);

                let data = result.data[0];
                expect(data.id).toBeTruthy();
                expect(data.type).toEqual(sales.type);
                expect(data.date).toEqual(sales.date);
                expect(data.time).toEqual(sales.time);
                expect(data.scheduleId).toEqual(sales.scheduleId);
                expect(data.customerId).toEqual(sales.customerId);
                expect(data.item).toEqual(sales.item);
                expect(data.payment).toEqual(sales.payment);
                expect(data.price).toEqual(sales.price);
                expect(data.priceCash).toEqual(10500);
                expect(data.priceCard).toEqual(11000);
                expect(data.priceMembership).toEqual(10000);
                expect(data.balanceMembership).toEqual(0);


                data = result.data[1];
                expect(data.id).toBeTruthy();
                expect(data.type).toEqual(sales2.type);
                expect(data.date).toEqual(sales2.date);
                expect(data.time).toEqual(sales2.time);
                expect(data.scheduleId).toEqual(sales2.scheduleId);
                expect(data.customerId).toEqual(sales2.customerId);
                expect(data.item).toEqual(sales2.item);
                expect(data.payment).toEqual(sales2.payment);
                expect(data.price).toEqual(sales2.price);
                expect(data.priceCash).toEqual(20500);
                expect(data.priceCard).toEqual(21000);
                expect(data.priceMembership).toEqual(20000);
                expect(data.balanceMembership).toEqual(0);

            }catch(e){
                logger.error(e);
                fail();
            }
        });

        it('예약이 없을 때 결과 항목 비교', async function(){
            try{
                await db.saveCustomer(customer);

                reservation.contentList[0] = {id: 3, value: '네일케어'};
                await db.saveReservation(reservation);

                let fn = handler.getSalesForReservation;
                fn.email = email;
                let result = await fn.apply(fn, [{scheduleId: reservation.id}]);

                expect(result.status).toEqual(true);

                let data = result.data[0];
                logger.error(JSON.stringify(data));
                expect(data.customerId).toEqual(reservation.member);
                expect(data.item).toEqual(reservation.contentList[0].value);
                expect(data.priceCash).toEqual(10500);
                expect(data.priceCard).toEqual(11000);
                expect(data.priceMembership).toEqual(10000);
                expect(data.balanceMembership).toEqual(0);

            }catch(e){
                logger.error(e);
                fail();
            }
        });

        it('예약이 없고 예약의 시술명이 메뉴에 없을 때 결과 항목 비교', async function(){
            try{
                await db.saveCustomer(customer);

                reservation.contentList[0] = {id: 3, value: 'aaa'};
                await db.saveReservation(reservation);

                let fn = handler.getSalesForReservation;
                fn.email = email;
                let result = await fn.apply(fn, [{scheduleId: reservation.id}]);

                expect(result.status).toEqual(true);

                let data = result.data[0];
                logger.error(JSON.stringify(data));
                expect(data.customerId).toEqual(reservation.member);
                expect(data.item).toEqual(reservation.contentList[0].value);
                expect(data.priceCash).toEqual(undefined);
                expect(data.priceCard).toEqual(undefined);
                expect(data.priceMembership).toEqual(undefined);
                expect(data.balanceMembership).toEqual(0);
            }catch(e){
                logger.error(e);
                fail();
            }
        });
    });

    describe('getSalesHist', function(){
        it('start, end가 없으면 exception', async function(){
            try{
                await db.saveCustomer(customer);
                await db.saveReservation(reservation);

                let fn = handler.getSalesHist;
                fn.email = email;
                let result = await fn.apply(fn, [{}]);

                expect(result.status).toEqual(false);
                expect(result.message).toContain('올바른 날짜가 아닙니다.');
            }catch(e){
                logger.error(e);
                fail();
            }
        });

        it('조회되는 매출이 없을 때', async function(){
            try{
                await db.saveCustomer(customer);
                await db.saveReservation(reservation);

                let fn = handler.getSalesHist;
                fn.email = email;
                let result = await fn.apply(fn, [{start: '20190101', end: '20190101'}]);

                expect(result.status).toEqual(true);

                let data = result.data;
                expect(data.totalSalesCount).toEqual(0);
                expect(data.totalSalesAmount).toEqual(0);
                expect(data.totalSalesCard).toEqual(0);
                expect(data.totalSalesCash).toEqual(0);
                expect(data.totalSalesMembership).toEqual(0);
                expect(data.sales.length).toEqual(0);
            }catch(e){
                logger.error(e);
                fail();
            }
        });

        it('조회되는 매출이 있을 때', async function(){
            try{
                await db.saveCustomer(customer);
                await db.saveReservation(reservation);

                sales.id = '20190524103055000';
                sales.date = '20190524';
                sales.time = '1030';
                sales.price = 1000;
                sales.type = process.nmns.SALE_HIST_TYPE.SALES_CARD;
                sales.payment = process.nmns.PAYMENT_METHOD.CARD;
                await db.saveSales(sales);

                sales.id = '20190525103055000';
                sales.date = '20190525';
                sales.time = '1030';
                sales.price = 1000;
                sales.type = process.nmns.SALE_HIST_TYPE.SALES_CARD;
                sales.payment = process.nmns.PAYMENT_METHOD.CARD;
                await db.saveSales(sales);

                sales.id = '20190526103055000';
                sales.date = '20190526';
                sales.time = '1030';
                sales.price = 1000;
                sales.type = process.nmns.SALE_HIST_TYPE.SALES_CASH;
                sales.payment = process.nmns.PAYMENT_METHOD.CASH;
                await db.saveSales(sales);

                sales.id = '20190527103055000';
                sales.date = '20190527';
                sales.time = '1030';
                sales.price = 1000;
                sales.type = process.nmns.SALE_HIST_TYPE.MEMBERSHIP_USE;
                sales.payment = process.nmns.PAYMENT_METHOD.MEMBERSHIP;
                await db.saveSales(sales);

                sales.id = '20190527103055001';
                sales.date = '20190527';
                sales.time = '1030';
                sales.price = 1000;
                sales.type = process.nmns.SALE_HIST_TYPE.MEMBERSHIP_ADD;
                sales.payment = process.nmns.PAYMENT_METHOD.CARD;
                await db.saveSales(sales);

                sales.id = '20190527103055002';
                sales.date = '20190527';
                sales.time = '1030';
                sales.price = 1000;
                sales.type = process.nmns.SALE_HIST_TYPE.MEMBERSHIP_INCREMENT;
                sales.payment = process.nmns.PAYMENT_METHOD.CARD;
                await db.saveSales(sales);

                let fn = handler.getSalesHist;
                fn.email = email;
                let result = await fn.apply(fn, [{start: '20190524', end: '20190527'}]);

                expect(result.status).toEqual(true);

                let data = result.data;
                expect(data.totalSalesCount).toEqual(4);
                expect(data.totalSalesAmount).toEqual(4000);
                expect(data.totalSalesCard).toEqual(2000);
                expect(data.totalSalesCash).toEqual(1000);
                expect(data.totalSalesMembership).toEqual(1000);
                expect(data.sales.length).toEqual(4);

                //오름차순 정렬 확인
                for(let i=1; i< data.sales.length; i++){
                    if(data.sales[i].id < data.sales[i-1].id){
                        fail();
                    }
                }
            }catch(e){
                logger.error(e);
                fail();
            }
        });
    });
});