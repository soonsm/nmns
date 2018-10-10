/*global jQuery, location*/
(function($) {
  var scrollDelay = (/*@cc_on!@*/false || !!document.documentMode? 0:1000);
  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top - 60)
        }, scrollDelay, "easeInOutExpo");
        return false;
      }
    }
  });
  // Scroll to top button appear
  $(document).scroll(function() {
    var scrollDistance = $(this).scrollTop();
    if (scrollDistance > 100) {
      $('.scroll-to-top').fadeIn();
    } else {
      $('.scroll-to-top').fadeOut();
    }
  });

  // Closes responsive menu when a scroll trigger link is clicked
  $('.js-scroll-trigger').click(function() {
    if($(".navbar-collapse").hasClass("show")){
      $('.navbar-collapse').collapse('hide');
    }
  });

  // Activate scrollspy to add active class to navbar items on scroll
  $('body').scrollspy({
    target: '#mainNav',
    offset: 80
  });

  function switchSigninForm(callback){
    if($(".loginPage form:visible input[name='email']").val() !== ""){
      $(".loginPage form:hidden input[name='email']").val($(".loginPage form:visible input[name='email']").val());
    }
    $('.loginPage form:visible, .loginPage .signinForm').animate({height: "toggle", opacity: "toggle"}, "slow", null, callback);
  }

  function switchSignupForm(callback){
    if($(".loginPage form:visible input[name='email']").val() !== ""){
      $(".loginPage form:hidden input[name='email']").val($(".loginPage form:visible input[name='email']").val());
    }
    $('.loginPage form:visible, .loginPage .signupForm').animate({height: "toggle", opacity: "toggle"}, "slow", null, callback);
  }
  
  function switchResetForm(callback){
    if($(".loginPage form:visible input[name='email']").val() !== ""){
      $(".loginPage form:hidden input[name='email']").val($(".loginPage form:visible input[name='email']").val());
    }
    $('.loginPage form').not(".signupForm").animate({height: "toggle", opacity: "toggle"}, "slow", null, callback);
  }

  $(document).ready(function(){
    $.validator.addMethod("passwordCheck", function(value, element){
      return /\W+/.test(value) && /[0-9]+/.test(value);//특수문자와 숫자가 하나 이상 포함
    }, "비밀번호는 하나 이상의 숫자와 특수문자를 포함해야합니다.");
    $(".signinForm").validate({
      rules:{
        email:{
          required:true,
          email:true
        },
        password:{
          required:true
        }
      },
      messages:{
        email:{
          required:"이메일을 입력해주세요.",
          email:"올바른 이메일을 입력해주세요."
        },
        password:"비밀번호를 입력해주세요."
      },
      errorElement:"p",
      errorClass:"message text-danger my-1",
      onfocusout:false,
      focusCleanup:true
    });
    $(".resetForm").validate({
      rules:{
        email:{
          required:true,
          email:true
        }
      },
      messages:{
        email:{
          required:"이메일을 입력해주세요.",
          email:"올바른 이메일을 입력해주세요."
        }
      },
      errorElement:"p",
      errorClass:"message text-danger my-1",
      onfocusout:false,
      focusCleanup:true
    });
    $(".loginPage.my-auto .signupForm").validate({
      rules:{
        email:{
          required:true,
          email:true
        },
        password:{
          required:true,
          minlength:8,
          maxlength:30,
          passwordCheck:true
        },
        passwordRepeat:{
          equalTo:"#signupPassword"
        }
      },
      messages:{
        email:{
          required:"이메일을 입력해주세요.",
          email:"올바른 이메일을 입력해주세요."
        },
        password:{
          required:"비밀번호를 입력해주세요.",
          minlength:"비밀번호는 최소 8자리 이상입니다.",
          maxlength:"비밀번호는 최대 30자리 이내입니다."
        },
        passwordRepeat:"비밀번호가 일치하지 않습니다."
      },
      errorElement:"p",
      errorClass:"message text-danger my-1",
      onfocusout:false,
      focusCleanup:true
    });
    $(".loginPage.d-md-none .signupForm").validate({
      rules:{
        email:{
          required:true,
          email:true
        },
        password:{
          required:true,
          minlength:8,
          maxlength:30,
          passwordCheck:true
        },
        passwordRepeat:{
          equalTo:"#signupPassword2"
        }
      },
      messages:{
        email:{
          required:"이메일을 입력해주세요.",
          email:"올바른 이메일을 입력해주세요."
        },
        password:{
          required:"비밀번호를 입력해주세요.",
          minlength:"비밀번호는 최소 8자리 이상입니다.",
          maxlength:"비밀번호는 최대 30자리 이내입니다."
        },
        passwordRepeat:"비밀번호가 일치하지 않습니다."
      },
      errorElement:"p",
      errorClass:"message text-danger my-1",
      onfocusout:false,
      focusCleanup:true
    });
  });

  $("#signupLink").off("click touch").on("click touch", function(e){
    e.preventDefault();
    if($(".navbar-collapse").hasClass("show")){
      $('.navbar-collapse').collapse('hide');
    }
    if(!$(".loginPage form:visible").hasClass("signupForm")){
      switchSignupForm(function(){
        var first = true;
        return function(){
          if(first){
            first = false;
            return;
          }
          $('html').animate({
            scrollTop: document.documentElement.scrollTop + $(".loginPage:visible")[0].getBoundingClientRect().top - $("#mainNav").height()
          }, scrollDelay, "easeInOutExpo");
          $(".loginPage:visible .signupForm input[name='email']").focus();
      }}());
    }else{
      $('html').animate({
        scrollTop: document.documentElement.scrollTop + $(".loginPage:visible")[0].getBoundingClientRect().top - $("#mainNav").height()
      }, scrollDelay, "easeInOutExpo");
      $(".loginPage:visible .signupForm input[name='email']").focus();
    }
  });

  $("#signinLink").off("click touch").on("click touch", function(e){
    e.preventDefault();
    if($(".navbar-collapse").hasClass("show")){
      $('.navbar-collapse').collapse('hide');
    }
    if(!$(".loginPage form:visible").hasClass("signinForm")){
      switchSigninForm(function(){
        var first = true;
        return function(){
          if(first){
            first = false;
            return;
          }
          if(!$(".loginPage form:visible .signinBtn").length){
            $(".message a.returnSignin").trigger("click");
          }
          $('html').animate({
            scrollTop: document.documentElement.scrollTop + $(".loginPage:visible")[0].getBoundingClientRect().top - $("#mainNav").height()
          }, scrollDelay, "easeInOutExpo");
          $(".loginPage:visible .signinForm input[name='email']").focus();
      }}());
    }else{
      if(!$(".loginPage:visible .signinBtn").is(":visible")){
        $(".message a.returnSignin").trigger("click");
      }
      $('html').animate({
        scrollTop: document.documentElement.scrollTop + $(".loginPage:visible")[0].getBoundingClientRect().top - $("#mainNav").height()
      }, scrollDelay, "easeInOutExpo");
      $(".loginPage:visible .signinForm input[name='email']").focus();
    }
  });
  
  $(".signinBtn").off("click touch").on("click touch", function(e){
    e.preventDefault();
    if($(this).parents(".signinForm").valid()){
      $(this).parents(".signinForm").submit();
    }
  });
  
  $(".contract").off("touch click").on("touch click", function(e){
    e.preventDefault();
    $("#contractModal").addClass("opened");
    //contractDom.data("scroll", new PerfectScrollbar(contractDom[0]));
  });
  $("label[for='agreeContract'],label[for='agreeContract2']").off("touch click").on("touch click", function(e){
    if(e.target.tagName.toLowerCase()!=='a'){
      if(!$("#contractModal").hasClass("opened")){
        alert("이용약관을 확인 후 동의해주세요.");
        return false;
      }else if(!$("#contractModal").hasClass("agreed")){
        alert("이용약관에 대한 동의는 필수입니다.");
        return false;
      }
    }
  });
  $("#agreeContractBtn").off("touch click").on("touch click", function(){
    if($(this).hasClass("disabled")){
      return;
    }else{
      $("#contractModal").addClass("agreed");
      $("label.agreeBox").trigger("click");
    }
  });
  $(".signupBtn").off("click touch").on("click touch", function(e){
    e.preventDefault();
    if(!($("#contractModal").hasClass("opened") && $("#contractModal").hasClass("agreed"))){
      alert("이용약관에 동의해주세요!");
      return false;
    }
    if($(this).parents(".signupForm").valid()){
      $(this).parents(".signupForm").submit();
    }
  });
  
  $(".message .switchSigninForm").each(function(){
    $(this).off("click touch").on("click touch", function(e){
      e.preventDefault();
      switchSigninForm(function(){
        $('html').animate({
          scrollTop: document.documentElement.scrollTop + $(".loginPage:visible")[0].getBoundingClientRect().top - $("#mainNav").height()
        }, scrollDelay, "easeInOutExpo");
        $(".loginPage .signinForm:visible").find("input[name='email']").focus();
      });
    });
  });
  
  $(".message .switchSignupForm").each(function(){
    $(this).off("click touch").on("click touch", function(e){
      e.preventDefault();
      switchSignupForm(function(){
        $('html').animate({
          scrollTop: document.documentElement.scrollTop + $(".loginPage:visible")[0].getBoundingClientRect().top - $("#mainNav").height()
        }, scrollDelay, "easeInOutExpo");
        $(".loginPage .signupForm:visible").find("input[name='email']").focus();
      });
    });
  });
  
  $(".message a.passwordReset").off("click touch").on("click touch", function(e){
    e.preventDefault();
    switchResetForm(function(){
      $('html').animate({
        scrollTop: document.documentElement.scrollTop + $(".loginPage:visible")[0].getBoundingClientRect().top - $("#mainNav").height()
      }, scrollDelay, "easeInOutExpo");
      $(".loginPage .resetForm:visible").find("input[name='email']").focus();
    });
  });
  
  $(".message a.returnSignin").off("click touch").on("click touch", function(e){
    e.preventDefault();
    switchResetForm(function(){
      $('html').animate({
        scrollTop: document.documentElement.scrollTop + $(".loginPage:visible")[0].getBoundingClientRect().top - $("#mainNav").height()
      }, scrollDelay, "easeInOutExpo");
      $(".loginPage .signinForm:visible").find("input[name='email']").focus();
    });
  });

  $(".resetBtn").off("click touch").on("touch click", function(e){
    e.preventDefault();
    e.stopPropagation();
    if($(this).parents(".resetForm").valid()){
      $.post("/resetPassword", {email:$(this).prev().val()})
      .done(function(){
        alert("비밀번호 초기화 메일을 보냈습니다. 메일을 확인해주세요!");
      }).fail(function(xhr){
        if(xhr && xhr.status === 404){
          alert("등록되지 않은 이메일입니다. 이메일 주소를 확인해주세요!");
        }else{
          alert("메일 보내기에 실패했습니다. 다시 시도해주세요!");
        }
      });
    }
  });
  
  $("#copyEmail").on("touch click", function(e){
    e.preventDefault();
		var range = document.createRange();
		range.selectNodeContents($(this)[0]);
		var sel = window.getSelection? window.getSelection() : document.selection;
		sel.removeAllRanges();
		sel.addRange(range);
		var title = "";
		if(document.execCommand('copy')){
		  title = "메일주소가 복사되었습니다.";
		}else{
	    title = "메일주소를 복사하지 못했습니다. 직접 선택하여 복사해주세요.";
		}
		$(this).attr("title", title).tooltip({
		  trigger: "manual",
		  delay:{"hide":1000}
		});
	  $(this).tooltip("show");
	  setTimeout(function(){
	    $("#copyEmail").attr("title", "메일주소 복사").tooltip("dispose");
	  }, 1500);
	  if(sel.empty){// Chrome, IE
	    sel.empty();
	  }else if(sel.removeAllRanges){ // Firefox
	    sel.removeAllRanges();
	  }
		return false;
  });
  $(".openAppLink").off("touch click").on("touch click", function(e){
    var ua = navigator.userAgent.toLocaleLowerCase();

    if (ua.indexOf("android") > -1) {
      // e.preventDefault();
      // navigator.app.loadUrl($(this).data("android")); // Android only
      // return false;
    } else if (ua.indexOf("ipod")>-1 || ua.indexOf("iphone")>-1 || ua.indexOf("ipad")>-1) {
      // setTimeout(function(){
      //   window.location = $(this).data("ios-install");
      // }, 25);
      window.open($(this).data("ios"), "_system");
    }
  });
  $(".navbar-collapse").on("show.bs.collapse", function(){
    $("#mainNav").removeClass("collapsed");
  }).on("hidden.bs.collapse", function(){
    $("#mainNav").addClass("collapsed");
  });
})(jQuery);