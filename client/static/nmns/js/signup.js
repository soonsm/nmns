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
      if(i>0){
        steps[i].addEventListener('onstepback', function(e){
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
    if ( width <= 840 && stepperElement.classList.contains(cssClassHorizontal)) {
      stepperElement.classList.remove(cssClassHorizontal);
    } else if (width > 840 && !stepperElement.classList.contains(cssClassHorizontal)){
      stepperElement.classList.add(cssClassHorizontal);
    }
  };
  $("#contractText").on("scroll", function(){
    if($("#agreeContractBtn").hasClass("disabled")){
      var maxScrollPosition = $(this)[0].scrollHeight - $(this)[0].clientHeight - 500;
      if($(this).scrollTop() > maxScrollPosition){
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
  document.addEventListener("DOMContentLoaded", resizeWindow);
  
  $("#agreeContractBtn").on("touch click", function(e){
    if($(this).hasClass("disabled")){
      stepperElement.MaterialStepper.error("이용약관을 확인 후 동의해주세요.");
      alert("이용약관을 확인 후 동의해주세요.");
      return false;
    }
    stepperElement.MaterialStepper.next();
  });
  
  $("#signupBtn").on("touch click", function(e){
    if($("#signupForm").length>2){
      return false;
    }
    stepperElement.MaterialStepper.showTransitionEffect();
    setTimeout(function(){stepperElement.MaterialStepper.hideTransitionEffect.call(stepperElement.MaterialStepper)}, 3000);
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