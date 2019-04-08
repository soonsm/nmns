'use strict';

const logger = global.nmns.LOGGER;

const db = require('./webDb');

/**
 * 메뉴 Data Model
 * "id":${메뉴 id, string},
 * "name":${메뉴 이름, string},
 * "priceCash":${정가(현금가), number},
 * "priceCard":${정가(카드가), number},
 * "priceMembership":${회원가, number}
 */


/**
 * 매장의 전체 메뉴 리스트 조회
 * get menu list
 * @returns {Promise<void>}
 */
exports.getMenuList = async function(){

    let user = await db.getWebUser(this.email);
    let menuList = user.menuList || [];

    return {
        status: true,
        data: menuList,
        message: null
    };
}


/**
 * 메뉴 저장 및 삭제
 * 메뉴가 없으면 신규 추가, 있으면 수정
 * @param user
 * @param data
 * @returns {Promise<*>}
 */
let setMenu = function(menuList, data){

    if(!data.id){
        throw '메뉴 아이디가 없습니다.';
    }

    if(data.action === 'delete'){
        let index = menuList.findIndex(menu => menu.id === data.id);
        if(index === -1){
            throw `${data.id}로 조회되는 메뉴가 없습니다.`;
        }
        menuList.splice(index, 1);
        user.menuList = menuList;

        return data;
    }

    if(!data.name){
        throw '메뉴 이름이 없습니다.';
    }else if(data.priceCard && (isNaN(data.priceCard) || data.priceCard < 0)){
        throw `카드 가격이 올바르지 않습니다.(${data.priceCard})`;
    }else if(data.priceCash && (isNaN(data.priceCash) || data.priceCash < 0)){
        throw `현금 가격이 올바르지 않습니다.(${data.priceCash})`;
    }else if(data.priceMembership && (isNaN(data.priceMembership) || data.priceMembership < 0)){
        throw `멤버십 가격이 올바르지 않습니다.(${data.priceMembership})`;
    }

    let menu = menuList.find(menu => menu.id === data.id);
    if(menu){
        for(let key in menu){
            menu[key] = data[key];
        }
    }else{
        menuList.push(data);
    }

    return menuList;
}


/**
 * 메뉴 저장(신규 혹은 업데이트)
 * 요청 위치 : "add menu"/"update menu",
 * 데이터 : {"id":${메뉴 id, string},
 *          "name":${메뉴 이름, string},
 *          "priceCash":${정가(현금가), number},
 *          "priceCard":${정가(카드가), number},
 *          "priceMembership":${회원가, number}}
 * 응답 형식 : "data":{"id":${요청시 전달한 id, string}}
 * @param data
 * @returns {Promise<void>}
 */
exports.saveMenu = async function(data){
    let status = false, message = null, resultData = null;
    let user = await db.getWebUser(this.email);

    try{
        user.menuList = setMenu(user.menuList || [], data);

        await db.setWebUser(user);

    }catch(e){
        status = false;
        message = e;
    }

    return {
        status: status,
        message: message,
        data: data.id
    };
}

/**
 * 메뉴 리스트 업데이트
 * 요청 위치 : "update menu list",
 * 데이터 : [
 *          {"id":${메뉴 id, string},
 *          "name":${메뉴 이름, string},
 *          "priceCash":${정가(현금가), number},
 *          "priceCard":${정가(카드가), number},
 *          "priceMembership":${회원가, number},
 *          "action":${삭제 동작, string, "delete" 값으로 올 경우 삭제}
 *          }
 *        ]
 * 응답 형식 : "data":[
 *                  {"id":${메뉴 id, string},
 *                  "name":${메뉴 이름, string},
 *                  "priceCash":${정가(현금가), number},
 *                  "priceCard":${정가(카드가), number},
 *                  "priceMembership":${회원가, number}
 *                  }
 *                 ]
 * 응답 데이터는 수정에 실패했을 경우에만 전체 원래 리스트를 준다.(성공하면 주지 않음)
 * 요청 데이터의 순서에 따라서 다시 정렬하여 저장 필요
 * @param data
 * @returns {Promise<void>}
 */
exports.updateMenuList = async function(data){
    let status = false, message = null, resultData = undefined;

    try{
        let user = await db.getWebUser(this.email);
        let newMenulist = [];
        for(let i=0;i<data.length;i++){
            if(data.action !== 'delete'){
                newMenulist = setMenu(newMenulist, data[i]);
            }
        }
        user.menuList = newMenulist;

        await db.setWebUser(user);
        status = true;
    }catch(e){
        status = false;
        message = e;
        resultData = data;
    }

    return {
        status: status,
        message: message,
        data: resultData
    }
}