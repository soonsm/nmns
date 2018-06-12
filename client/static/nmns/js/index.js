/*global jQuery, location*/
(function($) {
  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top - 70)
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

  // Floating label headings for the contact form
  $(function() {
    $("body").on("input propertychange", ".floating-label-form-group", function(e) {
      $(this).toggleClass("floating-label-form-group-with-value", !!$(e.target).val());
    }).on("focus", ".floating-label-form-group", function() {
      $(this).addClass("floating-label-form-group-with-focus");
    }).on("blur", ".floating-label-form-group", function() {
      $(this).removeClass("floating-label-form-group-with-focus");
    });
  });

  function switchForm(callback){
    if($(".loginPage form:visible input[name='email']").val() !== ""){
      $(".loginPage form:hidden input[name='email']").val($(".loginPage form:visible input[name='email']").val());
    }
    $('.loginPage form').animate({height: "toggle", opacity: "toggle"}, "slow", null, callback);
  }
  
  $('.message a').click(switchForm);
  
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
          document.documentElement.scrollTop = $("#mainNav").height() + parseInt($(".loginPage").css("top"));
          document.body.scrollTop = $("#mainNav").height() + parseInt($(".loginPage").css("top"));
          $(".loginPage .signupForm input[name='email']").focus();
      }}());
    }else{
      document.documentElement.scrollTop = $("#mainNav").height() + parseInt($(".loginPage").css("top"));
      document.body.scrollTop = $("#mainNav").height() + parseInt($(".loginPage").css("top"));
      $(".loginPage .signupForm input[name='email']").focus();
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
          document.documentElement.scrollTop = $("#mainNav").height() + parseInt($(".loginPage").css("top"));
          document.body.scrollTop = $("#mainNav").height() + parseInt($(".loginPage").css("top"));
          $(".loginPage .signinForm input[name='email']").focus();
      }}());
    }else{
      document.documentElement.scrollTop = $("#mainNav").height() + parseInt($(".loginPage").css("top"));
      document.body.scrollTop = $("#mainNav").height() + parseInt($(".loginPage").css("top"));
      $(".loginPage .signinForm input[name='email']").focus();
    }
  });
  
  $("#signinBtn").on("click", function(e){
    e.preventDefault();
    $.post("/signin", {});
  });
  
  $("#signupBtn").on("click", function(e){
    e.preventDefault();
  });
  
  $(".message a").on("click", function(e){
    e.preventDefault(); 
  });
})(jQuery);