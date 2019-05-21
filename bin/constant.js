'use strict';

(function(){
    let o = {}

    let makeValidationFn = function(map){
        return function(type){
            for(let key in map){
                if(map[key] === type){
                    return true;
                }
            }
            return false;
        }
    }

    //예약상태
    o.RESERVATION_STATUS = {
        NOSHOW: 'NOSHOW', //NO-SHOW
        RESERVED: 'RESERVED', //정상 예약(매출 정보 입력 전)
        CANCELED: 'CANCELED', //취소 처리
        DELETED: 'DELETED', //삭제처리
        CUSTOMERCANCELED: 'CUSTOMERCANCELED', //고객 취소(고객이 알림톡으로 취소)
        DONE: 'DONE' //시술완료(매출정보 입력 완료)
    };

    o.isValidReservationStatus = makeValidationFn(o.RESERVATION_STATUS);

    //결제수단
    o.PAYMENT_METHOD = {
        CASH: 'CASH',
        CARD: 'CARD',
        MEMBERSHIP: 'MEMBERSHIP'
    };

    o.isValidPaymentMethod = makeValidationFn(o.PAYMENT_METHOD);

    //매출내역 종류
    o.SALE_HIST_TYPE = {
        MEMBERSHIP_ADD: 'MEMBERSHIP_ADD', //멤버십 적립
        MEMBERSHIP_USE: 'MEMBERSHIP', //멤버십 사용
        MEMBERSHIP_INCREMENT: 'MEMBERSHIP_INCREMENT', //멤버십 수정 증가
        MEMBERSHIP_DECREMENT: 'MEMBERSHIP_DECREMENT', //멤버십 수정 감소
        SALES_CARD: 'CARD', //카드매출
        SALES_CASH: 'CASH' //현금 매출
    };

    o.isValidSaleHistType = makeValidationFn(o.SALE_HIST_TYPE);

    o.SNS_TYPE = {
        NAVER: 'NAVER',
        KAKAO: 'KAKAO'
    };

    o.isValidSnsType = makeValidationFn(o.SNS_TYPE);


    //계정 인증 상태
    o.AUTH_STATUS = {
        BEFORE_EMAIL_VERIFICATION: 'BEFORE_EMAIL_VERIFICATION',
        EMAIL_VERIFICATED: 'EMAIL_VERIFICATED'
    }

    o.TABLE = {
        WebSecheduler: 'WebSecheduler',
        NoShowList: 'NoShowList',
        SnsLink: 'SnsLink',
        NoShow: 'NoShow',
        NoShowId: 'NoShowId',
        VisitLog: 'VisitLog',
        Customer: 'Customer',
        AlrimTalkHist: 'AlrimTalkHist',
        Push: 'Push',
        Reservation: 'Reservation',
        Task: 'Task',
        Sales: 'Sales',
        Point: 'Point'
    }

    o.MODE = {
        PRODUCTION: 'production',
        DEVELOPMENT: 'development'
    }

    //현재 온라인 상태인 user
    o.ONLINE = {};

    process.nmns = o;


})();