function toYYYYMMDD(date){
  var month = (date.getMonth() + 1) + "", day = date.getDate() + "";
  return date.getFullYear() + (month.length<2? "0" + month : month) + (day.length<2? "0" + day : day);
};
(function($){
  
})(jQuery);