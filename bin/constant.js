'use strict';

(function(){
    let o = {}

    //예약상태
    o.RESERVATION_STATUS = {
        NOSHOW: 'NOSHOW',
        RESERVED: 'RESERVED',
        CANCELED: 'CANCELED',
        DELETED: 'DELETED',
        CUSTOMERCANCELED: 'CUSTOMERCANCELED'
    };

    //계정 인증 상태
    o.AUTH_STATUS = {
        BEFORE_EMAIL_VERIFICATION: 'BEFORE_EMAIL_VERIFICATION',
        EMAIL_VERIFICATED: 'EMAIL_VERIFICATED'
    }

    o.TABLE = {
        WebSecheduler: 'WebSecheduler',
        NoShowList: 'NoShowList',
        NoShow: 'NoShow',
        NoShowId: 'NoShowId',
        VisitLog: 'VisitLog',
        Customer: 'Customer',
        AlrimTalkHist: 'AlrimTalkHist'
    }

    o.MODE = {
        PRODUCTION: 'production',
        DEVELOPMENT: 'development'
    }

    //현재 온라인 상태인 user
    o.ONLINE = {};

    process.nmns = o;


})();