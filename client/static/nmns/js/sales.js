/* global NMNS, moment, $, socketResponse */
(function(){
  $("#salesSearchButton").on("touch click", function(){
    NMNS.socket.emit('get sales list', {
      start:moment(document.getElementById('salesSearchStartDate')._flatpickr.selectedDates[0]).format('YYYYMMDD'),
      end:moment(document.getElementById('salesSearchEndDate')._flatpickr.selectedDates[0]).format('YYYYMMDD'),
      name:$("#salesSearchName").val() === ''? undefined:$("#salesSearchName").val(),
      manager: $("#salesSearchManager").data('calendar-id') || undefined,
      contents: $("#salesSearchContents").val() === '' ? undefined : $("#salesSearchContents").val()
    })
  }).removeClass('disabled');
  NMNS.socket.on("get sales list", socketResponse("매출 내역 조회", function(e){
    console.log(e);
  }));
})();