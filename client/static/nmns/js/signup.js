(function($) {
    (function() {
        var selector = '.mdl-stepper#demo-stepper--linear';
        // Select stepper container element      
        var stepperElement = document.querySelector(selector);
        var Stepper;
        var steps;

        if (!stepperElement) return;

        // Get the MaterialStepper instance of element to control it.          
        Stepper = stepperElement.MaterialStepper;

        if (!Stepper) {
            console.error('MaterialStepper instance is not available for selector: ' + selector + '.');
            return;
        }
        steps = stepperElement.querySelectorAll('.mdl-step');
        for (var i = 0; i < steps.length; i++) {
            // When user clicks on [data-stepper-next] button of step.          
            steps[i].addEventListener('onstepnext', function(e) {
                // {element}.MaterialStepper.next() change the state of current step to "completed" 
                // and move one step forward.        
                Stepper.next();
            });
        }
        // When all steps are completed this event is dispatched.          
        stepperElement.addEventListener('onsteppercomplete', function(e) {
            var toast = document.querySelector('#snackbar-stepper-complete');
            if (!toast) return;
            toast.MaterialSnackbar.showSnackbar({
                message: 'Stepper linear are completed',
                timeout: 4000,
                actionText: 'Ok'
            });
        });
    })();
    // (function() {
    //     var toggle = document.querySelector('[href="#stepper-linear-toggle"]');
    //     var snippetDirections = document.querySelector('#snippet-stepper-linear');
    //     var stepperElement = snippetDirections.querySelector('.mdl-stepper');
    //     var cssClassHorizontal = 'mdl-stepper--horizontal';
    //     toggle.addEventListener('click', function(event) {
    //         event.preventDefault();

    //         if (!stepperElement) return;
    //         if (stepperElement.classList.contains(cssClassHorizontal)) {
    //             stepperElement.classList.remove(cssClassHorizontal);
    //         } else {
    //             stepperElement.classList.add(cssClassHorizontal);
    //         }
    //     });
    // })();

})(jQuery);