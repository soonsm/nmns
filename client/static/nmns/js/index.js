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

  // Collapse Navbar
  function navbarCollapse(){
    if ($("#mainNav").offset().top > 100) {
      $("#mainNav").addClass("navbar-shrink");
    } else {
      $("#mainNav").removeClass("navbar-shrink");
    }
  };
  navbarCollapse();
  // Collapse the navbar when page is scrolled
  $(window).scroll(navbarCollapse);

  function switchForm(callback){
    if($(".loginPage form:visible input[name='email']").val() !== ""){
      $(".loginPage form:hidden input[name='email']").val($(".loginPage form:visible input[name='email']").val());
    }
    $('.loginPage form').animate({height: "toggle", opacity: "toggle"}, "slow", null, callback);
  }
  
  function alignMiddle(){
    $(".carousel-caption").each(function(){
      if($(window).width()<=750){
        if($(this).height()>0){
          $(this).css("top", ($("#mainNav").height()+($("#carouselWrapper").height()/2)-250-($(this).height()/2)) + "px");
        }else{
          $(this).css("top", ($("#mainNav").height()+($("#carouselWrapper").height()/2)-400) + "px");
        }
      }else{
        if($(this).height()>0){
          $(this).css("top", ($("#mainNav").height()+($("#carouselWrapper").height()/2)-70-($(this).height()/2)) + "px");
        }else{
          $(this).css("top", ($("#mainNav").height()+($("#carouselWrapper").height()/2)-130) + "px");
        }
      }
    });
    if($(window).width()>=751){
      $(".loginPage").css("top", (($("#carouselWrapper").height()/2)-(25+($(".loginPage .form").height()/2))) + "px");
    }else{
      $(".loginPage").css("top", "2rem");
    }
  }

  $(window).on("resize", alignMiddle);
  
  $("#mainIndicators img").on("load", function(){
    alignMiddle();
  });

  $(document).ready(function(){
    alignMiddle();
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
    $("#signupForm").validate({
      rules:{
        email:{
          required:true,
          email:true
        },
        password:{
          required:true
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
        password:"비밀번호를 입력해주세요.",
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
      console.log("bb");
      switchForm(function(){
        var first = true;
        return function(){
          if(first){
            first = false;
            return;
          }
          alignMiddle();
          $('html, body').animate({
            scrollTop: $("#mainNav").height() + parseInt($(".loginPage").css("top")) - 45
          }, 1000, "easeInOutExpo");
          $("#signupForm input[name='email']").focus();
      }}());
    }else{
      console.log("aa");
      $('html, body').animate({
        scrollTop: $("#mainNav").height() + parseInt($(".loginPage").css("top")) - 45
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
              scrollTop: $("#mainNav").height() + parseInt($(".loginPage").css("top")) - 45
            }, 1000, "easeInOutExpo");
            $("#signinForm input[name='email']").focus();
          }
      }}());
    }else{
      if(!$("#signinBtn").is(":visible")){
        $(".message a.returnSignin").trigger("click");
      }else{
        $('html, body').animate({
          scrollTop: $("#mainNav").height() + parseInt($(".loginPage").css("top")) - 45
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
  
  $(".message a[class!='passwordReset'][class!='returnSignin']").on("click touch", function(e){
    e.preventDefault();
    switchForm();
  });
  
  $(".message a.passwordReset").on("click touch", function(e){
    e.preventDefault();
    $("#normalSignin").hide();
    $("#signinForm").attr("action", "/resetPassword");
    $("#passwordReset").show();
    alignMiddle();
    $('html, body').animate({
      scrollTop: $("#mainNav").height() + parseInt($(".loginPage").css("top"))
    }, 1000, "easeInOutExpo");
    $("#signinForm input[name='email']").focus();
  });
  
  $(".message a.returnSignin").on("click touch", function(e){
    e.preventDefault();
    $("#passwordReset").hide();
    $("#signinForm").attr("action", "/signin");
    $("#normalSignin").show();
    alignMiddle();
    $('html, body').animate({
      scrollTop: $("#mainNav").height() + parseInt($(".loginPage").css("top"))
    }, 1000, "easeInOutExpo");
    $("#signinForm input[name='email']").focus();
  });
})(jQuery);