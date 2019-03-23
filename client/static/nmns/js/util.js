function toYYYYMMDD(date) {
    var month = (date.getMonth() + 1) + "",
        day = date.getDate() + "";
    return date.getFullYear() + (month.length < 2 ? "0" + month : month) + (day.length < 2 ? "0" + day : day);
};
var generateRandom = function() {

    // Unique ID creation requires a high quality random # generator.  In the
    // browser this is a little complicated due to unknown quality of Math.random()
    // and inconsistent support for the `crypto` API.  We do the best we can via
    // feature-detection

    // getRandomValues needs to be invoked in a context where "this" is a Crypto
    // implementation. Also, find the complete implementation of crypto on IE11.
    var getRandomValues = (typeof(crypto) != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)) ||
        (typeof(msCrypto) != 'undefined' && typeof window.msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto));
    /**
     * Convert array of 16 byte values to UUID string format of the form:
     * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
     */
    var byteToHex = [];
    for (var i = 0; i < 256; ++i) {
        byteToHex[i] = (i + 0x100).toString(16).substr(1);
    }

    function bytesToUuid(buf) {
        var i = 0;
        var bth = byteToHex;
        // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
        return ([bth[buf[i++]], bth[buf[i++]],
            bth[buf[i++]], bth[buf[i++]], '-',
            bth[buf[i++]], bth[buf[i++]], '-',
            bth[buf[i++]], bth[buf[i++]], '-',
            bth[buf[i++]], bth[buf[i++]], '-',
            bth[buf[i++]], bth[buf[i++]],
            bth[buf[i++]], bth[buf[i++]],
            bth[buf[i++]], bth[buf[i++]]
        ]).join('');
    }

    if (getRandomValues) {
        // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
        return function() {
            var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef
            getRandomValues(rnds8);
            // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
            rnds8[6] = (rnds8[6] & 0x0f) | 0x40;
            rnds8[8] = (rnds8[8] & 0x3f) | 0x80;
            return bytesToUuid(rnds8);
        };

    } else {
        // Math.random()-based (RNG)
        //
        // If all else fails, use Math.random().  It's fast, but is of unspecified
        // quality.
        return function() {
            var rnds = new Array(16);
            for (var i = 0, r; i < 16; i++) {
                if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
                rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
            }
            // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
            rnds[6] = (rnds[6] & 0x0f) | 0x40;
            rnds[8] = (rnds[8] & 0x3f) | 0x80;

            return bytesToUuid(rnds);
        };
    }

}();

Array.prototype.remove = function(target, test) {
    var i = 0;
    while (i < this.length) {
        if (test(this[i], target)) {
            this.splice(i, 1);
        }
        ++i;
    }
    return this;
};

if (!Array.prototype.find) {
    Array.prototype.find = function(test) {
        var i = 0;
        while (i < this.length) {
            if (test(this[i])) {
                return this[i];
            }
            ++i;
        }
        return undefined;
    }
}
if (!Array.prototype.findIndex) {
    Array.prototype.findIndex = function(test) {
        var i = 0;
        while (i < this.length) {
            if (test(this[i])) {
                return i;
            }
            ++i;
        }
        return -1;
    }
}

function getColorFromBackgroundColor(background) {
    var o = Math.round(((parseInt(background.substring(1, 3), 16) * 299) +
        (parseInt(background.substring(3, 5), 16) * 587) +
        (parseInt(background.substring(5, 7), 16) * 114)) / 1000);
    return (o > 125 ? '#212121' : '#ffffff');
}

function filterNonNumericCharacter(obj) {
    obj.val(obj.val().replace(/\D/g, ''));
}

function setInputFilter(textbox, inputFilter) {
  ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function(event) {
    textbox.addEventListener(event, function() {
      if (inputFilter(this.value)) {
        this.oldValue = this.value;
        this.oldSelectionStart = this.selectionStart;
        this.oldSelectionEnd = this.selectionEnd;
      } else if (this.hasOwnProperty("oldValue")) {
        this.value = this.oldValue;
        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
      }
    });
  });
}

