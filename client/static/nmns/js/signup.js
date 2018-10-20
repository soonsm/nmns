(function($) {
    var stepperElement;
    (function() {
        //componentHandler.upgradeAllRegistered();
        var selector = '#signupStepper';
        // Select stepper container element      
        stepperElement = document.querySelector(selector);
        var Stepper;
        var steps;

        if (!stepperElement) return;

        // Get the MaterialStepper instance of element to control it.          
        // Stepper = stepperElement.MaterialStepper;

        // if (!Stepper) {
        //   console.error('MaterialStepper instance is not available for selector: ' + selector + '.');
        //   //return;
        // }
        steps = stepperElement.querySelectorAll('.mdl-step');
        for (var i = 0; i < steps.length; i++) {
            // When user clicks on [data-stepper-next] button of step.          
            /*if(steps[i].classList.contains("signupFormStep")){
              steps[i].addEventListener('onstepnext', function(e, step) {
                console.log("aaaa", e);
                setTimeout(function(){
                  stepperElement.MaterialStepper.next();
                }, 3000);
              });
            }else if(steps[i].classList.contains("signupContractStep")){
              steps[i].addEventListener('onstepnext', function(e) {
                
                stepperElement.MaterialStepper.next();
              });
            }else{
              steps[i].addEventListener('onstepnext', function(e) {
                // {element}.MaterialStepper.next() change the state of current step to "completed" 
                // and move one step forward.
                stepperElement.MaterialStepper.next();
              });
            }*/
            if (i > 0) {
                steps[i].addEventListener('onstepback', function(e) {
                    stepperElement.MaterialStepper.back();
                });
            }
        }
        // When all steps are completed this event is dispatched.          
        // stepperElement.addEventListener('onsteppercomplete', function(e) {
        //   var toast = document.querySelector('#snackbar-stepper-complete');
        //   if (!toast) return;
        //   toast.MaterialSnackbar.showSnackbar({
        //     message: 'Stepper linear are completed',
        //     timeout: 4000,
        //     actionText: 'Ok'
        //   });
        // });
    })();

    function resizeWindow() {
        var stepperElement = document.querySelector('.mdl-stepper');
        var cssClassHorizontal = 'mdl-stepper--horizontal';
        if (!stepperElement) return;
        var width = $(window).width();
        if (width <= 840 && stepperElement.classList.contains(cssClassHorizontal)) {
            stepperElement.classList.remove(cssClassHorizontal);
        } else if (width > 840 && !stepperElement.classList.contains(cssClassHorizontal)) {
            stepperElement.classList.add(cssClassHorizontal);
        }
    };
    $("#contractText").on("scroll", function() {
        if ($("#agreeContractBtn").hasClass("disabled")) {
            var maxScrollPosition = $(this)[0].scrollHeight - $(this)[0].clientHeight - 500;
            if ($(this).scrollTop() > maxScrollPosition) {
                $("#agreeContractBtn").removeClass("disabled");
            }
        }
    });
    // $("#signupBtn").on("touch click", function(e){
    //   document.querySelector('ul.mdl-stepper').MaterialStepper.next();
    // });

    // $("button[data-stepper-back]").off("touch click").on("touch click", function(){
    //   document.querySelector('ul.mdl-stepper').MaterialStepper.back(); 
    // });
    window.addEventListener('resize', resizeWindow);
    document.addEventListener("DOMContentLoaded", function() {
        resizeWindow();
        flatpickr("#signupBizBeginTime", {
            dateFormat: "H:i",
            time_24hr: true,
            defaultHour: 9,
            defaultMinute: 0,
            minuteIncrement: 10,
            noCalendar: true,
            enableTime: true,
            //appendTo: document.getElementById("infoModal"),
            applyBtn: true
        }).setDate(moment("0900", "HHmm").toDate());
        flatpickr("#signupBizEndTime", {
            dateFormat: "H:i",
            time_24hr: true,
            defaultHour: 23,
            defaultMinute: 0,
            minuteIncrement: 10,
            noCalendar: true,
            enableTime: true,
            //appendTo: document.getElementById("infoModal"),
            applyBtn: true
        }).setDate(moment("2300", "HHmm").toDate());

    });

    $("#agreeContractBtn").on("touch click", function(e) {
        if ($(this).hasClass("disabled")) {
            stepperElement.MaterialStepper.error("이용약관을 끝까지 확인 후 동의해주세요.");
            alert("이용약관을 끝까지 확인 후 동의해주세요.");
            return false;
        }
        stepperElement.MaterialStepper.next();
    });

    $("#signupBtn").on("touch click", function(e) {
        if (!validateEmail($("#signupEmail").val())) {
            alert("입력된 이메일이 올바르지 않습니다. 다시 한 번 확인해주세요!");
            $("#signupEmail").focus();
            return;
        }
        if (!/\W+/.test($("#signupPassword").val()) || !/[0-9]+/.test($("#signupPassword").val())) {
            alert("비밀번호는 하나 이상의 숫자와 특수문자를 포함해야합니다.");
            $("#signupPassword").focus();
            return;
        }
        if ($("#signupPassword").val() !== $("#signupRePassword").val()) {
            alert("비밀번호 확인 값이 일치하지 않습니다.");
            $("#signupRePassword").focus();
            return;
        }
        if ($("#signupUseYn").prop("checked")) {
            if ($("#signupNotice").val().length > 700) {
                alert("알림 안내문구의 길이가 너무 깁니다. 조금만 줄여주세요 :)");
                $("#signupNotice").focus();
                return;
            }
            if ($("#signupCallbackPhone").val() === "") {
                alert("알림톡을 사용하시려면 반드시 휴대폰번호를 입력해주세요!");
                $("#signupCallbackPhone").focus();
                return;
            } else if (!(/^01([016789]?)([0-9]{3,4})([0-9]{4})$/.test($("#signupCallbackPhone").val()))) {
                alert("입력하신 휴대폰번호가 정확하지 않습니다.\n휴대폰번호를 정확히 입력해주세요!");
                $("#signupCallbackPhone").focus();
                return;
            }
            if ($("#signupShopName").val() === "") {
                alert("알림톡을 사용하시려면 고객에게 보여줄 매장 이름을 입력해주세요!");
                $("#signupShopName").focus();
                return;
            }
        }
        var beginTime = moment($("#signupBizBeginTime").val(), "HH:mm");
        var endTime = moment($("#signupBizEndTime").val(), "HH:mm");
        if (!beginTime.isValid()) {
            alert("매장 운영 시작시간이 올바르지 않습니다.");
            $("#signupBizBeginTime").focus();
            return;
        }
        if (!endTime.isValid()) {
            alert("매장 운영 종료시간이 올바르지 않습니다.");
            $("#signupBizEndTime").focus();
            return;
        }
        stepperElement.MaterialStepper.showTransitionEffect();
        fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: $("#signupEmail").val(),
                    password: $("#signupPassword").val(),
                    shopName: $("#signupShopName").val(),
                    bizBeginTime: beginTime.format("HHmm"),
                    bizEndTime: endTime.format("HHmm"),
                    useYn: $("#signupUseYn").prop("checked") ? "Y" : "N",
                    callbackPhone: $("#signupCallbackPhone").val(),
                    notice: $("#signupNotice").val(),
                    cancelDue: $("#signupCancelDue").val(),
                    kakaotalk: $(this).data("kakaotalk") || undefined
                })
            })
            .then(function(res) { return res.json(); })
            .then(function(json) {
                console.log(json);
                stepperElement.MaterialStepper.hideTransitionEffect();
                if (json.status === 200) {
                    stepperElement.MaterialStepper.next();
                } else {
                    stepperElement.MaterialStepper.error(json.message);
                    alert(json.message);
                }
            })
            .catch(function(ex) {
                var message = ex.json().message;
                stepperElement.MaterialStepper.error(message);
                stepperElement.MaterialStepper.hideTransitionEffect();
            });
    });

    $("label[for=signupUseYn]").on("touch click", function() {
        $(".alrimRequirement").toggle();
    });

    $("#signupNotice").off("keyup keydown paste cut change").on("keyup keydown paste cut change", function(e) {
        $("#noticeByteCount").text($(this).val().length);
        $(this).height(0).height(this.scrollHeight > 150 ? 150 : (this.scrollHeight < 60 ? 60 : this.scrollHeight));
    });

    $("#copyEmail").on("touch click", function(e) {
        e.preventDefault();
        var range = document.createRange();
        range.selectNodeContents($(this)[0]);
        var sel = window.getSelection ? window.getSelection() : document.selection;
        sel.removeAllRanges();
        sel.addRange(range);
        var title = "";
        if (document.execCommand('copy')) {
            title = "메일주소가 복사되었습니다.";
        } else {
            title = "메일주소를 복사하지 못했습니다. 직접 선택하여 복사해주세요.";
        }
        $(this).attr("title", title).tooltip({
            trigger: "manual",
            delay: { "hide": 1000 }
        });
        $(this).tooltip("show");
        setTimeout(function() {
            $("#copyEmail").attr("title", "메일주소 복사").tooltip("dispose");
        }, 1500);
        if (sel.empty) { // Chrome, IE
            sel.empty();
        } else if (sel.removeAllRanges) { // Firefox
            sel.removeAllRanges();
        }
        return false;
    });
})(jQuery);