'use strict';

const db = require('./webDb');

exports.getManagerList = async function () {
    let managerList = await db.getStaffList(this.email);

    return {
        status: true,
        data: managerList,
        message: ''
    };
};

exports.addManager = async function(staff){
    let status = true,
        message = null;
    let name = staff.name;
    let id = staff.id;

    if (!name || !id) {
        status = false;
        message = '담당자 추가에 필요한 데이터가 없습니다. ({"id": ${매니저 키}, "name":${매니저 이름, string}, "color":${저장할 색깔, string, #RRGGBB, optional}})';
    }

    if (status) {
        if (!await db.addNewStaff(this.email, db.newStaff(staff))) {
            status = false;
            message = '시스템 오류입니다.(DB Update Error';
        }
    }

    return {
        status: status,
        data: {id :id},
        message: message
    };
};

exports.updateManager = async function(newStaff){
    let status = true,
        message = null;
    let name = newStaff.name;
    let color = newStaff.color;
    let id = newStaff.id;

    if (!name || !color || !id) {
        status = false;
        message = '담당자 수정에 필요한 데이터가 없습니다. ({"id": ${매니저 키}, "name":${변경후 매니저 이름, string}, "color":${변경할 색깔, string, #RRGGBB}})';
    }

    if (status) {
        let staffList = await db.getStaffList(this.email);
        let index = -1;
        for (let i = 0; i < staffList.length; i++) {
            let staff = staffList[i];
            if (staff.id === newStaff.id) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            status = false;
            message = '해당 담당자는 존재하지 않습니다.';
        }
        else {
            staffList[index] = newStaff;
            if (!await db.updateStaffList(this.email, staffList)) {
                status = false;
                message = '시스템 오류입니다.(DB Update Error)';
            }
        }
    }

    return {
        status: status,
        data: {id: id},
        message: message
    };
};

exports.delManager = async function(newStaff){
    let status = true,
        message = null;
    let id = newStaff.id;

    if (!id) {
        status = false;
        message = '담당자 삭제에 필요한 데이터가 없습니다. ({"id": ${매니저 키}})';
    }

    if (status) {
        let staffList = await db.getStaffList(this.email);
        if(staffList.length === 1){
            status = false;
            message = '담당자 1명은 필수입니다.';
        }else{
            let index = -1;
            for (let i = 0; i < staffList.length; i++) {
                let staff = staffList[i];
                if (staff.id === newStaff.id) {
                    index = i;
                    break;
                }
            }
            if (index === -1) {
                status = false;
                message = '해당 담당자는 존재하지 않습니다.';
            }
            else {
                staffList.splice(index, 1);
                if (!await db.updateStaffList(this.email, staffList)) {
                    status = false;
                    message = '시스템 오류입니다.(DB Update Error)';
                }
            }
        }
    }

    return {
        status: status,
        data: {id: id},
        message: message
    };
};