function setNumericInput(textbox){
    setInputFilter(textbox, function(value){
        return /^\d*\.?\d*$/.test(value);
    })
}

var nonCharacter = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;

function removeNonCharacter(string) {
    return string.replace(nonCharacter, '');
}

function dashContact(contact, delimiter) {
    if(!delimiter){
        delimiter = '-'
    }
    return (contact ? (contact.length === 11 ? (contact.substring(0, 3) + delimiter + contact.substring(3, 7) + delimiter + contact.substring(7)) : (contact.length === 10 ? (contact.substring(0, 3) + delimiter + contact.substring(3, 6) + delimiter + contact.substring(6)) : contact)) : "");
}

function findById(item, target) {
    return item.id === target;
}

function getCookie(cookieName) {
    var name = cookieName + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return undefined;
}

if (!Object.keys) {
    Object.keys = (function() {
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
            dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ],
            dontEnumsLength = dontEnums.length;

        return function(obj) {
            if (typeof obj !== 'function' && (typeof obj !== 'object' || obj === null)) {
                throw new TypeError('Object.keys called on non-object');
            }

            var result = [],
                prop, i;

            for (prop in obj) {
                if (hasOwnProperty.call(obj, prop)) {
                    result.push(prop);
                }
            }

            if (hasDontEnumBug) {
                for (i = 0; i < dontEnumsLength; i++) {
                    if (hasOwnProperty.call(obj, dontEnums[i])) {
                        result.push(dontEnums[i]);
                    }
                }
            }
            return result;
        };
    }());
}

//common websocket response wrapper
var socketResponse = function(requestName, successCallback, failCallback, silent) {
    return function(res) {
        if (res && res.type === "response") {
            if (res.status) { //success
                if (successCallback) {
                    successCallback(res);
                }
            } else { //fail
                if (!silent) {
                    alert(requestName + "에 실패했습니다." + (res.message ? "(" + res.message + ")" : ""));
                }
                if (failCallback) {
                    failCallback(res);
                }
            }
        } else if (res && (res.type === "push" || res.type === "alert")) {
            if (successCallback) {
                successCallback(res);
            }
        } else {
            console.error(res);
        }
    };
};

var snackbar = [];
//snackbar handling start
function showSnackBar(innerHtml) {
    if (document.getElementById("floatingButton")) {
        document.getElementById("floatingButton").setAttribute("data-mfb-state", "closed");
    }
    var x = document.getElementById("snackbar");
    if (!x) {
        x = document.createElement("div");
        x.setAttribute("id", "snackbar");
        x.classList.add("shadow");
        if (document.getElementById("mainContents")) {
            document.getElementById("mainContents").appendChild(x);
        } else if (document.getElementById("signupStepper")) {
            document.getElementById("signupStepper").appendChild(x);
        } else {
            document.body.appendChild(x);
        }
    } else if (x.classList.contains("show")) {
        snackbar.push(innerHtml);
    }
    x.innerHTML = innerHtml;
    x.classList.add("show");
    setTimeout(function() {
        x.classList.remove("show");
        if (snackbar.length > 0) {
            showSnackBar(snackbar.splice(0, 1)[0]);
        }
    }, 5000);
}
//snackbar handling end

var notificationSetting;

