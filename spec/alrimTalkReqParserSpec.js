describe("alrimTalkReqParser.parseAlrimTalkReq", function() {
    let util = require('../bin/util');
    let parser = require('../bin/alrimTalkReqParser');

    let reqs = [
        '내일 오전 11시 01028904311',
        '0321 오전 11시 01028904311',
        '3/21 오전 11시 01028904311',
        '3월21일 오전 11시 01028904311',
        '2018년3월21일 오전 11시 01028904311',
        '3.21 오전 11시 01028904311',

        '내일 오전 11시 01028904311',
        '내일 11시 01028904311',
        '내일 23시 01028904311',
        '내일 낮 11시 01028904311',
        '내일 오후 8시 01028904311',
        '내일 밤 8시 01028904311',

        '내일 오전 11시 30분 01028904311',
        '내일 오전 11시반 01028904311',
        '내일 오전 11시15분 01028904311',
        '내일 0730 01028904311'
    ];

    it("알림톡 요청 메시지 파싱", function() {
        let parsedData = parser.parseAlrimTalkReq(reqs[0], new Date('2018-03-20'));
        expect(parsedData).toEqual({
            reservationDate: '20180321',
            reservationTime: '1100',
            phone: '01028904311'
        });
    });
});