function toYYYYMMDD(date){
  var month = (date.getMonth() + 1) + "", day = date.getDate() + "";
  return date.getFullYear() + (month.length<2? "0" + month : month) + (day.length<2? "0" + day : day);
};
var generateRandom = function(){
  
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
  	bth[buf[i++]], bth[buf[i++]]]).join('');
  }

  if (getRandomValues) {
    // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
    return function(){
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
    return function(){
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
    var i=0;
    while (i < this.length) {
      if(test(this[i], target)){
        this.splice(i, 1);
      }
      ++i;
    }
    return this;
};

if(!Array.prototype.find){
  Array.prototype.find = function(test){
    var i=0;
    while(i < this.length){
      if(test(this[i])){
        return this[i];
      }
      ++i;
    }
    return undefined;
  }
}
if(!Array.prototype.findIndex){
  Array.prototype.findIndex = function(test){
    var i=0;
    while(i < this.length){
      if(test(this[i])){
        return i;
      }
      ++i;
    }
    return -1;
  }
}
function getColorFromBackgroundColor(background){
  var o = Math.round(((parseInt(background.substring(1,3), 16) * 299) +
                      (parseInt(background.substring(3,5), 16) * 587) +
                      (parseInt(background.substring(5,7), 16) * 114)) / 1000);
  return (o > 125 ? '#212121' : '#ffffff');
}
function filterNonNumericCharacter(obj){
  obj.val(obj.val().replace(/\D/g,''));
}

function dashContact(contact){
  return (contact?(contact.length===11?(contact.substring(0,3)+"-"+contact.substring(3,7)+"-"+contact.substring(7)):(contact.length===10?(contact.substring(0,3)+"-"+contact.substring(3,6)+"-"+contact.substring(6)):contact)):"");
}

function findById(item, target){
  return item.id === target;
}

function getCookie(cookieName){
  var name = cookieName + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
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

      var result = [], prop, i;

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
var socketResponse = function(requestName, successCallback, failCallback, silent){
  return function(res){
    if(res && res.type === "response"){
      if(res.status){//success
        if(successCallback){
          successCallback(res);
        }
      }else{//fail
        if(!silent){
          alert(requestName + "에 실패했습니다." + (res.message?"(" + res.message + ")":""));
        }
        if(failCallback){
          failCallback(res);
        }
      }
    }else if(res && (res.type === "push" || res.type === "alert")){
      if(successCallback){
        successCallback(res);
      }
    }else{
      console.error(res);
    }
  };
};