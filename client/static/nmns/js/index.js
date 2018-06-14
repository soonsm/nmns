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
      $(this).css("top", ($("#mainNav").height()+($("#carouselWrapper").height()/2)-($(this).height()>0?70+($(this).height()/2):130)-($(window).width()<=750?180:0)) + "px");
    });
    if($(window).width()>=751){
      $(".loginPage").css("top", (($("#carouselWrapper").height()/2)-(25+($(".loginPage .form").height()/2))) + "px");
    }else{
      $(".loginPage").css("top", "5rem");
    }
  }

  $(window).on("resize", alignMiddle);
  
  $("#mainIndicators img").on("load", function(){
    alignMiddle();
  });

  $(document).ready(function(){
    alignMiddle();
  });

  $("#signupLink").on("click", function(e){
    e.preventDefault();
    if(!$(".loginPage form:visible").hasClass("signupForm")){
      switchForm(function(){
        var first = true;
        return function(){
          if(first){
            first = false;
            return;
          }
          alignMiddle();
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

  $("#signinLink").on("click", function(e){
    e.preventDefault();
    if(!$(".loginPage form:visible").hasClass("signinForm")){
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
  
  $("#signinBtn").on("click", function(e){
    e.preventDefault();
    $("#signinForm").submit();
  });
  
  $("#signupBtn").on("click", function(e){
    e.preventDefault();
    $("#signupForm").submit();
  });
  
  $(".message a[class!='passwordReset'][class!='returnSignin']").on("click", function(e){
    e.preventDefault();
    switchForm();
  });
  
  $(".message a.passwordReset").on("click", function(e){
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
  
  $(".message a.returnSignin").on("click", function(e){
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