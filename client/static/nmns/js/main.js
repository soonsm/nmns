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

  // Closes responsive menu when a scroll trigger link is clicked
  $('.js-scroll-trigger').click(function() {
    $('.navbar-collapse').collapse('hide');
  });

  $(document).ready(function(){

  });

  var NMNS_GLOBAL = {};
  
  NMNS_GLOBAL.calendar = new tui.Calendar("#mainCalendar", {
    defaultView:"week",
    taskView:true,
    template:{
      monthGridHeader: function(model){
        var date = new Date(model.date);
        var template = "<span class='tui-full-calendar-weekday-grid-date'>"+date.getDate() + "</span>";
        return template;
      }
    }
  });
  
  NMNS_GLOBAL.socket = io();
  NMNS_GLOBAL.socket.on("message", function(e){
    console.log(e);
  });
  NMNS_GLOBAL.socket.emit("get info");
  NMNS_GLOBAL.socket.on("get info", function(e){
    console.log(e);
  });
})(jQuery);