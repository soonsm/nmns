'use strict';

(function(){
    let o = {}

    //예약상태
    o.RESERVATION_STATUS = {
        NOSHOW: 'NOSHOW',
        RESERVED: 'RESERVED',
        CANCELED: 'CANCELSED',
        DELETED: 'DELETED'
    };

    //계정 인증 상태
    o.AUTH_STATUS = {
        BEFORE_EMAIL_VERIFICATION: 'BEFORE_EMAIL_VERIFICATION',
        EMAIL_VERIFICATED: 'EMAIL_VERIFICATED'
    }

    o.TABLE = {
        WebSecheduler: 'WebSecheduler',
        NoShowList: 'NoShowList'
    }

    o.MODE = {
        PRODUCTION: 'production',
        DEVELOPMENT: 'development'
    }

    process.nmns = o;


})();