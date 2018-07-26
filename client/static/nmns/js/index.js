/*global jQuery, location*/
(function($) {
  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top - 60)
        }, 1000, "easeInOutExpo");
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
    $('.navbar-collapse').collapse('hide');
  });

  // Activate scrollspy to add active class to navbar items on scroll
  $('body').scrollspy({
    target: '#mainNav',
    offset: 80
  });

  function switchForm(callback){
    if($(".loginPage form:visible input[name='email']").val() !== ""){
      $(".loginPage form:hidden input[name='email']").val($(".loginPage form:visible input[name='email']").val());
    }
    $('.loginPage form').not("#resetForm").animate({height: "toggle", opacity: "toggle"}, "slow", null, callback);
  }
  
  function switchResetForm(callback){
    if($(".loginPage form:visible input[name='email']").val() !== ""){
      $(".loginPage form:hidden input[name='email']").val($(".loginPage form:visible input[name='email']").val());
    }
    $('.loginPage form').not("#signupForm").animate({height: "toggle", opacity: "toggle"}, "slow", null, callback);
  }

  $(document).ready(function(){
    $.validator.addMethod("passwordCheck", function(value, element){
      return /\W+/.test(value) && /[0-9]+/.test(value);//특수문자와 숫자가 하나 이상 포함
    }, "비밀번호는 하나 이상의 숫자와 특수문자를 포함해야합니다.");
    $("#signinForm").validate({
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
    $("#resetForm").validate({
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
    $("#signupForm").validate({
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
  });

  $("#signupLink").on("click touch", function(e){
    e.preventDefault();
    if(!$(".loginPage form:visible").is("#signupForm")){
      switchForm(function(){
        var first = true;
        return function(){
          if(first){
            first = false;
            return;
          }
          $('html, body').animate({
            scrollTop: $("#mainNav").height() + parseInt($(".loginPage").css("top"))
          }, 1000, "easeInOutExpo");
          $("#signupForm input[name='email']").focus();
      }}());
    }else{
      $('html, body').animate({
        scrollTop: $("#mainNav").height() + parseInt($(".loginPage").css("top"))
      }, 1000, "easeInOutExpo");
      $("#signupForm input[name='email']").focus();
    }
  });

  $("#signinLink").on("click touch", function(e){
    e.preventDefault();
    if(!$(".loginPage form:visible").is("#signinForm")){
      switchForm(function(){
        var first = true;
        return function(){
          if(first){
            first = false;
            return;
          }
          if(!$("#signinBtn").is(":visible")){
            $(".message a.returnSignin").trigger("click");
          }else{
            $('html, body').animate({
              scrollTop: $("#mainNav").height() + parseInt($(".loginPage").css("top"))
            }, 1000, "easeInOutExpo");
            $("#signinForm input[name='email']").focus();
          }
      }}());
    }else{
      if(!$("#signinBtn").is(":visible")){
        $(".message a.returnSignin").trigger("click");
      }else{
        $('html, body').animate({
          scrollTop: $("#mainNav").height() + parseInt($(".loginPage").css("top"))
        }, 1000, "easeInOutExpo");
        $("#signinForm input[name='email']").focus();
      }
    }
  });
  
  $("#signinBtn").on("click touch", function(e){
    e.preventDefault();
    if($("#signinForm").valid()){
      $("#signinForm").submit();
    }
  });
  
  $("#signupBtn").on("click touch", function(e){
    e.preventDefault();
    if($("#signupForm").valid()){
      $("#signupForm").submit();
    }
  });
  
  $(".message .switchForm").on("click touch", function(e){
    e.preventDefault();
    switchForm();
  });
  
  $(".message a.passwordReset").on("click touch", function(e){
    e.preventDefault();
    switchResetForm(function(){
      $('html, body').animate({
        scrollTop: $("#mainNav").height() + parseInt($(".loginPage").css("top"))
      }, 1000, "easeInOutExpo");
      $("#resetForm input[name='email']").focus();
    });
  });
  
  $(".message a.returnSignin").on("click touch", function(e){
    e.preventDefault();
    switchResetForm(function(){
      $('html, body').animate({
        scrollTop: $("#mainNav").height() + parseInt($(".loginPage").css("top"))
      }, 1000, "easeInOutExpo");
      $("#signinForm input[name='email']").focus();
    });
  });

  $("#resetBtn").on("touch click", function(e){
    e.preventDefault();
    e.stopPropagation();
    if($("#resetForm").valid()){
      $.post("/resetPassword", {email:$(this).prev().val()})
      .done(function(){
        alert("비밀번호 초기화 메일을 보냈습니다. 메일을 확인해주세요!");
      }).fail(function(){
        alert("메일 보내기에 실패했습니다. 다시 시도해주세요!");
      });
    }
  });
})(jQuery);