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
const handler = require('./../bin/menuHandler');
const moment = require('moment');

const logger = global.nmns.LOGGER;

let email = 'soonsm@gmail.com';

describe('Menu', function () {
    let menuList;
    beforeEach(async () => {
        menuList = [
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
        await webDb.updateWebUser(email, {menuList: []});
    });

    describe('add menu', function () {
        it('id 없으면 exception', async function () {
            try {
                let fn = handler.saveMenu;
                fn.email = email;
                let result = await fn.apply(fn, [{}]);

                expect(result.status).toEqual(false);
                expect(result.message).toContain('메뉴 아이디가 없습니다.');
            } catch (e) {
                fail();
                logger.error(e);
            }
        });

        it('추가 후 조회하여 항목 확인', async function () {
            try {
                let fn = handler.saveMenu;
                fn.email = email;
                let result = await fn.call(fn, menuList[0]);

                let user = await webDb.getWebUser(email);
                let data = user.menuList[0];

                expect(result.status).toEqual(true);
                expect(menuList[0]).toEqual(data);

                expect(menuList[0].id).toEqual(data.id);
                expect(menuList[0].name).toEqual(data.name);
                expect(menuList[0].priceCash).toEqual(data.priceCash);
                expect(menuList[0].priceCard).toEqual(data.priceCard);
                expect(menuList[0].priceMembership).toEqual(data.priceMembership);

                expect(result.data.id).toEqual(data.id);
            } catch (e) {
                fail();
                logger.error(e);
            }
        });
    });

    describe('update menu', function () {
        it('id 없으면 exception', async function () {
            try {
                let fn = handler.saveMenu;
                fn.email = email;
                let result = await fn.apply(fn, [{}]);

                expect(result.status).toEqual(false);
                expect(result.message).toContain('메뉴 아이디가 없습니다.');
            } catch (e) {
                fail();
                logger.error(e);
            }
        });

        it('수정 후 조회하여 항목 확인', async function () {
            try {
                let fn = handler.saveMenu;
                fn.email = email;
                let result = await fn.call(fn, menuList[0]);

                let user = await webDb.getWebUser(email);
                let data = user.menuList[0];

                expect(result.status).toEqual(true);
                expect(menuList[0]).toEqual(data);

                expect(menuList[0].id).toEqual(data.id);
                expect(menuList[0].name).toEqual(data.name);
                expect(menuList[0].priceCash).toEqual(data.priceCash);
                expect(menuList[0].priceCard).toEqual(data.priceCard);
                expect(menuList[0].priceMembership).toEqual(data.priceMembership);

                expect(result.data.id).toEqual(data.id);

                menuList[0].name = '네일케어2';
                result = await fn.call(fn, menuList[0]);

                user = await webDb.getWebUser(email);
                data = user.menuList[0];

                expect(user.menuList.length).toEqual(1);

                expect(result.status).toEqual(true);
                expect(menuList[0]).toEqual(data);

                expect(menuList[0].id).toEqual(data.id);
                expect('네일케어2').toEqual(data.name);
                expect(menuList[0].priceCash).toEqual(data.priceCash);
                expect(menuList[0].priceCard).toEqual(data.priceCard);
                expect(menuList[0].priceMembership).toEqual(data.priceMembership);

                expect(result.data.id).toEqual(data.id);
            } catch (e) {
                fail();
                logger.error(e);
            }
        });
    });

    describe('update menu list', function () {
        it('id 없으면 exception', async function () {
            try {
                let fn = handler.updateMenuList;
                fn.email = email;
                let result = await fn.apply(fn, [[{}]]);

                expect(result.status).toEqual(false);
                expect(result.message).toContain('메뉴 아이디가 없습니다.');
            } catch (e) {
                fail();
                logger.error(e);
            }
        });

        it('수정 후 조회하여 항목 확인', async function () {
            try {
                let fn = handler.saveMenu;
                fn.email = email;
                let result = await fn.call(fn, menuList[0]);
                expect(result.status).toEqual(true);
                let user = await webDb.getWebUser(email);
                expect(user.menuList[0]).toEqual(menuList[0]);

                result = await fn.call(fn, menuList[1]);
                expect(result.status).toEqual(true);

                user = await webDb.getWebUser(email);

                expect(user.menuList).toEqual(menuList);


                menuList = [
                    {
                        "name": "네일케어",
                        "priceCard": 11000,
                        "id": "1",
                        "priceMembership": 20000,
                        "priceCash": 10200
                    },
                    {
                        "name": "페디케어",
                        "priceCard": 21000,
                        "id": "2",
                        "priceMembership": 20000,
                        "priceCash": 20500,
                        'action': 'delete'
                    },
                    {
                        "name": "눈썹정리",
                        "priceCard": 21000,
                        "id": "3",
                        "priceMembership": 20000,
                        "priceCash": 20500
                    }
                ];

                fn = handler.updateMenuList;
                fn.email = email;
                result = await fn.call(fn, menuList);
                if (result.status === false) {
                    logger.error(result.message);
                }

                expect(result.status).toEqual(true);
                user = await webDb.getWebUser(email);

                menuList.splice(1, 1);
                expect(user.menuList).toEqual(menuList);

            } catch (e) {
                fail();
                logger.error(e);
            }
        });
    });

    describe('get menu list', function () {
        it('없으면 빈 리스트 반환', async function () {
            try {
                let fn = handler.getMenuList;
                fn.email = email;
                let result = await fn.call(fn);

                expect(result.status).toEqual(true);
                expect(result.data.length).toEqual(0);
            } catch (e) {
                fail();
                logger.error(e);
            }
        });
        it('리스트 반환', async function () {
            try {
                menuList = [
                    {
                        "name": "네일케어",
                        "priceCard": 11000,
                        "id": "1",
                        "priceMembership": 20000,
                        "priceCash": 10200
                    },
                    {
                        "name": "페디케어",
                        "priceCard": 21000,
                        "id": "2",
                        "priceMembership": 20000,
                        "priceCash": 20500
                    },
                    {
                        "name": "눈썹정리",
                        "priceCard": 21000,
                        "id": "3",
                        "priceMembership": 20000,
                        "priceCash": 20500
                    }
                ];

                let fn = handler.updateMenuList;
                fn.email = email;
                let result = await fn.call(fn, menuList);

                fn = handler.getMenuList;
                fn.email = email;
                result = await fn.call(fn);

                expect(result.status).toEqual(true);
                expect(result.data.length).toEqual(3);
                expect(result.data).toEqual(menuList);
            } catch (e) {
                logger.error(e);
                fail();
            }
        });
    });
});