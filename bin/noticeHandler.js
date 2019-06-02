'use strict';

const db = require('./webDb');
const newDb = require('./newDb');
const util = require('./util');

const logger = global.nmns.LOGGER;

let fnTemplate = function(mainFn, preFn, postFn, exceptionFn){
    let returnFn =  async function(input){
        let email = this.email;
        let status=false,resultData, message;
        try{


            if(preFn){
                input = await preFn(email, input);
            }

            resultData = await mainFn(email, input);

            if(postFn){
                resultData = await postFn(email, resultData, input);
            }
            status = true;
        }catch(e){
            message = e;
            status = false;
            if(exceptionFn){
                resultData = await exceptionFn(user, input);
            }
        }

        return{
            status: status,
            data: resultData,
            message: message
        };
    }

    return returnFn;
}
/**
 * 알림 조회
 * 요청 위치 : "get noti", 데이터 : 없음
 * 응답 형식 : {"type":"push", "data":[{"id":${푸시 id, string}, "title":${푸시 제목, string}, "body":${푸시 내용, string, optional}, "data" : ${푸시에 필요한 데이터, object, optional}}]}
 */
exports.getPush = fnTemplate(async function(email){
    let list = await newDb.getPushList(email, 1, 10000);
    list = list.filter(push => push.isRead !== true);

    let resultData = {
        type: 'push',
        data: []
    };

    for(let push of list){
        resultData.data.push({
            id: push.id,
            title: push.title,
            body: push.contents,
            data: push.data
        });
        push.isRead = true;
        newDb.savePush(push);
    }

    return resultData;
});

/**
 * 공지사항 조회
 * 요청 위치 : "get announcement",
 * 데이터 : {"page":${공지사항 조회용 페이지, number, optional, default: 1}, "combined":${공지사항/예약알림 합쳐줄지 여부, boolean, optional, default:false}}
 * 응답 형식 : "data": {"announcement":[{"id":${공지사항 id, string}, "title":${공지사항 제목, string}, "contents":${공지사항 내용(HTML), string}, "registeredDate":${등록일자, string, YYYYMMDDHHmm}, "isRead":${읽은 적이 있는지 여부, boolean}}], "schedule":[{"id":${알림 id, string}, "title":${알림 제목, string}, "contents":${알림 내용(HTML), string}, "registeredDate":${등록일자, string, YYYYMMDDHHmm}, "isRead":${읽은 적이 있는지 여부, boolean}, "type":${내용 타입, string, SCHEDULE_ADDED - 예약 추가, SCHEDULE_CANCELED - 예약 취소}}]
 * 응답은 모두 등록일자 내림차순으로 줘야함
 * 한 페이지당 최대 5개 (5개보다 적은 숫자로 오면 페이지 끝으로 인식) - combined : true로 합쳐지게 요청오면 응답에 announcement로 합쳐서 줘야함. ** - 등록일자에 시간 추가됨. 내용 타입 추가됨. 도메인 참조. 한 페이지당 5개로 제한해서 줘야함.**
 */
exports.getNotice = fnTemplate(async function(email, input = {page: 1, combined: false}){
    let page = input.page || 1;
    let combined = input.combined || false;

    if(isNaN(page)){
        throw `page값이 올바르지 않습니다.(${page})`;
    }


    let noticeList = [];
    let pushList = [];

    if(combined){
        let pageSize = page * 5;
        noticeList = await newDb.getNotice(1, pageSize);

        noticeList = noticeList.concat(await newDb.getPushList(email, 1, pageSize));
        noticeList.sort(function(a,b){
            return parseInt(b.id) - parseInt(a.id);
        });
        let beginIndex = (page - 1) * 5 ;
        let endIndex= noticeList.length < beginIndex + 5 ? noticeList.length : beginIndex + 5;
        if(noticeList.length > beginIndex){
            noticeList = noticeList.slice(beginIndex, endIndex);
        }else{
            noticeList = [];
        }
    }else{
        noticeList = await newDb.getNotice(page);
        pushList = await newDb.getPushList(email, page);
    }

    let user = await db.getWebUser(email);
    let lastRedNoticeId = user.lastRedNoticeId || 0;
    for(let notice of noticeList){
        if(notice.email === 'notice'){
            if(notice.id > lastRedNoticeId){
                notice.isRead = false;
            }else{
                notice.isRead = true;
            }
        }
    }
    let notice = noticeList.find(notice => notice.email === 'notice');
    if(notice){
        await db.updateWebUser(email, {lastRedNoticeId: notice.id});
    }

    for(let push of pushList){
        let update = {};
        for(let x in push){
            update[x] = push[x];
        }
        update.isRead = true;
        await newDb.savePush(update);
    }

    return {
        announcement: noticeList,
        schedule: pushList
    }
});