function showNotification(notification) {
    if (!notificationSetting) { //not inited
        if ("Notification" in window) {
            if (Notification.permission === "granted") {
                notificationSetting = "GRANTED";
            } else if (Notification.permission === "default") {
                notificationSetting = "REQUESTING";
                Notification.requestPermission().then(function(permission) {
                    if (permission === "granted") { //granted
                        notificationSetting = "GRANTED";
                    } else { //denied
                        notificationSetting = "DENIED";
                        $.notifyDefaults({
                            newest_on_top: true,
                            type: "minimalist",
                            allow_dismiss: true,
                            delay: 0,
                            url: "#",
                            element: "#notifications",
                            icon_type: "class",
                            onClosed: function() {
                                var height = 10;
                                $("#notifications .alert").each(function(index, item) {
                                    height += item.getBoundingClientRect().height + 10;
                                });
                                $("#notifications").height(height + "px");
                                if ($("#notifications").html() === "") {
                                    $("#notifications").hide();
                                }
                            },
                            template: '<div data-notify="container" class="col-12 alert alert-{0}" role="alert" data-id="' + notification.id + '"><button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button><i data-notify="icon" class="img-circle float-left notification-icon"></i><span data-notify="title" class="notification-title">{1}</span><span data-notify="message" class="notification-body">{2}</span></div>'
                        });
                    }
                });
            }
        }
        if (notificationSetting !== "GRANTED") {
            $.notifyDefaults({
                newest_on_top: true,
                type: "minimalist",
                allow_dismiss: true,
                delay: 0,
                url: "#",
                element: "#notifications",
                icon_type: "class",
                onClosed: function() {
                    var height = 10;
                    $("#notifications .alert").each(function(index, item) {
                        height += item.getBoundingClientRect().height + 10;
                    });
                    $("#notifications").height(height + "px");
                },
                template: '<div data-notify="container" class="col-12 alert alert-{0}" role="alert" data-id="' + notification.id + '"><button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button><i data-notify="icon" class="img-circle float-left notification-icon"></i><span data-notify="title" class="notification-title">{1}</span><span data-notify="message" class="notification-body">{2}</span><a href="{3}" target="{4}" data-notify="url"></a></div>'
            });
        }
    }

    if (notification.data && notification.data.type === "cancel reserv" && notification.data.id && notification.data.manager) {
        NMNS.calendar.updateSchedule(notification.data.id, notification.data.manager, { raw: { status: "CUSTOMERCANCELED" } });
    }

    if (notificationSetting === "GRANTED") { //native notification
        try {
            new Notification(notification.title, {
                requireInteraction: true,
                lang: "ko-KR",
                body: notification.body,
                icon: "/nmns/img/favicon-32x32.png"
            }).onclick = function(e) {
                e.preventDefault();
                if (notification.data && notification.data.url) {
                    window.open(notification.data.url, "_blank");
                }
            };
            return;
        } catch (exception) {
            console.error(exception);
        }
    }
    //bootstrap notification
    $.notify({
        icon: "fas fa-bell",
        title: notification.title,
        message: notification.body,
        url: (notification.data && notification.data.url ? notification.data.url : "#")
    }, {});
    var height = 10;
    $("#notifications .alert").each(function(index, item) {
        height += item.getBoundingClientRect().height + 10;
    });
    $("#notifications").height(height + "px");
}

var tester = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
// Thanks to:
// http://fightingforalostcause.net/misc/2006/compare-email-regex.php
// http://thedailywtf.com/Articles/Validating_Email_Addresses.aspx
// http://stackoverflow.com/questions/201323/what-is-the-best-regular-expression-for-validating-email-addresses/201378#201378
function validateEmail(email) {
    if (!email)
        return false;

    if (email.length > 254)
        return false;

    var valid = tester.test(email);
    if (!valid)
        return false;

    // Further checking of some things regex can't handle
    var parts = email.split("@");
    if (parts[0].length > 64)
        return false;

    var domainParts = parts[1].split(".");
    if (domainParts.some(function(part) { return part.length > 63; }))
        return false;

    return true;
}

function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this,
            args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        }, wait);
        if (immediate && !timeout) func.apply(context, args);
    };
}

function getBackgroundColor(color){
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    var temp = [Math.floor((parseInt(result[1], 16) + 255)/2).toString(16), Math.floor((parseInt(result[2], 16) + 255)/2).toString(16), Math.floor((parseInt(result[3], 16) + 255)/2).toString(16)]
    return result ? "#" + (temp[0].length === 1? '0' + temp[0] : temp[0] + '') + (temp[1].length === 1? '0' + temp[1] : temp[1] + '') + (temp[2].length === 1? '0' + temp[2] : temp[2] + '') : null;
}