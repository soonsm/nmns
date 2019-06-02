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
const handler = require('./../bin/noticeHandler');
const moment = require('moment');

const logger = global.nmns.LOGGER;

let email = 'soonsm@gmail.com';

describe('Notice', function () {
    let user;
    let getNewPush = function(){
        return {
            email: email,
            id: moment().format('YYYYMMDDHHmmssSSS'),
            registeredDate: moment().format('YYYYMMDDHHmm'),
            title: '예약취소알림',
            contents: '예약이 취소되었습니다다다다',
            data: {
                type: 'cancel reserv',
                id: 'reservation.id',
                manager: 'reservation.manager'
            },
            isRead: false
        }
    };
    let getNewNotice = function(id){
        if(!id){
            id = moment().format('YYYYMMDDHHmmssSSS');
        }
        return {
            email: email,
            id: id,
            registeredDate: moment().format('YYYYMMDDHHmm'),
            title: '공지사항' + moment().format('mmss'),
            contents: moment().format('mmss') + '공지사항 내용입니다'
        }
    }
    beforeEach(async () => {
        user = await webDb.getWebUser(email);
        await db.deleteAllPush(email);
        await db.deleteAllPush('notice');

        await webDb.updateWebUser(email, {lastRedNoticeId: 0});
    });
    describe('getPush', () => {
        it('아무 것도 없을 때 빈 list', async function(){
            try{
                let fn = handler.getPush;
                fn.email = email;
                let result = await fn.call(fn);
                expect(result.status).toEqual(true);

                let data = result.data;
                expect(data.type).toEqual('push');
                expect(data.data.length).toEqual(0);
            }catch(e){
                logger.error(e);
                fail();
            }
        });

        it('한번 읽은거는 다시 안오는지 확인', async function(){
            try{
                let push = getNewPush();
                push.contents = '1';
                await db.savePush(push);

                let fn = handler.getPush;
                fn.email = email;
                let result = await fn.call(fn);
                expect(result.status).toEqual(true);

                let data = result.data;
                expect(data.type).toEqual('push');
                expect(data.data.length).toEqual(1);
                expect(data.data[0].body).toEqual('1');

                push = getNewPush();
                push.contents = '2';
                await db.savePush(push);

                fn = handler.getPush;
                fn.email = email;
                result = await fn.call(fn);
                expect(result.status).toEqual(true);

                data = result.data;
                expect(data.type).toEqual('push');
                expect(data.data.length).toEqual(1);

                data = data.data[0];
                expect(data.body).toEqual('2');
                expect(data.title).toEqual(push.title);
                expect(data.data).toEqual(push.data);


            }catch(e){
                logger.error(e);
                fail();
            }
        });
    });

    describe('getNotice', ()=>{
        it('combined false, 1 page 항목 체크', async function () {
            try{
                for(let i=0; i< 5; i++){
                    let push = getNewPush();
                    await db.savePush(push);
                }
                for(let i=0; i< 5; i++){
                    let notice = getNewNotice(i+ '');
                    await db.addNotice(notice);
                }

                await webDb.updateWebUser(email, {lastRedNoticeId: 3});

                let fn = handler.getNotice;
                fn.email = email;
                let result = await fn.call(fn);
                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                let data = result.data;
                let noticeList = data.announcement;
                expect(noticeList.length).toEqual(5);
                for(let i=0; i<noticeList.length;i++){
                    if(i<noticeList.length-1){
                        expect(noticeList[i].id > noticeList[i+1].id).toEqual(true);
                    }
                    let notice = noticeList[i];

                    expect(moment(notice.registeredDate, 'YYYYMMDDHHmm').isValid()).toEqual(true);
                    expect(notice.title).toContain('공지사항');
                    expect(notice.contents).toContain('공지사항 내용입니다');
                    expect(notice.email).toEqual('notice');
                    if(notice.id > '3'){
                        expect(notice.isRead).toEqual(false);
                    }else{
                        expect(notice.isRead).toEqual(true);
                    }
                }

                let pushList = data.schedule;
                expect(pushList.length).toEqual(5);
                for(let i=0; i<pushList.length;i++){
                    if(i<pushList.length-1){
                        expect(pushList[i].id > pushList[i+1].id).toEqual(true);
                    }
                    let push = pushList[i];
                    expect(push.email).toEqual(email);
                    expect(moment(push.id, 'YYYYMMDDHHmmssSSS').isValid()).toEqual(true);
                    expect(moment(push.registeredDate, 'YYYYMMDDHHmm').isValid()).toEqual(true);
                    expect(push.title).toContain('예약취소알림');
                    expect(push.contents).toContain('예약이 취소되었습니다다다다');
                    expect(push.data).toBeTruthy();
                    expect(push.isRead).toEqual(false);
                }

                result = await fn.call(fn);
                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);
                data = result.data;
                pushList = data.schedule;
                expect(pushList.length).toEqual(5);
                for(let i=0; i<pushList.length;i++){
                    if(i<pushList.length-1){
                        expect(pushList[i].id > pushList[i+1].id).toEqual(true);
                    }
                    let push = pushList[i];
                    expect(push.email).toEqual(email);
                    expect(moment(push.id, 'YYYYMMDDHHmmssSSS').isValid()).toEqual(true);
                    expect(moment(push.registeredDate, 'YYYYMMDDHHmm').isValid()).toEqual(true);
                    expect(push.title).toContain('예약취소알림');
                    expect(push.contents).toContain('예약이 취소되었습니다다다다');
                    expect(push.data).toBeTruthy();
                    expect(push.isRead).toEqual(true);
                }
            }catch(e){
                logger.error(e);
                fail();
            }
        });

        it('combined false, 2page check', async function () {
            try{
                for(let i=0; i< 9; i++){
                    let push = getNewPush();
                    await db.savePush(push);
                }
                for(let i=0; i< 9; i++){
                    let notice = getNewNotice(i+ '');
                    await db.addNotice(notice);
                }

                await webDb.updateWebUser(email, {lastRedNoticeId: 3});

                let fn = handler.getNotice;
                fn.email = email;
                let result = await fn.call(fn, {page: 2});
                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                let data = result.data;
                let noticeList = data.announcement;
                expect(noticeList.length).toEqual(4);
                for(let i=0; i<noticeList.length;i++){
                    if(i<noticeList.length-1){
                        expect(noticeList[i].id > noticeList[i+1].id).toEqual(true);
                    }
                    let notice = noticeList[i];

                    expect(moment(notice.registeredDate, 'YYYYMMDDHHmm').isValid()).toEqual(true);
                    expect(notice.title).toContain('공지사항');
                    expect(notice.contents).toContain('공지사항 내용입니다');
                    expect(notice.email).toEqual('notice');
                    if(notice.id > '3'){
                        expect(notice.isRead).toEqual(false);
                    }else{
                        expect(notice.isRead).toEqual(true);
                    }
                }

                let pushList = data.schedule;
                expect(pushList.length).toEqual(4);
                for(let i=0; i<pushList.length;i++){
                    if(i<pushList.length-1){
                        expect(pushList[i].id > pushList[i+1].id).toEqual(true);
                    }
                    let push = pushList[i];
                    expect(push.email).toEqual(email);
                    expect(moment(push.id, 'YYYYMMDDHHmmssSSS').isValid()).toEqual(true);
                    expect(moment(push.registeredDate, 'YYYYMMDDHHmm').isValid()).toEqual(true);
                    expect(push.title).toContain('예약취소알림');
                    expect(push.contents).toContain('예약이 취소되었습니다다다다');
                    expect(push.data).toBeTruthy();
                    expect(push.isRead).toEqual(false);
                }

                result = await fn.call(fn, {page: 2});
                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);
                data = result.data;
                pushList = data.schedule;
                expect(pushList.length).toEqual(4);
                for(let i=0; i<pushList.length;i++){
                    if(i<pushList.length-1){
                        expect(pushList[i].id > pushList[i+1].id).toEqual(true);
                    }
                    let push = pushList[i];
                    expect(push.email).toEqual(email);
                    expect(moment(push.id, 'YYYYMMDDHHmmssSSS').isValid()).toEqual(true);
                    expect(moment(push.registeredDate, 'YYYYMMDDHHmm').isValid()).toEqual(true);
                    expect(push.title).toContain('예약취소알림');
                    expect(push.contents).toContain('예약이 취소되었습니다다다다');
                    expect(push.data).toBeTruthy();
                    expect(push.isRead).toEqual(true);
                }

                result = await fn.call(fn, {page: 3});
                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);
                data = result.data;
                pushList = data.schedule;
                expect(pushList.length).toEqual(0);
                expect(data.announcement.length).toEqual(0);
            }catch(e){
                logger.error(e);
                fail();
            }
        });

        it('combined true, 1page check', async function () {
            try{
                //push 2, notice 3, push 2: total 7
                let push = getNewPush();
                await db.savePush(push);
                push = getNewPush();
                await db.savePush(push);

                let notice = getNewNotice();
                await db.addNotice(notice);
                notice = getNewNotice();
                await db.addNotice(notice);
                notice = getNewNotice();
                await db.addNotice(notice);

                push = getNewPush();
                await db.savePush(push);
                push = getNewPush();
                await db.savePush(push);

                let fn = handler.getNotice;
                fn.email = email;
                let result = await fn.call(fn, {combined: true});
                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                let data = result.data;
                let noticeList = data.announcement;
                expect(noticeList.length).toEqual(5);
                for(let i=0; i<noticeList.length;i++){
                    if(i<noticeList.length-1){
                        expect(noticeList[i].id > noticeList[i+1].id).toEqual(true);
                    }
                    let notice = noticeList[i];

                    expect(moment(notice.registeredDate, 'YYYYMMDDHHmm').isValid()).toEqual(true);
                    if(i < 2){
                        expect(notice.title).toContain('예약취소알림');
                        expect(notice.contents).toContain('예약이 취소되었습니다다다다');
                        expect(notice.email).toEqual(email);
                    }else{
                        expect(notice.email).toEqual('notice');
                        expect(notice.title).toContain('공지사항');
                        expect(notice.contents).toContain('공지사항 내용입니다');
                    }

                }

                let pushList = data.schedule;
                expect(pushList.length).toEqual(0);


                result = await fn.call(fn, {combined: true, page: 2});
                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                data = result.data;
                noticeList = data.announcement;
                expect(noticeList.length).toEqual(2);
                for(let i=0; i<noticeList.length;i++){
                    if(i<noticeList.length-1){
                        expect(noticeList[i].id > noticeList[i+1].id).toEqual(true);
                    }
                    let notice = noticeList[i];
                    expect(moment(notice.registeredDate, 'YYYYMMDDHHmm').isValid()).toEqual(true);
                    expect(notice.title).toContain('예약취소알림');
                    expect(notice.contents).toContain('예약이 취소되었습니다다다다');
                    expect(notice.email).toEqual(email);
                }

                result = await fn.call(fn, {combined: true, page: 3});
                if(!result.status){
                    logger.error(result.message);
                }
                expect(result.status).toEqual(true);

                data = result.data;
                noticeList = data.announcement;
                expect(noticeList.length).toEqual(0);

            }catch(e){
                logger.error(e);
                fail();
            }
        });
    });
});