(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.getCronString = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
const regexString = require("./maps").regexString;
var defaultFlags = require("./maps").defaultFlags;
var defaultResultCron = require("./maps").defaultResultCron;
var flags = require("./maps").flags;
var resultCron = require("./maps").resultCron;

const tokenizeInput = require("./tokens").tokenizeInput;
const getClockTime = require("./states/clocktime").getClockTime;
const getDay = require("./states/day").getDay;
const getFrequencyOnly = require("./states/frequency").getFrequencyOnly;
const getFrequencyWith = require("./states/frequency").getFrequencyWith;
const getHour = require("./states/hour").getHour;
const getMonth = require("./states/month").getMonth;
const getMinute = require("./states/minute").getMinute;
const getSecond = require("./states/second").getSecond;
const rangeStartState = require("./states/range").rangeStartState;
const rangeEndState = require("./states/range").rangeEndState;
const getYear = require("./states/year").getYear;

/*callState function to match and call curresponding state function*/
function callState(token, stack, error) {
    let stateName = decideState(token);

    switch (stateName) {
        case "frequencyWith":
            {
                return getFrequencyWith(token, stack, error);
            }
            break;
        case "frequencyOnly":
            {
                return getFrequencyOnly(token, stack, error);
            }
            break;
        case "clockTime":
            {
                return getClockTime(token, stack, error);
            }
            break;
        case "day":
            {
                return getDay(token, stack, error);
            }
            break;
        case "minute":
            {
                return getMinute(token, stack, error);
            }
            break;
        case "second":
            {
                return getSecond(token, stack, error);
            }
            break;
        case "hour":
            {
                return getHour(token, stack, error);
            }
            break;
        case "month":
            {
                return getMonth(token, stack, error);
            }
            break;
        case "year":
            {
                return getYear(token, stack, error);
            }
            break;
        case "rangeStart":
            {
                return rangeStartState(token, stack, error);
            }
            break;
        case "rangeEnd":
            {
                return rangeEndState(token, stack, error);
            }
            break;
    }
    return true;
}

/*decideState function to decide next state*/
function decideState(token) {
    let isFound = "decideState";
    for (let key in regexString) {
        // TO DO: check for group
        let regBuilder = new RegExp(regexString[key].regextest, "ig");
        if (regBuilder.test(token)) {
            isFound = key;
            break;
        }
    }
    return isFound;
}

/*getCronString fucntion to convert human readable input string to cron string*/
module.exports = function getCronString(inputString, syntaxString) {
    //Set default syntax string
    syntaxString =
        typeof syntaxString !== "undefined"
            ? syntaxString
            : "SEC MIN HOR DOM MON WEK YER";

    //resetting map values to default
    flags.isRangeForDay = defaultFlags.isRangeForDay;
    flags.isRangeForMonth = defaultFlags.isRangeForMonth;
    flags.isRangeForYear = defaultFlags.isRangeForYear;
    flags.isRangeForHour = defaultFlags.isRangeForHour;
    flags.isRangeForMin = defaultFlags.isRangeForMin;
    flags.isRangeForSec = defaultFlags.isRangeForSec;

    resultCron.sec = defaultResultCron.sec;
    resultCron.min = defaultResultCron.min;
    resultCron.hour = defaultResultCron.hour;
    resultCron.day_of_month = defaultResultCron.day_of_month;
    resultCron.month = defaultResultCron.month;
    resultCron.day_of_week = defaultResultCron.day_of_week;
    resultCron.year = defaultResultCron.year;

    //Stack to store temperory states' data
    let stack = [];
    let error = "";
    let tokens = tokenizeInput(inputString);

    if (tokens == null) {
        error += "Please enter human readable rules !\n";
    }
    let notEndState = true;
    for (let i = 0; notEndState && i < tokens.length; i++) {
        notEndState = callState(tokens[i], stack, error);
    }

    if (resultCron.sec == "*") {
        resultCron.sec = "";
    }

    if (notEndState == false) {
        return (
            "ERROR:" +
            error +
            "\t\t" +
            syntaxString
                .replace("SEC", resultCron.sec)
                .replace("MIN", resultCron.min)
                .replace("HOR", resultCron.hour)
                .replace("DOM", resultCron.day_of_month)
                .replace("MON", resultCron.month)
                .replace("WEK", resultCron.day_of_week)
                .replace("YER", resultCron.year)
                .trim()
        );
    } else {
        return syntaxString
            .replace("SEC", resultCron.sec)
            .replace("MIN", resultCron.min)
            .replace("HOR", resultCron.hour)
            .replace("DOM", resultCron.day_of_month)
            .replace("MON", resultCron.month)
            .replace("WEK", resultCron.day_of_week)
            .replace("YER", resultCron.year)
            .trim();
    }
};

},{"./maps":2,"./states/clocktime":3,"./states/day":4,"./states/frequency":5,"./states/hour":6,"./states/minute":7,"./states/month":8,"./states/range":9,"./states/second":10,"./states/year":11,"./tokens":12}],2:[function(require,module,exports){
'use strict';
//regexString json
var regexString = {
    every : {
        "regextest" : "^(every|each|all|entire)$"
    },
    clockTime : {
        //https://regexr.com/3qqbn
        "regextest" : "^([0-9]+:)?[0-9]+ *(AM|PM)$|^([0-9]+:[0-9]+)$|(noon|midnight)",
        //https://regexr.com/3qqbt
        "regexexec" : [
            "^[0-9]+",
            ":[0-9]+",
            "pm",
            "am",
            "(noon|midnight)"
        ]
    },
    year : {
        "regextest" : "((years|year)|([0-9]{4}[0-9]*(( ?and)?,? ?))+)",
        "regexexec" : [
            "^(years|year)$",
            "[0-9]*",
            "^[0-9]{4}$"
        ]
    },
    frequencyWith : {
        "regextest" : "^[0-9]+(th|nd|rd|st)$"
    },
    frequencyOnly : {
        "regextest" : "^[0-9]+$",
        "regexexec" : "^[0-9]+"
    },
    minute : {
        "regextest" : "(minutes|minute|mins|min)",
        "regexexec" : [
            "^(minutes|minute|mins|min)$"
        ]
    },
    second : {
        "regextest" : "(seconds|second|secs|sec)",
        "regexexec" : [
            "^(seconds|second|secs|sec)$"
        ]
    },
    hour : {
        "regextest" : "(hour|hrs|hours)",
        "regexexec" : [
            "^(hour|hrs|hours)$"
        ]
    },
    day : {
        //https://regexr.com/3qqc3
        "regextest" : "^((days|day)|(((monday|tuesday|wednesday|thursday|friday|saturday|sunday|WEEKEND|MON|TUE|WED|THU|FRI|SAT|SUN)( ?and)?,? ?)+))$",
        "regexexec" : [
            "^(day|days)$",
            "(MON|TUE|WED|THU|FRI|SAT|SUN|WEEKEND)"
        ]
    },
    month : {
        //https://regexr.com/3r1na
        "regextest" : "^((months|month)|(((january|february|march|april|may|june|july|august|september|october|november|december|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEPT|OCT|NOV|DEC)( ?and)?,? ?)+))$",
        "regexexec" : [
            "^(month|months)$",
            "(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEPT|OCT|NOV|DEC)"
        ]
    },
    rangeStart : {
        "regextest" : "(between|starting|start)" ,
    },
    rangeEnd : {
        "regextest" : "(to|through|ending|end|and)" ,
    },
    tokenising : {
        "regexexec" : "(hour|hrs|hours)|(minutes|minute|mins|min)|(seconds|second|secs|sec)|((months|month)|(((january|february|march|april|may|june|july|august|september|october|november|december|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEPT|OCT|NOV|DEC)( ?and)?,? ?)+))|[0-9]+(th|nd|rd|st)|(([0-9]+:)?[0-9]+( +)?(AM|PM))|([0-9]+:[0-9]+)|(noon|midnight)|((days|day)|(((monday|tuesday|wednesday|thursday|friday|saturday|sunday|WEEKEND|MON|TUE|WED|THU|FRI|SAT|SUN)( ?and)?,? ?)+))|(([0-9]{4}[0-9]*(( ?and)?,? ?))+)|([0-9]+)|(to|through|ending|end|and)|(between|starting|start)"
    }
}

var defaultFlags = {
    "isRangeForDay" : false,
    "isRangeForMonth" : false,
    "isRangeForYear" : false,
    "isRangeForHour" : false,
    "isRangeForMin" : false,
    "isRangeForSec" : false,
};

var defaultResultCron = {
    "sec" : "*",
    "min" : "*",
    "hour" : "*",
    "day_of_month" : "*",
    "month" : "*",
    "day_of_week" : "?",
    "year" : "*"
};

var flags = {
    "isRangeForDay" : defaultFlags.isRangeForDay,
    "isRangeForMonth" : defaultFlags.isRangeForMonth,
    "isRangeForYear" : defaultFlags.isRangeForYear,
    "isRangeForHour" : defaultFlags.isRangeForHour,
    "isRangeForMin" : defaultFlags.isRangeForMin,
    "isRangeForSec" : defaultFlags.isRangeForSec,
};

var resultCron = {
    "sec" : defaultResultCron.sec,
    "min" : defaultResultCron.min,
    "hour" : defaultResultCron.hour,
    "day_of_month" : defaultResultCron.day_of_month,
    "month" : defaultResultCron.month,
    "day_of_week" : defaultResultCron.day_of_week,
    "year" : defaultResultCron.year
};


module.exports = {
    regexString,
    defaultFlags,
    defaultResultCron,
    flags,
    resultCron
}

},{}],3:[function(require,module,exports){
"use strict";

const regexString = require("../maps").regexString;
var flags = require("../maps").flags;
var resultCron = require("../maps").resultCron;

/*clockTime function to parse and store frequency value without nth*/
function getClockTime(token, stack, error) {
    //retrive hours from clocktime
    let regBuilder = new RegExp(regexString.clockTime.regexexec[0]);
    let str = token.match(regBuilder);

    let hour, min;
    if (str != null && str.length > 0) {
        hour = parseInt(str[0]);
    } else {
        hour = 0;
    }

    //retrive minutes from clockTime
    regBuilder = new RegExp(regexString.clockTime.regexexec[1]);
    str = regBuilder.exec(token);
    if (str != null && str.length > 0) {
        if (str[0].indexOf(":") != -1) {
            min = parseInt(str[0].slice(str[0].indexOf(":") + 1));
            if (min >= 60) {
                error += " please enter correct minutes !";
                return false;
            }
        } else {
            min = 0;
        }
    } else {
        min = 0;
    }

    //check for increment of hour by 12 for PM
    let regBuilderPM = new RegExp(regexString.clockTime.regexexec[2], "ig");
    let regBuilderAM = new RegExp(regexString.clockTime.regexexec[3], "ig");
    if (regBuilderPM.test(token)) {
        if (hour < 12) {
            hour += 12;
        } else if (hour > 12) {
            error += " please correct the time before PM !";
            return false;
        }
    } else if (regBuilderAM.test(token)) {
        if (hour == 12) {
            hour = 0;
        } else if (hour > 12) {
            error += " please correct the time before AM !";
            return false;
        }
    }

    regBuilder = new RegExp(regexString.clockTime.regexexec[4], "ig");
    if (regBuilder.test(token)) {
        str = token.match(regBuilder);
        if (str == "noon") {
            hour = 12;
            min = 0;
        } else {
            hour = 0;
            min = 0;
        }
    }

    // TO DO: checked=>Test==?
    let topElement = stack[stack.length - 1];
    if (topElement != null) {
        //Check if already a range is defined
        if (flags.isRangeForHour == true || flags.isRangeForMin == true) {
            error +=
                " already set for range expressions, seperate into two crons!";
            return false;
        }

        if (topElement.ownerState == "rangeStart") {
            topElement.hour.start = hour;
            topElement.min.start = min;
            stack.pop();
            stack.push(topElement);
            return true;
        } else if (topElement.ownerState == "rangeEnd") {
            if (topElement.hour == hour) {
                topElement.min.end = min;
                resultCron.min =
                    topElement.min.start + "-" + topElement.min.end;
                //flags.isRangeForHour = true;
                return true;
            } else {
                topElement.hour.end = hour;
                resultCron.hour =
                    topElement.hour.start + "-" + topElement.hour.end;
                //flags.isRangeForMin = true;
                return true;
            }
            stack.pop();
            return true;
        }
    }

    let stackElement = {
        ownerState: "clockTime",
        hour: hour,
        min: min,
        sec: 0,
    };
    resultCron.min = min;
    if (resultCron.hour != "*" && resultCron.hour != "")
        resultCron.hour += "," + hour;
    else resultCron.hour = hour;
    stack.push(stackElement);
    return true;
}

module.exports = {
    getClockTime,
};

},{"../maps":2}],4:[function(require,module,exports){
'use strict';

const regexString = require('../maps').regexString;
var flags = require('../maps').flags;
var resultCron = require('../maps').resultCron;

/*getDay function to parse days*/
function getDay(token,stack,error) {
    // TO DO: check for group
    let regBuilder = new RegExp(regexString.day.regexexec[0],"ig");
    let value = "";
    // check for word day,days
    if(regBuilder.test(token)) {
        let topElement = stack[stack.length-1];
        resultCron.day_of_week = "?";
        if(topElement == null) {
            topElement = {
                'frequency' : "*"
            };
        } else if(topElement.ownerState == "frequencyOnly") {
            resultCron.day_of_month = "0/"+topElement.frequency;
            stack.pop();
        } else if(topElement.ownerState == "frequencyWith") {
            resultCron.day_of_month = ""+topElement.frequency;
            stack.pop();
        } else {
            resultCron.day_of_month = "*";
        }
    }
    // check for values of days between [MON-SUN]
    else {
        regBuilder = new RegExp(regexString.day.regexexec[1],"ig");
        let matches = token.match(regBuilder);
        if(matches!=null && matches.length != 0) {
            resultCron.day_of_week = "";
            for(let i=0; i<matches.length; i++) {
                matches[i] = matches[i].toUpperCase();
            }
            // TO DO: check
            let topElement = stack[stack.length-1];
            if(matches.length == 1 && topElement != null) {
                //Check if already a range is defined
                if(flags.isRangeForDay == true) {
                    error +=" already set for range expressions, seperate into two crons!";
                    return false;
                }
                stack.pop();
                if(topElement.ownerState == "rangeStart") {
                    topElement.day.start = matches[0];
                    stack.push(topElement);
                    return true;
                } else if(topElement.ownerState == "rangeEnd") {
                    topElement.day.end = matches[0];
                    resultCron.day_of_week = topElement.day.start + "-"+topElement.day.end;
                    resultCron.day_of_month = "?";
                    //flags.isRangeForDay = true;
                    return true;
                }
            }
            if(matches.includes('MON') && !resultCron.day_of_week.includes('MON'))
                resultCron.day_of_week += "MON,";
            if(matches.includes('TUE') && !resultCron.day_of_week.includes('TUE'))
                resultCron.day_of_week += "TUE,";
            if(matches.includes('WED') && !resultCron.day_of_week.includes('WED'))
                resultCron.day_of_week += "WED,";
            if(matches.includes('THU') && !resultCron.day_of_week.includes('THU'))
                resultCron.day_of_week += "THU,";
            if(matches.includes('FRI') && !resultCron.day_of_week.includes('FRI'))
                resultCron.day_of_week += "FRI,";
            if(matches.includes('SAT') && !resultCron.day_of_week.includes('SAT'))
                resultCron.day_of_week += "SAT,";
            if(matches.includes('SUN') && !resultCron.day_of_week.includes('SUN'))
                resultCron.day_of_week += "SUN,";
            if(matches.includes('WEEKEND') && !resultCron.day_of_week.includes('SAT'))
                resultCron.day_of_week += "SAT,";
            if(matches.includes('WEEKEND') && !resultCron.day_of_week.includes('SUN'))
                resultCron.day_of_week += "SUN,";
            // removed extra comma
            resultCron.day_of_week = resultCron.day_of_week.slice(0,-1);
            resultCron.day_of_month = "?";
            value = ""+resultCron.day_of_week;
        } else {
            // TO DO: provide in future. but for NOW  error
            error +=" In unresolved state at 2;Day !";
            return false;
        }
    }
    let stackElement = {
        "ownerState" : "day",
        "day_of_week" : resultCron.day_of_week,
        "day_of_month" : resultCron.day_of_month
    };
    stack.push(stackElement);
    return true;
}

module.exports = {
    getDay
};

},{"../maps":2}],5:[function(require,module,exports){
'use strict';

const regexString = require('../maps').regexString;
var flags = require('../maps').flags;
var resultCron = require('../maps').resultCron;


/*frequencyOnly function to parse and store frequency value without nth*/
function getFrequencyOnly(token,stack,error) {
    let freq = parseInt(token);
    if(isNaN(token)) {
        error +=" token is not number in frequency only !";
        return false;
    }
    if(stack.length > 0 && stack[stack.length - 1].ownerState=="rangeEnd") {
        let topElement = stack[stack.length - 1];
        stack.pop();
        topElement.frequency.end = freq;
        stack.push(topElement);
        return true;
    }
    else if(stack.length > 0 && stack[stack.length - 1].ownerState=="rangeStart") {
        let topElement = stack[stack.length - 1];
        stack.pop();
        topElement.frequency.start = freq;
        stack.push(topElement);
        return true;
    }
    let stackElement = {
        "ownerState" : "frequencyOnly",
        "frequency" : freq
    };
    stack.push(stackElement);
    return true;
}

/*frequencyWith function to parse and store frequency value with nth*/
function getFrequencyWith(token,stack,error) {
    // TO DO: check for group
    let regBuilder = new RegExp(regexString.frequencyOnly.regexexec,"ig");
    let freq = regBuilder.exec(token);
    let value = parseInt(freq);
    if(isNaN(value)) {
        error +=" token is not number in frequency with !";
        return false;
    }
    if(stack.length!=0 && stack[stack.length - 1].ownerState=="rangeEnd") {
        let topElement = stack[stack.length - 1];
        stack.pop();
        topElement.frequency.end = ""+value;
        stack.push(topElement);
        return true;
    }
    else if(stack.length > 0 && stack[stack.length - 1].ownerState=="rangeStart") {
        let topElement = stack[stack.length - 1];
        stack.pop();
        topElement.frequency.start = ""+value;
        stack.push(topElement);
        return true;
    }
    let stackElement = {
        "ownerState" : "frequencyWith",
        "frequency" : value
    };
    stack.push(stackElement);
    return true;
}


module.exports = {
    getFrequencyOnly,
    getFrequencyWith
};

},{"../maps":2}],6:[function(require,module,exports){
'use strict';

const regexString = require('../maps').regexString;
var flags = require('../maps').flags;
var resultCron = require('../maps').resultCron;

/*getHour function to parse Hours*/
function getHour(token,stack,error) {
    // TO DO: check for group
    let regBuilder = new RegExp(regexString.hour.regexexec[0],"ig");
    let value;
    // check for word hours
    if(regBuilder.test(token)) {
        let topElement = stack[stack.length-1];
        if(topElement == null) {
            topElement = {
                'frequency' : "*"
            };
        } else if(topElement.ownerState == "frequencyOnly") {
            value = topElement.frequency;
            resultCron.hour = "0/"+topElement.frequency;
            stack.pop();
        } else if(topElement.ownerState == "frequencyWith") {
            //hour already set
            if(resultCron.hour != "*" && resultCron.hour != "")
                resultCron.hour += ","+topElement.frequency;
            else
                resultCron.hour = ""+topElement.frequency;
            value = resultCron.hour;
            stack.pop();
        } else {
            if(flags.isRangeForHour == true) {
                error +=" already set for range expressions, seperate into two crons!";
                return false;
            }
            else if(topElement.ownerState == "rangeStart") {
                topElement.hour.start = topElement.frequency.start;
                topElement.frequency.start = "";
                stack.pop();
                stack.push(topElement);
                return true;
            } else if(topElement.ownerState == "rangeEnd") {
                stack.pop();
                topElement.hour.start = topElement.frequency.start;
                topElement.hour.end = topElement.frequency.end;
                topElement.frequency.end = "";
                resultCron.hour = topElement.hour.start + "-"+topElement.hour.end;
                //flags.isRangeForHour = true;
                return true;
            }
        }
    }
    let stackElement = {
        "ownerState" : "hour",
        "hour" : value
    };
    stack.push(stackElement);
    return true;
}


module.exports = {
    getHour
};

},{"../maps":2}],7:[function(require,module,exports){
'use strict';

const regexString = require('../maps').regexString;
var flags = require('../maps').flags;
var resultCron = require('../maps').resultCron;

/*getMinute function to parse minutes*/
function getMinute(token,stack,error) {
    // TO DO: check for group
    let regBuilder = new RegExp(regexString.minute.regexexec[0],"ig");
    let value;
    // check for word minute,minutes
    if(regBuilder.test(token)) {
        let topElement = stack[stack.length-1];
        if(topElement == null) {
            topElement = {
                'frequency' : "*"
            };
        } else if(topElement.ownerState == "frequencyOnly") {
            value = topElement.frequency;
            resultCron.min = "0/"+topElement.frequency;
            stack.pop();
        } else if(topElement.ownerState == "frequencyWith") {
            value = topElement.frequency;
            resultCron.min = ""+topElement.frequency;
            stack.pop();
        } else {
            if(flags.isRangeForMinute == true) {
                error +=" already set for range expressions, seperate into two crons!";
                return false;
            }
            else if(topElement.ownerState == "rangeStart") {
                topElement.min.start = topElement.frequency.start;
                topElement.frequency.start = "";
                stack.pop();
                stack.push(topElement);
                return true;
            } else if(topElement.ownerState == "rangeEnd") {
                stack.pop();
                topElement.min.start = topElement.frequency.start;
                topElement.min.end = topElement.frequency.end;
                topElement.frequency.end = "";
                resultCron.min = topElement.min.start + "-"+topElement.min.end;
                //flags.isRangeForMin = true;
                return true;
            }
        }
    }
    let stackElement = {
        "ownerState" : "minute",
        "min" : value
    };
    stack.push(stackElement);
    return true;
}


module.exports = {
    getMinute
};

},{"../maps":2}],8:[function(require,module,exports){
'use strict';

const regexString = require('../maps').regexString;
var flags = require('../maps').flags;
var resultCron = require('../maps').resultCron;

/*getMonth function to parse months*/
function getMonth(token,stack,error) {
    // TO DO: check for group
    let regBuilder = new RegExp(regexString.month.regexexec[0],"ig");
    let value = "";
    // check for word month,months
    if(regBuilder.test(token)) {
        let topElement = stack[stack.length-1];
        if(topElement == null) {
            topElement = {
                'frequency' : "*"
            };
        }
        if(topElement.ownerState == "frequencyOnly") {
            resultCron.month = "0/"+topElement.frequency;
            stack.pop();
        } else if(topElement.ownerState == "frequencyWith") {
            resultCron.month = ""+topElement.frequency;
            stack.pop();
        } else {
            resultCron.month = "*";
        }
    }
    // check for values of months between [JAN-DEC]
    else {
        // TO DO: check for group
        regBuilder = new RegExp(regexString.month.regexexec[1],"ig");
        let matches = token.match(regBuilder);
        if(matches!=null && matches.length != 0) {
            resultCron.month = "";
            for(let i=0; i<matches.length; i++) {
                matches[i] = matches[i].toUpperCase();
            }
            // TO DO: check
            let topElement = stack[stack.length-1];

            if(matches.length == 1 && topElement != null) {
                //Check if already a range is defined
                if(flags.isRangeForMonth == true) {
                    error +=" already set for range expressions, seperate into two crons!";
                    return false;
                }
                stack.pop();
                if(topElement.ownerState == "frequencyOnly") {
                    resultCron.day_of_month = topElement.frequency;
                } else if(topElement.ownerState == "frequencyWith") {
                    resultCron.day_of_month = topElement.frequency;
                } else if(topElement.ownerState == "rangeStart") {
                    topElement.month.start = matches[0];
                    stack.push(topElement);
                    return true;
                } else if(topElement.ownerState == "rangeEnd") {
                    if(topElement.frequency.end != "") {
                        resultCron.day_of_week = "?";
                        resultCron.day_of_month = topElement.frequency.start + "-" + topElement.frequency.end;
                    }
                    topElement.month.end = matches[0];
                    resultCron.month = topElement.month.start + "-"+topElement.month.end;
                    //flags.isRangeForMonth = true;
                    return true;
                }
            }
            if(matches.includes('JAN') && !resultCron.month.includes('JAN'))
                resultCron.month += "JAN,";
            if(matches.includes('FEB') && !resultCron.month.includes('FEB'))
                resultCron.month += "FEB,";
            if(matches.includes('MAR') && !resultCron.month.includes('MAR'))
                resultCron.month += "MAR,";
            if(matches.includes('APR') && !resultCron.month.includes('APR'))
                resultCron.month += "APR,";
            if(matches.includes('MAY') && !resultCron.month.includes('MAY'))
                resultCron.month += "MAY,";
            if(matches.includes('JUN') && !resultCron.month.includes('JUN'))
                resultCron.month += "JUN,";
            if(matches.includes('JUL') && !resultCron.month.includes('JUL'))
                resultCron.month += "JUL,";
            if(matches.includes('AUG') && !resultCron.month.includes('AUG'))
                resultCron.month += "AUG,";
            if(matches.includes('SEPT') && !resultCron.month.includes('SEPT'))
                resultCron.month += "SEPT,";
            if(matches.includes('OCT') && !resultCron.month.includes('OCT'))
                resultCron.month += "OCT,";
            if(matches.includes('NOV') && !resultCron.month.includes('NOV'))
                resultCron.month += "NOV,";
            if(matches.includes('DEC') && !resultCron.month.includes('DEC'))
                resultCron.month += "DEC,";
            // removed extra comma
            resultCron.month = resultCron.month.slice(0,-1);
            value = ""+resultCron.month;
        } else {
            // TO DO: provide in future. but for NOW  error
            error +=" In unresolved state at 2;Month !";
            return false;
        }
    }
    let stackElement = {
        "ownerState" : "month",
        "month" : resultCron.month,
    };
    stack.push(stackElement);
    return true;
}


module.exports = {
    getMonth
};

},{"../maps":2}],9:[function(require,module,exports){
'use strict';

const regexString = require('../maps').regexString;
var flags = require('../maps').flags;
var resultCron = require('../maps').resultCron;


/*rangeStartState function for range input*/
function rangeStartState(token,stack,error) {
    if(flags.isRangeForDay || flags.isRangeForMin || flags.isRangeForMonth || flags.isRangeForYear || flags.isRangeForHour) {
        error +=" already range expressions !";
        return false;
    }
    let stackElement = {
        "ownerState" : "rangeStart",
        "min": {
            "start" : "",
            "end" : ""
        },
        "hour" : {
            "start" : "",
            "end" : ""
        },
        "day" : {
            "start" : "",
            "end" : ""
        },
        "month" : {
            "start" : "",
            "end" : ""
        },
        "year" : {
            "start" : "",
            "end" : ""
        },
        "frequency" : {
            "start" : "",
            "end" : ""
        }
    };
    stack.push(stackElement);
    return true;
}

/*rangeEndState function for range input*/
function rangeEndState(token,stack,error) {
    let stackElement = {
        "ownerState" : "rangeEnd",
        "min": {
            "start" : "",
            "end" : ""
        },
        "hour" : {
            "start" : "",
            "end" : ""
        },
        "day" : {
            "start" : "",
            "end" : ""
        },
        "month" : {
            "start" : "",
            "end" : ""
        },
        "year" : {
            "start" : "",
            "end" : ""
        },
        "frequency" : {
            "start" : "",
            "end" : ""
        }
    };
    let topElement = stack[stack.length-1];
    if(topElement!=null) {
        switch(topElement.ownerState) {
            case "frequencyWith" :
            case "frequencyOnly" :
            {
                stack.pop();
                stackElement.frequency.start = topElement.frequency;
                stackElement.ownerState = "rangeEnd";
                stack.push(stackElement)
            }
            break;
            case "clockTime" :
            {
                stack.pop();
                stackElement.hour.start = topElement.hour;
                stackElement.min.start = topElement.min;
                stackElement.ownerState = "rangeEnd";
                stack.push(stackElement)
            }
            break;
            case "rangeStart" :
            {
                stack.pop();
                topElement.ownerState = "rangeEnd";
                stack.push(topElement);
            }
            break;
            case "month" :
            {
                stack.pop();
                stackElement.ownerState = "rangeEnd";
                stackElement.month.start = topElement.month;
                stack.push(stackElement);
            }
            break;
            case "minute" :
            {
                stack.pop();
                stackElement.ownerState = "rangeEnd";
                stackElement.frequency.start = stackElement.min.start = topElement.min;
                stack.push(stackElement);
            }
            break;
            case "hour" :
            {
                stack.pop();
                stackElement.ownerState = "rangeEnd";
                stackElement.frequency.start = stackElement.hour.start = topElement.hour;
                stack.push(stackElement);
            }
            break;
            case "day" :
            {
                stack.pop();
                stackElement.ownerState = "rangeEnd";
                stackElement.day.start = topElement.day_of_week;
                stack.push(stackElement);
            }
            break;
            case "year" :
            {
                stack.pop();
                stackElement.ownerState = "rangeEnd";
                stackElement.year.start = topElement.year;
                stack.push(stackElement);
            }
            break;
        }
    }
    return true;
}


module.exports = {
    rangeStartState,
    rangeEndState
};

},{"../maps":2}],10:[function(require,module,exports){
'use strict';

const regexString = require('../maps').regexString;
var flags = require('../maps').flags;
var resultCron = require('../maps').resultCron;

/*getSecond function to parse seconds*/
function getSecond(token,stack,error) {
    // TO DO: check for group
    let regBuilder = new RegExp(regexString.second.regexexec[0],"ig");
    let value;
    // check for word second,seconds
    if(regBuilder.test(token)) {
        let topElement = stack[stack.length-1];
        if(topElement == null) {
            topElement = {
                'frequency' : "*"
            };
        } else if(topElement.ownerState == "frequencyOnly") {
            value = topElement.frequency;
            resultCron.sec = "0/"+topElement.frequency;
            stack.pop();
        } else if(topElement.ownerState == "frequencyWith") {
            value = topElement.frequency;
            resultCron.sec = ""+topElement.frequency;
            stack.pop();
        } else {
            if(flags.isRangeForSecond == true) {
                error +=" already set for range expressions, seperate into two crons!";
                return false;
            }
            else if(topElement.ownerState == "rangeStart") {
                topElement.sec.start = topElement.frequency.start;
                topElement.frequency.start = "";
                stack.pop();
                stack.push(topElement);
                return true;
            } else if(topElement.ownerState == "rangeEnd") {
                stack.pop();
                topElement.sec.start = topElement.frequency.start;
                topElement.sec.end = topElement.frequency.end;
                topElement.frequency.end = "";
                resultCron.sec = topElement.sec.start + "-"+topElement.sec.end;
                //flags.isRangeForsec = true;
                return true;
            }
        }
    }
    let stackElement = {
        "ownerState" : "second",
        "sec" : value
    };
    stack.push(stackElement);
    return true;
}


module.exports = {
    getSecond
};

},{"../maps":2}],11:[function(require,module,exports){
'use strict';

const regexString = require('../maps').regexString;
var flags = require('../maps').flags;
var resultCron = require('../maps').resultCron;


/*getYear function to parse year*/
function getYear(token,stack,error) {
    // TO DO: check for group
    let regBuilder = new RegExp(regexString.year.regexexec[0],"ig");
    let value = "";
    // check for word year,years
    if(regBuilder.test(token)) {
        let topElement = stack[stack.length-1];
        resultCron.year = "?";
        if(topElement == null) {
            topElement = {
                'frequency' : "*"
            };
        } else if(topElement.ownerState == "frequencyOnly") {
            resultCron.year = "0/"+topElement.frequency;
            stack.pop();
        } else if(topElement.ownerState == "frequencyWith") {
            resultCron.year = ""+topElement.frequency;
            stack.pop();
        } else {
            resultCron.year = "*";
        }
    }
    // check for values of years
    else {
        regBuilder = new RegExp(regexString.year.regexexec[1],"ig");
        let regBuilder2 = new RegExp(regexString.year.regexexec[2],"ig")
        let matches = token.match(regBuilder);
        let exactMatches = new Set();
        for(let i=0; i<matches.length; i++) {
            if(regBuilder2.test(matches[i])) {
                exactMatches.add(matches[i].match(regBuilder2)[0]);
            }
        }
        // TO DO: check
        let topElement = stack[stack.length-1];
        if(exactMatches.size == 1 && topElement != null) {
            //Check if already a range is defined
            if(flags.isRangeForYear == true) {
                error +=" Cannot handle multiple range expressions, seperate into two crons!";
                return false;
            }

            if(topElement.ownerState == "rangeStart") {
                topElement.year.start = Array.from(exactMatches)[0];
                stack.pop();
                stack.push(topElement);
                return true;
            } else if(topElement.ownerState == "rangeEnd") {
                topElement.year.end = Array.from(exactMatches)[0];
                stack.pop();
                resultCron.year = topElement.year.start + "-"+topElement.year.end;
                //flags.isRangeForYear = true;
                return true;
            }
        }
        if(exactMatches.size != 0) {
            resultCron.year = "";
            exactMatches.forEach(function(yr){
                resultCron.year += yr+",";
            });
            // removed extra comma
            resultCron.year = resultCron.year.slice(0,-1);
            value = ""+resultCron.year;
        } else {
            // TO DO: provide in future. but for NOW  error
            error +=" In unresolved state at 2;year !";
            return false;
        }
    }
    let stackElement = {
        "ownerState" : "year",
        "year" : resultCron.year
    };
    stack.push(stackElement);
    return true;
}

module.exports = {
    getYear
};

},{"../maps":2}],12:[function(require,module,exports){
'use strict';

const regexString = require('./maps').regexString;
var flags = require('./maps').flags;
var resultCron = require('./maps').resultCron;
//tokenizeInput function to seperate out all tokens

module.exports = {
    tokenizeInput : function(inputString){
        let regBuilder = new RegExp(regexString.tokenising.regexexec,"ig");
        let matches = inputString.match(regBuilder);
        if(matches == null || matches.length == 0 ) {
            return [];
        }
        for(let i=0;i<matches.length;i++) {
            matches[i] = (matches[i]+"").trim();
        }
        return matches;
    }
};

},{"./maps":2}]},{},[1])(1)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL2Nvc3RhL0FwcERhdGEvUm9hbWluZy9udm0vdjIzLjIuMC9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiaW5kZXguanMiLCJtYXBzLmpzIiwic3RhdGVzL2Nsb2NrdGltZS5qcyIsInN0YXRlcy9kYXkuanMiLCJzdGF0ZXMvZnJlcXVlbmN5LmpzIiwic3RhdGVzL2hvdXIuanMiLCJzdGF0ZXMvbWludXRlLmpzIiwic3RhdGVzL21vbnRoLmpzIiwic3RhdGVzL3JhbmdlLmpzIiwic3RhdGVzL3NlY29uZC5qcyIsInN0YXRlcy95ZWFyLmpzIiwidG9rZW5zLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIlwidXNlIHN0cmljdFwiO1xyXG5jb25zdCByZWdleFN0cmluZyA9IHJlcXVpcmUoXCIuL21hcHNcIikucmVnZXhTdHJpbmc7XHJcbnZhciBkZWZhdWx0RmxhZ3MgPSByZXF1aXJlKFwiLi9tYXBzXCIpLmRlZmF1bHRGbGFncztcclxudmFyIGRlZmF1bHRSZXN1bHRDcm9uID0gcmVxdWlyZShcIi4vbWFwc1wiKS5kZWZhdWx0UmVzdWx0Q3JvbjtcclxudmFyIGZsYWdzID0gcmVxdWlyZShcIi4vbWFwc1wiKS5mbGFncztcclxudmFyIHJlc3VsdENyb24gPSByZXF1aXJlKFwiLi9tYXBzXCIpLnJlc3VsdENyb247XHJcblxyXG5jb25zdCB0b2tlbml6ZUlucHV0ID0gcmVxdWlyZShcIi4vdG9rZW5zXCIpLnRva2VuaXplSW5wdXQ7XHJcbmNvbnN0IGdldENsb2NrVGltZSA9IHJlcXVpcmUoXCIuL3N0YXRlcy9jbG9ja3RpbWVcIikuZ2V0Q2xvY2tUaW1lO1xyXG5jb25zdCBnZXREYXkgPSByZXF1aXJlKFwiLi9zdGF0ZXMvZGF5XCIpLmdldERheTtcclxuY29uc3QgZ2V0RnJlcXVlbmN5T25seSA9IHJlcXVpcmUoXCIuL3N0YXRlcy9mcmVxdWVuY3lcIikuZ2V0RnJlcXVlbmN5T25seTtcclxuY29uc3QgZ2V0RnJlcXVlbmN5V2l0aCA9IHJlcXVpcmUoXCIuL3N0YXRlcy9mcmVxdWVuY3lcIikuZ2V0RnJlcXVlbmN5V2l0aDtcclxuY29uc3QgZ2V0SG91ciA9IHJlcXVpcmUoXCIuL3N0YXRlcy9ob3VyXCIpLmdldEhvdXI7XHJcbmNvbnN0IGdldE1vbnRoID0gcmVxdWlyZShcIi4vc3RhdGVzL21vbnRoXCIpLmdldE1vbnRoO1xyXG5jb25zdCBnZXRNaW51dGUgPSByZXF1aXJlKFwiLi9zdGF0ZXMvbWludXRlXCIpLmdldE1pbnV0ZTtcclxuY29uc3QgZ2V0U2Vjb25kID0gcmVxdWlyZShcIi4vc3RhdGVzL3NlY29uZFwiKS5nZXRTZWNvbmQ7XHJcbmNvbnN0IHJhbmdlU3RhcnRTdGF0ZSA9IHJlcXVpcmUoXCIuL3N0YXRlcy9yYW5nZVwiKS5yYW5nZVN0YXJ0U3RhdGU7XHJcbmNvbnN0IHJhbmdlRW5kU3RhdGUgPSByZXF1aXJlKFwiLi9zdGF0ZXMvcmFuZ2VcIikucmFuZ2VFbmRTdGF0ZTtcclxuY29uc3QgZ2V0WWVhciA9IHJlcXVpcmUoXCIuL3N0YXRlcy95ZWFyXCIpLmdldFllYXI7XHJcblxyXG4vKmNhbGxTdGF0ZSBmdW5jdGlvbiB0byBtYXRjaCBhbmQgY2FsbCBjdXJyZXNwb25kaW5nIHN0YXRlIGZ1bmN0aW9uKi9cclxuZnVuY3Rpb24gY2FsbFN0YXRlKHRva2VuLCBzdGFjaywgZXJyb3IpIHtcclxuICAgIGxldCBzdGF0ZU5hbWUgPSBkZWNpZGVTdGF0ZSh0b2tlbik7XHJcblxyXG4gICAgc3dpdGNoIChzdGF0ZU5hbWUpIHtcclxuICAgICAgICBjYXNlIFwiZnJlcXVlbmN5V2l0aFwiOlxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0RnJlcXVlbmN5V2l0aCh0b2tlbiwgc3RhY2ssIGVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwiZnJlcXVlbmN5T25seVwiOlxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0RnJlcXVlbmN5T25seSh0b2tlbiwgc3RhY2ssIGVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwiY2xvY2tUaW1lXCI6XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBnZXRDbG9ja1RpbWUodG9rZW4sIHN0YWNrLCBlcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcImRheVwiOlxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0RGF5KHRva2VuLCBzdGFjaywgZXJyb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJtaW51dGVcIjpcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGdldE1pbnV0ZSh0b2tlbiwgc3RhY2ssIGVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwic2Vjb25kXCI6XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBnZXRTZWNvbmQodG9rZW4sIHN0YWNrLCBlcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcImhvdXJcIjpcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGdldEhvdXIodG9rZW4sIHN0YWNrLCBlcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcIm1vbnRoXCI6XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBnZXRNb250aCh0b2tlbiwgc3RhY2ssIGVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwieWVhclwiOlxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0WWVhcih0b2tlbiwgc3RhY2ssIGVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwicmFuZ2VTdGFydFwiOlxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmFuZ2VTdGFydFN0YXRlKHRva2VuLCBzdGFjaywgZXJyb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJyYW5nZUVuZFwiOlxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmFuZ2VFbmRTdGF0ZSh0b2tlbiwgc3RhY2ssIGVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlO1xyXG59XHJcblxyXG4vKmRlY2lkZVN0YXRlIGZ1bmN0aW9uIHRvIGRlY2lkZSBuZXh0IHN0YXRlKi9cclxuZnVuY3Rpb24gZGVjaWRlU3RhdGUodG9rZW4pIHtcclxuICAgIGxldCBpc0ZvdW5kID0gXCJkZWNpZGVTdGF0ZVwiO1xyXG4gICAgZm9yIChsZXQga2V5IGluIHJlZ2V4U3RyaW5nKSB7XHJcbiAgICAgICAgLy8gVE8gRE86IGNoZWNrIGZvciBncm91cFxyXG4gICAgICAgIGxldCByZWdCdWlsZGVyID0gbmV3IFJlZ0V4cChyZWdleFN0cmluZ1trZXldLnJlZ2V4dGVzdCwgXCJpZ1wiKTtcclxuICAgICAgICBpZiAocmVnQnVpbGRlci50ZXN0KHRva2VuKSkge1xyXG4gICAgICAgICAgICBpc0ZvdW5kID0ga2V5O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaXNGb3VuZDtcclxufVxyXG5cclxuLypnZXRDcm9uU3RyaW5nIGZ1Y250aW9uIHRvIGNvbnZlcnQgaHVtYW4gcmVhZGFibGUgaW5wdXQgc3RyaW5nIHRvIGNyb24gc3RyaW5nKi9cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRDcm9uU3RyaW5nKGlucHV0U3RyaW5nLCBzeW50YXhTdHJpbmcpIHtcclxuICAgIC8vU2V0IGRlZmF1bHQgc3ludGF4IHN0cmluZ1xyXG4gICAgc3ludGF4U3RyaW5nID1cclxuICAgICAgICB0eXBlb2Ygc3ludGF4U3RyaW5nICE9PSBcInVuZGVmaW5lZFwiXHJcbiAgICAgICAgICAgID8gc3ludGF4U3RyaW5nXHJcbiAgICAgICAgICAgIDogXCJTRUMgTUlOIEhPUiBET00gTU9OIFdFSyBZRVJcIjtcclxuXHJcbiAgICAvL3Jlc2V0dGluZyBtYXAgdmFsdWVzIHRvIGRlZmF1bHRcclxuICAgIGZsYWdzLmlzUmFuZ2VGb3JEYXkgPSBkZWZhdWx0RmxhZ3MuaXNSYW5nZUZvckRheTtcclxuICAgIGZsYWdzLmlzUmFuZ2VGb3JNb250aCA9IGRlZmF1bHRGbGFncy5pc1JhbmdlRm9yTW9udGg7XHJcbiAgICBmbGFncy5pc1JhbmdlRm9yWWVhciA9IGRlZmF1bHRGbGFncy5pc1JhbmdlRm9yWWVhcjtcclxuICAgIGZsYWdzLmlzUmFuZ2VGb3JIb3VyID0gZGVmYXVsdEZsYWdzLmlzUmFuZ2VGb3JIb3VyO1xyXG4gICAgZmxhZ3MuaXNSYW5nZUZvck1pbiA9IGRlZmF1bHRGbGFncy5pc1JhbmdlRm9yTWluO1xyXG4gICAgZmxhZ3MuaXNSYW5nZUZvclNlYyA9IGRlZmF1bHRGbGFncy5pc1JhbmdlRm9yU2VjO1xyXG5cclxuICAgIHJlc3VsdENyb24uc2VjID0gZGVmYXVsdFJlc3VsdENyb24uc2VjO1xyXG4gICAgcmVzdWx0Q3Jvbi5taW4gPSBkZWZhdWx0UmVzdWx0Q3Jvbi5taW47XHJcbiAgICByZXN1bHRDcm9uLmhvdXIgPSBkZWZhdWx0UmVzdWx0Q3Jvbi5ob3VyO1xyXG4gICAgcmVzdWx0Q3Jvbi5kYXlfb2ZfbW9udGggPSBkZWZhdWx0UmVzdWx0Q3Jvbi5kYXlfb2ZfbW9udGg7XHJcbiAgICByZXN1bHRDcm9uLm1vbnRoID0gZGVmYXVsdFJlc3VsdENyb24ubW9udGg7XHJcbiAgICByZXN1bHRDcm9uLmRheV9vZl93ZWVrID0gZGVmYXVsdFJlc3VsdENyb24uZGF5X29mX3dlZWs7XHJcbiAgICByZXN1bHRDcm9uLnllYXIgPSBkZWZhdWx0UmVzdWx0Q3Jvbi55ZWFyO1xyXG5cclxuICAgIC8vU3RhY2sgdG8gc3RvcmUgdGVtcGVyb3J5IHN0YXRlcycgZGF0YVxyXG4gICAgbGV0IHN0YWNrID0gW107XHJcbiAgICBsZXQgZXJyb3IgPSBcIlwiO1xyXG4gICAgbGV0IHRva2VucyA9IHRva2VuaXplSW5wdXQoaW5wdXRTdHJpbmcpO1xyXG5cclxuICAgIGlmICh0b2tlbnMgPT0gbnVsbCkge1xyXG4gICAgICAgIGVycm9yICs9IFwiUGxlYXNlIGVudGVyIGh1bWFuIHJlYWRhYmxlIHJ1bGVzICFcXG5cIjtcclxuICAgIH1cclxuICAgIGxldCBub3RFbmRTdGF0ZSA9IHRydWU7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgbm90RW5kU3RhdGUgJiYgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIG5vdEVuZFN0YXRlID0gY2FsbFN0YXRlKHRva2Vuc1tpXSwgc3RhY2ssIGVycm9yKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAocmVzdWx0Q3Jvbi5zZWMgPT0gXCIqXCIpIHtcclxuICAgICAgICByZXN1bHRDcm9uLnNlYyA9IFwiXCI7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG5vdEVuZFN0YXRlID09IGZhbHNlKSB7XHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgXCJFUlJPUjpcIiArXHJcbiAgICAgICAgICAgIGVycm9yICtcclxuICAgICAgICAgICAgXCJcXHRcXHRcIiArXHJcbiAgICAgICAgICAgIHN5bnRheFN0cmluZ1xyXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoXCJTRUNcIiwgcmVzdWx0Q3Jvbi5zZWMpXHJcbiAgICAgICAgICAgICAgICAucmVwbGFjZShcIk1JTlwiLCByZXN1bHRDcm9uLm1pbilcclxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKFwiSE9SXCIsIHJlc3VsdENyb24uaG91cilcclxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKFwiRE9NXCIsIHJlc3VsdENyb24uZGF5X29mX21vbnRoKVxyXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoXCJNT05cIiwgcmVzdWx0Q3Jvbi5tb250aClcclxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKFwiV0VLXCIsIHJlc3VsdENyb24uZGF5X29mX3dlZWspXHJcbiAgICAgICAgICAgICAgICAucmVwbGFjZShcIllFUlwiLCByZXN1bHRDcm9uLnllYXIpXHJcbiAgICAgICAgICAgICAgICAudHJpbSgpXHJcbiAgICAgICAgKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHN5bnRheFN0cmluZ1xyXG4gICAgICAgICAgICAucmVwbGFjZShcIlNFQ1wiLCByZXN1bHRDcm9uLnNlYylcclxuICAgICAgICAgICAgLnJlcGxhY2UoXCJNSU5cIiwgcmVzdWx0Q3Jvbi5taW4pXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKFwiSE9SXCIsIHJlc3VsdENyb24uaG91cilcclxuICAgICAgICAgICAgLnJlcGxhY2UoXCJET01cIiwgcmVzdWx0Q3Jvbi5kYXlfb2ZfbW9udGgpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKFwiTU9OXCIsIHJlc3VsdENyb24ubW9udGgpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKFwiV0VLXCIsIHJlc3VsdENyb24uZGF5X29mX3dlZWspXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKFwiWUVSXCIsIHJlc3VsdENyb24ueWVhcilcclxuICAgICAgICAgICAgLnRyaW0oKTtcclxuICAgIH1cclxufTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG4vL3JlZ2V4U3RyaW5nIGpzb25cclxudmFyIHJlZ2V4U3RyaW5nID0ge1xyXG4gICAgZXZlcnkgOiB7XHJcbiAgICAgICAgXCJyZWdleHRlc3RcIiA6IFwiXihldmVyeXxlYWNofGFsbHxlbnRpcmUpJFwiXHJcbiAgICB9LFxyXG4gICAgY2xvY2tUaW1lIDoge1xyXG4gICAgICAgIC8vaHR0cHM6Ly9yZWdleHIuY29tLzNxcWJuXHJcbiAgICAgICAgXCJyZWdleHRlc3RcIiA6IFwiXihbMC05XSs6KT9bMC05XSsgKihBTXxQTSkkfF4oWzAtOV0rOlswLTldKykkfChub29ufG1pZG5pZ2h0KVwiLFxyXG4gICAgICAgIC8vaHR0cHM6Ly9yZWdleHIuY29tLzNxcWJ0XHJcbiAgICAgICAgXCJyZWdleGV4ZWNcIiA6IFtcclxuICAgICAgICAgICAgXCJeWzAtOV0rXCIsXHJcbiAgICAgICAgICAgIFwiOlswLTldK1wiLFxyXG4gICAgICAgICAgICBcInBtXCIsXHJcbiAgICAgICAgICAgIFwiYW1cIixcclxuICAgICAgICAgICAgXCIobm9vbnxtaWRuaWdodClcIlxyXG4gICAgICAgIF1cclxuICAgIH0sXHJcbiAgICB5ZWFyIDoge1xyXG4gICAgICAgIFwicmVnZXh0ZXN0XCIgOiBcIigoeWVhcnN8eWVhcil8KFswLTldezR9WzAtOV0qKCggP2FuZCk/LD8gPykpKylcIixcclxuICAgICAgICBcInJlZ2V4ZXhlY1wiIDogW1xyXG4gICAgICAgICAgICBcIl4oeWVhcnN8eWVhcikkXCIsXHJcbiAgICAgICAgICAgIFwiWzAtOV0qXCIsXHJcbiAgICAgICAgICAgIFwiXlswLTldezR9JFwiXHJcbiAgICAgICAgXVxyXG4gICAgfSxcclxuICAgIGZyZXF1ZW5jeVdpdGggOiB7XHJcbiAgICAgICAgXCJyZWdleHRlc3RcIiA6IFwiXlswLTldKyh0aHxuZHxyZHxzdCkkXCJcclxuICAgIH0sXHJcbiAgICBmcmVxdWVuY3lPbmx5IDoge1xyXG4gICAgICAgIFwicmVnZXh0ZXN0XCIgOiBcIl5bMC05XSskXCIsXHJcbiAgICAgICAgXCJyZWdleGV4ZWNcIiA6IFwiXlswLTldK1wiXHJcbiAgICB9LFxyXG4gICAgbWludXRlIDoge1xyXG4gICAgICAgIFwicmVnZXh0ZXN0XCIgOiBcIihtaW51dGVzfG1pbnV0ZXxtaW5zfG1pbilcIixcclxuICAgICAgICBcInJlZ2V4ZXhlY1wiIDogW1xyXG4gICAgICAgICAgICBcIl4obWludXRlc3xtaW51dGV8bWluc3xtaW4pJFwiXHJcbiAgICAgICAgXVxyXG4gICAgfSxcclxuICAgIHNlY29uZCA6IHtcclxuICAgICAgICBcInJlZ2V4dGVzdFwiIDogXCIoc2Vjb25kc3xzZWNvbmR8c2Vjc3xzZWMpXCIsXHJcbiAgICAgICAgXCJyZWdleGV4ZWNcIiA6IFtcclxuICAgICAgICAgICAgXCJeKHNlY29uZHN8c2Vjb25kfHNlY3N8c2VjKSRcIlxyXG4gICAgICAgIF1cclxuICAgIH0sXHJcbiAgICBob3VyIDoge1xyXG4gICAgICAgIFwicmVnZXh0ZXN0XCIgOiBcIihob3VyfGhyc3xob3VycylcIixcclxuICAgICAgICBcInJlZ2V4ZXhlY1wiIDogW1xyXG4gICAgICAgICAgICBcIl4oaG91cnxocnN8aG91cnMpJFwiXHJcbiAgICAgICAgXVxyXG4gICAgfSxcclxuICAgIGRheSA6IHtcclxuICAgICAgICAvL2h0dHBzOi8vcmVnZXhyLmNvbS8zcXFjM1xyXG4gICAgICAgIFwicmVnZXh0ZXN0XCIgOiBcIl4oKGRheXN8ZGF5KXwoKChtb25kYXl8dHVlc2RheXx3ZWRuZXNkYXl8dGh1cnNkYXl8ZnJpZGF5fHNhdHVyZGF5fHN1bmRheXxXRUVLRU5EfE1PTnxUVUV8V0VEfFRIVXxGUkl8U0FUfFNVTikoID9hbmQpPyw/ID8pKykpJFwiLFxyXG4gICAgICAgIFwicmVnZXhleGVjXCIgOiBbXHJcbiAgICAgICAgICAgIFwiXihkYXl8ZGF5cykkXCIsXHJcbiAgICAgICAgICAgIFwiKE1PTnxUVUV8V0VEfFRIVXxGUkl8U0FUfFNVTnxXRUVLRU5EKVwiXHJcbiAgICAgICAgXVxyXG4gICAgfSxcclxuICAgIG1vbnRoIDoge1xyXG4gICAgICAgIC8vaHR0cHM6Ly9yZWdleHIuY29tLzNyMW5hXHJcbiAgICAgICAgXCJyZWdleHRlc3RcIiA6IFwiXigobW9udGhzfG1vbnRoKXwoKChqYW51YXJ5fGZlYnJ1YXJ5fG1hcmNofGFwcmlsfG1heXxqdW5lfGp1bHl8YXVndXN0fHNlcHRlbWJlcnxvY3RvYmVyfG5vdmVtYmVyfGRlY2VtYmVyfEpBTnxGRUJ8TUFSfEFQUnxNQVl8SlVOfEpVTHxBVUd8U0VQVHxPQ1R8Tk9WfERFQykoID9hbmQpPyw/ID8pKykpJFwiLFxyXG4gICAgICAgIFwicmVnZXhleGVjXCIgOiBbXHJcbiAgICAgICAgICAgIFwiXihtb250aHxtb250aHMpJFwiLFxyXG4gICAgICAgICAgICBcIihKQU58RkVCfE1BUnxBUFJ8TUFZfEpVTnxKVUx8QVVHfFNFUFR8T0NUfE5PVnxERUMpXCJcclxuICAgICAgICBdXHJcbiAgICB9LFxyXG4gICAgcmFuZ2VTdGFydCA6IHtcclxuICAgICAgICBcInJlZ2V4dGVzdFwiIDogXCIoYmV0d2VlbnxzdGFydGluZ3xzdGFydClcIiAsXHJcbiAgICB9LFxyXG4gICAgcmFuZ2VFbmQgOiB7XHJcbiAgICAgICAgXCJyZWdleHRlc3RcIiA6IFwiKHRvfHRocm91Z2h8ZW5kaW5nfGVuZHxhbmQpXCIgLFxyXG4gICAgfSxcclxuICAgIHRva2VuaXNpbmcgOiB7XHJcbiAgICAgICAgXCJyZWdleGV4ZWNcIiA6IFwiKGhvdXJ8aHJzfGhvdXJzKXwobWludXRlc3xtaW51dGV8bWluc3xtaW4pfChzZWNvbmRzfHNlY29uZHxzZWNzfHNlYyl8KChtb250aHN8bW9udGgpfCgoKGphbnVhcnl8ZmVicnVhcnl8bWFyY2h8YXByaWx8bWF5fGp1bmV8anVseXxhdWd1c3R8c2VwdGVtYmVyfG9jdG9iZXJ8bm92ZW1iZXJ8ZGVjZW1iZXJ8SkFOfEZFQnxNQVJ8QVBSfE1BWXxKVU58SlVMfEFVR3xTRVBUfE9DVHxOT1Z8REVDKSggP2FuZCk/LD8gPykrKSl8WzAtOV0rKHRofG5kfHJkfHN0KXwoKFswLTldKzopP1swLTldKyggKyk/KEFNfFBNKSl8KFswLTldKzpbMC05XSspfChub29ufG1pZG5pZ2h0KXwoKGRheXN8ZGF5KXwoKChtb25kYXl8dHVlc2RheXx3ZWRuZXNkYXl8dGh1cnNkYXl8ZnJpZGF5fHNhdHVyZGF5fHN1bmRheXxXRUVLRU5EfE1PTnxUVUV8V0VEfFRIVXxGUkl8U0FUfFNVTikoID9hbmQpPyw/ID8pKykpfCgoWzAtOV17NH1bMC05XSooKCA/YW5kKT8sPyA/KSkrKXwoWzAtOV0rKXwodG98dGhyb3VnaHxlbmRpbmd8ZW5kfGFuZCl8KGJldHdlZW58c3RhcnRpbmd8c3RhcnQpXCJcclxuICAgIH1cclxufVxyXG5cclxudmFyIGRlZmF1bHRGbGFncyA9IHtcclxuICAgIFwiaXNSYW5nZUZvckRheVwiIDogZmFsc2UsXHJcbiAgICBcImlzUmFuZ2VGb3JNb250aFwiIDogZmFsc2UsXHJcbiAgICBcImlzUmFuZ2VGb3JZZWFyXCIgOiBmYWxzZSxcclxuICAgIFwiaXNSYW5nZUZvckhvdXJcIiA6IGZhbHNlLFxyXG4gICAgXCJpc1JhbmdlRm9yTWluXCIgOiBmYWxzZSxcclxuICAgIFwiaXNSYW5nZUZvclNlY1wiIDogZmFsc2UsXHJcbn07XHJcblxyXG52YXIgZGVmYXVsdFJlc3VsdENyb24gPSB7XHJcbiAgICBcInNlY1wiIDogXCIqXCIsXHJcbiAgICBcIm1pblwiIDogXCIqXCIsXHJcbiAgICBcImhvdXJcIiA6IFwiKlwiLFxyXG4gICAgXCJkYXlfb2ZfbW9udGhcIiA6IFwiKlwiLFxyXG4gICAgXCJtb250aFwiIDogXCIqXCIsXHJcbiAgICBcImRheV9vZl93ZWVrXCIgOiBcIj9cIixcclxuICAgIFwieWVhclwiIDogXCIqXCJcclxufTtcclxuXHJcbnZhciBmbGFncyA9IHtcclxuICAgIFwiaXNSYW5nZUZvckRheVwiIDogZGVmYXVsdEZsYWdzLmlzUmFuZ2VGb3JEYXksXHJcbiAgICBcImlzUmFuZ2VGb3JNb250aFwiIDogZGVmYXVsdEZsYWdzLmlzUmFuZ2VGb3JNb250aCxcclxuICAgIFwiaXNSYW5nZUZvclllYXJcIiA6IGRlZmF1bHRGbGFncy5pc1JhbmdlRm9yWWVhcixcclxuICAgIFwiaXNSYW5nZUZvckhvdXJcIiA6IGRlZmF1bHRGbGFncy5pc1JhbmdlRm9ySG91cixcclxuICAgIFwiaXNSYW5nZUZvck1pblwiIDogZGVmYXVsdEZsYWdzLmlzUmFuZ2VGb3JNaW4sXHJcbiAgICBcImlzUmFuZ2VGb3JTZWNcIiA6IGRlZmF1bHRGbGFncy5pc1JhbmdlRm9yU2VjLFxyXG59O1xyXG5cclxudmFyIHJlc3VsdENyb24gPSB7XHJcbiAgICBcInNlY1wiIDogZGVmYXVsdFJlc3VsdENyb24uc2VjLFxyXG4gICAgXCJtaW5cIiA6IGRlZmF1bHRSZXN1bHRDcm9uLm1pbixcclxuICAgIFwiaG91clwiIDogZGVmYXVsdFJlc3VsdENyb24uaG91cixcclxuICAgIFwiZGF5X29mX21vbnRoXCIgOiBkZWZhdWx0UmVzdWx0Q3Jvbi5kYXlfb2ZfbW9udGgsXHJcbiAgICBcIm1vbnRoXCIgOiBkZWZhdWx0UmVzdWx0Q3Jvbi5tb250aCxcclxuICAgIFwiZGF5X29mX3dlZWtcIiA6IGRlZmF1bHRSZXN1bHRDcm9uLmRheV9vZl93ZWVrLFxyXG4gICAgXCJ5ZWFyXCIgOiBkZWZhdWx0UmVzdWx0Q3Jvbi55ZWFyXHJcbn07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICByZWdleFN0cmluZyxcclxuICAgIGRlZmF1bHRGbGFncyxcclxuICAgIGRlZmF1bHRSZXN1bHRDcm9uLFxyXG4gICAgZmxhZ3MsXHJcbiAgICByZXN1bHRDcm9uXHJcbn1cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5jb25zdCByZWdleFN0cmluZyA9IHJlcXVpcmUoXCIuLi9tYXBzXCIpLnJlZ2V4U3RyaW5nO1xyXG52YXIgZmxhZ3MgPSByZXF1aXJlKFwiLi4vbWFwc1wiKS5mbGFncztcclxudmFyIHJlc3VsdENyb24gPSByZXF1aXJlKFwiLi4vbWFwc1wiKS5yZXN1bHRDcm9uO1xyXG5cclxuLypjbG9ja1RpbWUgZnVuY3Rpb24gdG8gcGFyc2UgYW5kIHN0b3JlIGZyZXF1ZW5jeSB2YWx1ZSB3aXRob3V0IG50aCovXHJcbmZ1bmN0aW9uIGdldENsb2NrVGltZSh0b2tlbiwgc3RhY2ssIGVycm9yKSB7XHJcbiAgICAvL3JldHJpdmUgaG91cnMgZnJvbSBjbG9ja3RpbWVcclxuICAgIGxldCByZWdCdWlsZGVyID0gbmV3IFJlZ0V4cChyZWdleFN0cmluZy5jbG9ja1RpbWUucmVnZXhleGVjWzBdKTtcclxuICAgIGxldCBzdHIgPSB0b2tlbi5tYXRjaChyZWdCdWlsZGVyKTtcclxuXHJcbiAgICBsZXQgaG91ciwgbWluO1xyXG4gICAgaWYgKHN0ciAhPSBudWxsICYmIHN0ci5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgaG91ciA9IHBhcnNlSW50KHN0clswXSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGhvdXIgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8vcmV0cml2ZSBtaW51dGVzIGZyb20gY2xvY2tUaW1lXHJcbiAgICByZWdCdWlsZGVyID0gbmV3IFJlZ0V4cChyZWdleFN0cmluZy5jbG9ja1RpbWUucmVnZXhleGVjWzFdKTtcclxuICAgIHN0ciA9IHJlZ0J1aWxkZXIuZXhlYyh0b2tlbik7XHJcbiAgICBpZiAoc3RyICE9IG51bGwgJiYgc3RyLmxlbmd0aCA+IDApIHtcclxuICAgICAgICBpZiAoc3RyWzBdLmluZGV4T2YoXCI6XCIpICE9IC0xKSB7XHJcbiAgICAgICAgICAgIG1pbiA9IHBhcnNlSW50KHN0clswXS5zbGljZShzdHJbMF0uaW5kZXhPZihcIjpcIikgKyAxKSk7XHJcbiAgICAgICAgICAgIGlmIChtaW4gPj0gNjApIHtcclxuICAgICAgICAgICAgICAgIGVycm9yICs9IFwiIHBsZWFzZSBlbnRlciBjb3JyZWN0IG1pbnV0ZXMgIVwiO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbWluID0gMDtcclxuICAgICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIG1pbiA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgLy9jaGVjayBmb3IgaW5jcmVtZW50IG9mIGhvdXIgYnkgMTIgZm9yIFBNXHJcbiAgICBsZXQgcmVnQnVpbGRlclBNID0gbmV3IFJlZ0V4cChyZWdleFN0cmluZy5jbG9ja1RpbWUucmVnZXhleGVjWzJdLCBcImlnXCIpO1xyXG4gICAgbGV0IHJlZ0J1aWxkZXJBTSA9IG5ldyBSZWdFeHAocmVnZXhTdHJpbmcuY2xvY2tUaW1lLnJlZ2V4ZXhlY1szXSwgXCJpZ1wiKTtcclxuICAgIGlmIChyZWdCdWlsZGVyUE0udGVzdCh0b2tlbikpIHtcclxuICAgICAgICBpZiAoaG91ciA8IDEyKSB7XHJcbiAgICAgICAgICAgIGhvdXIgKz0gMTI7XHJcbiAgICAgICAgfSBlbHNlIGlmIChob3VyID4gMTIpIHtcclxuICAgICAgICAgICAgZXJyb3IgKz0gXCIgcGxlYXNlIGNvcnJlY3QgdGhlIHRpbWUgYmVmb3JlIFBNICFcIjtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAocmVnQnVpbGRlckFNLnRlc3QodG9rZW4pKSB7XHJcbiAgICAgICAgaWYgKGhvdXIgPT0gMTIpIHtcclxuICAgICAgICAgICAgaG91ciA9IDA7XHJcbiAgICAgICAgfSBlbHNlIGlmIChob3VyID4gMTIpIHtcclxuICAgICAgICAgICAgZXJyb3IgKz0gXCIgcGxlYXNlIGNvcnJlY3QgdGhlIHRpbWUgYmVmb3JlIEFNICFcIjtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZWdCdWlsZGVyID0gbmV3IFJlZ0V4cChyZWdleFN0cmluZy5jbG9ja1RpbWUucmVnZXhleGVjWzRdLCBcImlnXCIpO1xyXG4gICAgaWYgKHJlZ0J1aWxkZXIudGVzdCh0b2tlbikpIHtcclxuICAgICAgICBzdHIgPSB0b2tlbi5tYXRjaChyZWdCdWlsZGVyKTtcclxuICAgICAgICBpZiAoc3RyID09IFwibm9vblwiKSB7XHJcbiAgICAgICAgICAgIGhvdXIgPSAxMjtcclxuICAgICAgICAgICAgbWluID0gMDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBob3VyID0gMDtcclxuICAgICAgICAgICAgbWluID0gMDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVE8gRE86IGNoZWNrZWQ9PlRlc3Q9PT9cclxuICAgIGxldCB0b3BFbGVtZW50ID0gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XHJcbiAgICBpZiAodG9wRWxlbWVudCAhPSBudWxsKSB7XHJcbiAgICAgICAgLy9DaGVjayBpZiBhbHJlYWR5IGEgcmFuZ2UgaXMgZGVmaW5lZFxyXG4gICAgICAgIGlmIChmbGFncy5pc1JhbmdlRm9ySG91ciA9PSB0cnVlIHx8IGZsYWdzLmlzUmFuZ2VGb3JNaW4gPT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBlcnJvciArPVxyXG4gICAgICAgICAgICAgICAgXCIgYWxyZWFkeSBzZXQgZm9yIHJhbmdlIGV4cHJlc3Npb25zLCBzZXBlcmF0ZSBpbnRvIHR3byBjcm9ucyFcIjtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRvcEVsZW1lbnQub3duZXJTdGF0ZSA9PSBcInJhbmdlU3RhcnRcIikge1xyXG4gICAgICAgICAgICB0b3BFbGVtZW50LmhvdXIuc3RhcnQgPSBob3VyO1xyXG4gICAgICAgICAgICB0b3BFbGVtZW50Lm1pbi5zdGFydCA9IG1pbjtcclxuICAgICAgICAgICAgc3RhY2sucG9wKCk7XHJcbiAgICAgICAgICAgIHN0YWNrLnB1c2godG9wRWxlbWVudCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodG9wRWxlbWVudC5vd25lclN0YXRlID09IFwicmFuZ2VFbmRcIikge1xyXG4gICAgICAgICAgICBpZiAodG9wRWxlbWVudC5ob3VyID09IGhvdXIpIHtcclxuICAgICAgICAgICAgICAgIHRvcEVsZW1lbnQubWluLmVuZCA9IG1pbjtcclxuICAgICAgICAgICAgICAgIHJlc3VsdENyb24ubWluID1cclxuICAgICAgICAgICAgICAgICAgICB0b3BFbGVtZW50Lm1pbi5zdGFydCArIFwiLVwiICsgdG9wRWxlbWVudC5taW4uZW5kO1xyXG4gICAgICAgICAgICAgICAgLy9mbGFncy5pc1JhbmdlRm9ySG91ciA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRvcEVsZW1lbnQuaG91ci5lbmQgPSBob3VyO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0Q3Jvbi5ob3VyID1cclxuICAgICAgICAgICAgICAgICAgICB0b3BFbGVtZW50LmhvdXIuc3RhcnQgKyBcIi1cIiArIHRvcEVsZW1lbnQuaG91ci5lbmQ7XHJcbiAgICAgICAgICAgICAgICAvL2ZsYWdzLmlzUmFuZ2VGb3JNaW4gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3RhY2sucG9wKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBsZXQgc3RhY2tFbGVtZW50ID0ge1xyXG4gICAgICAgIG93bmVyU3RhdGU6IFwiY2xvY2tUaW1lXCIsXHJcbiAgICAgICAgaG91cjogaG91cixcclxuICAgICAgICBtaW46IG1pbixcclxuICAgICAgICBzZWM6IDAsXHJcbiAgICB9O1xyXG4gICAgcmVzdWx0Q3Jvbi5taW4gPSBtaW47XHJcbiAgICBpZiAocmVzdWx0Q3Jvbi5ob3VyICE9IFwiKlwiICYmIHJlc3VsdENyb24uaG91ciAhPSBcIlwiKVxyXG4gICAgICAgIHJlc3VsdENyb24uaG91ciArPSBcIixcIiArIGhvdXI7XHJcbiAgICBlbHNlIHJlc3VsdENyb24uaG91ciA9IGhvdXI7XHJcbiAgICBzdGFjay5wdXNoKHN0YWNrRWxlbWVudCk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBnZXRDbG9ja1RpbWUsXHJcbn07XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IHJlZ2V4U3RyaW5nID0gcmVxdWlyZSgnLi4vbWFwcycpLnJlZ2V4U3RyaW5nO1xyXG52YXIgZmxhZ3MgPSByZXF1aXJlKCcuLi9tYXBzJykuZmxhZ3M7XHJcbnZhciByZXN1bHRDcm9uID0gcmVxdWlyZSgnLi4vbWFwcycpLnJlc3VsdENyb247XHJcblxyXG4vKmdldERheSBmdW5jdGlvbiB0byBwYXJzZSBkYXlzKi9cclxuZnVuY3Rpb24gZ2V0RGF5KHRva2VuLHN0YWNrLGVycm9yKSB7XHJcbiAgICAvLyBUTyBETzogY2hlY2sgZm9yIGdyb3VwXHJcbiAgICBsZXQgcmVnQnVpbGRlciA9IG5ldyBSZWdFeHAocmVnZXhTdHJpbmcuZGF5LnJlZ2V4ZXhlY1swXSxcImlnXCIpO1xyXG4gICAgbGV0IHZhbHVlID0gXCJcIjtcclxuICAgIC8vIGNoZWNrIGZvciB3b3JkIGRheSxkYXlzXHJcbiAgICBpZihyZWdCdWlsZGVyLnRlc3QodG9rZW4pKSB7XHJcbiAgICAgICAgbGV0IHRvcEVsZW1lbnQgPSBzdGFja1tzdGFjay5sZW5ndGgtMV07XHJcbiAgICAgICAgcmVzdWx0Q3Jvbi5kYXlfb2Zfd2VlayA9IFwiP1wiO1xyXG4gICAgICAgIGlmKHRvcEVsZW1lbnQgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0b3BFbGVtZW50ID0ge1xyXG4gICAgICAgICAgICAgICAgJ2ZyZXF1ZW5jeScgOiBcIipcIlxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZWxzZSBpZih0b3BFbGVtZW50Lm93bmVyU3RhdGUgPT0gXCJmcmVxdWVuY3lPbmx5XCIpIHtcclxuICAgICAgICAgICAgcmVzdWx0Q3Jvbi5kYXlfb2ZfbW9udGggPSBcIjAvXCIrdG9wRWxlbWVudC5mcmVxdWVuY3k7XHJcbiAgICAgICAgICAgIHN0YWNrLnBvcCgpO1xyXG4gICAgICAgIH0gZWxzZSBpZih0b3BFbGVtZW50Lm93bmVyU3RhdGUgPT0gXCJmcmVxdWVuY3lXaXRoXCIpIHtcclxuICAgICAgICAgICAgcmVzdWx0Q3Jvbi5kYXlfb2ZfbW9udGggPSBcIlwiK3RvcEVsZW1lbnQuZnJlcXVlbmN5O1xyXG4gICAgICAgICAgICBzdGFjay5wb3AoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXN1bHRDcm9uLmRheV9vZl9tb250aCA9IFwiKlwiO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIGNoZWNrIGZvciB2YWx1ZXMgb2YgZGF5cyBiZXR3ZWVuIFtNT04tU1VOXVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmVnQnVpbGRlciA9IG5ldyBSZWdFeHAocmVnZXhTdHJpbmcuZGF5LnJlZ2V4ZXhlY1sxXSxcImlnXCIpO1xyXG4gICAgICAgIGxldCBtYXRjaGVzID0gdG9rZW4ubWF0Y2gocmVnQnVpbGRlcik7XHJcbiAgICAgICAgaWYobWF0Y2hlcyE9bnVsbCAmJiBtYXRjaGVzLmxlbmd0aCAhPSAwKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdENyb24uZGF5X29mX3dlZWsgPSBcIlwiO1xyXG4gICAgICAgICAgICBmb3IobGV0IGk9MDsgaTxtYXRjaGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBtYXRjaGVzW2ldID0gbWF0Y2hlc1tpXS50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIFRPIERPOiBjaGVja1xyXG4gICAgICAgICAgICBsZXQgdG9wRWxlbWVudCA9IHN0YWNrW3N0YWNrLmxlbmd0aC0xXTtcclxuICAgICAgICAgICAgaWYobWF0Y2hlcy5sZW5ndGggPT0gMSAmJiB0b3BFbGVtZW50ICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIC8vQ2hlY2sgaWYgYWxyZWFkeSBhIHJhbmdlIGlzIGRlZmluZWRcclxuICAgICAgICAgICAgICAgIGlmKGZsYWdzLmlzUmFuZ2VGb3JEYXkgPT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVycm9yICs9XCIgYWxyZWFkeSBzZXQgZm9yIHJhbmdlIGV4cHJlc3Npb25zLCBzZXBlcmF0ZSBpbnRvIHR3byBjcm9ucyFcIjtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBzdGFjay5wb3AoKTtcclxuICAgICAgICAgICAgICAgIGlmKHRvcEVsZW1lbnQub3duZXJTdGF0ZSA9PSBcInJhbmdlU3RhcnRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRvcEVsZW1lbnQuZGF5LnN0YXJ0ID0gbWF0Y2hlc1swXTtcclxuICAgICAgICAgICAgICAgICAgICBzdGFjay5wdXNoKHRvcEVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKHRvcEVsZW1lbnQub3duZXJTdGF0ZSA9PSBcInJhbmdlRW5kXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0b3BFbGVtZW50LmRheS5lbmQgPSBtYXRjaGVzWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdENyb24uZGF5X29mX3dlZWsgPSB0b3BFbGVtZW50LmRheS5zdGFydCArIFwiLVwiK3RvcEVsZW1lbnQuZGF5LmVuZDtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRDcm9uLmRheV9vZl9tb250aCA9IFwiP1wiO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZmxhZ3MuaXNSYW5nZUZvckRheSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYobWF0Y2hlcy5pbmNsdWRlcygnTU9OJykgJiYgIXJlc3VsdENyb24uZGF5X29mX3dlZWsuaW5jbHVkZXMoJ01PTicpKVxyXG4gICAgICAgICAgICAgICAgcmVzdWx0Q3Jvbi5kYXlfb2Zfd2VlayArPSBcIk1PTixcIjtcclxuICAgICAgICAgICAgaWYobWF0Y2hlcy5pbmNsdWRlcygnVFVFJykgJiYgIXJlc3VsdENyb24uZGF5X29mX3dlZWsuaW5jbHVkZXMoJ1RVRScpKVxyXG4gICAgICAgICAgICAgICAgcmVzdWx0Q3Jvbi5kYXlfb2Zfd2VlayArPSBcIlRVRSxcIjtcclxuICAgICAgICAgICAgaWYobWF0Y2hlcy5pbmNsdWRlcygnV0VEJykgJiYgIXJlc3VsdENyb24uZGF5X29mX3dlZWsuaW5jbHVkZXMoJ1dFRCcpKVxyXG4gICAgICAgICAgICAgICAgcmVzdWx0Q3Jvbi5kYXlfb2Zfd2VlayArPSBcIldFRCxcIjtcclxuICAgICAgICAgICAgaWYobWF0Y2hlcy5pbmNsdWRlcygnVEhVJykgJiYgIXJlc3VsdENyb24uZGF5X29mX3dlZWsuaW5jbHVkZXMoJ1RIVScpKVxyXG4gICAgICAgICAgICAgICAgcmVzdWx0Q3Jvbi5kYXlfb2Zfd2VlayArPSBcIlRIVSxcIjtcclxuICAgICAgICAgICAgaWYobWF0Y2hlcy5pbmNsdWRlcygnRlJJJykgJiYgIXJlc3VsdENyb24uZGF5X29mX3dlZWsuaW5jbHVkZXMoJ0ZSSScpKVxyXG4gICAgICAgICAgICAgICAgcmVzdWx0Q3Jvbi5kYXlfb2Zfd2VlayArPSBcIkZSSSxcIjtcclxuICAgICAgICAgICAgaWYobWF0Y2hlcy5pbmNsdWRlcygnU0FUJykgJiYgIXJlc3VsdENyb24uZGF5X29mX3dlZWsuaW5jbHVkZXMoJ1NBVCcpKVxyXG4gICAgICAgICAgICAgICAgcmVzdWx0Q3Jvbi5kYXlfb2Zfd2VlayArPSBcIlNBVCxcIjtcclxuICAgICAgICAgICAgaWYobWF0Y2hlcy5pbmNsdWRlcygnU1VOJykgJiYgIXJlc3VsdENyb24uZGF5X29mX3dlZWsuaW5jbHVkZXMoJ1NVTicpKVxyXG4gICAgICAgICAgICAgICAgcmVzdWx0Q3Jvbi5kYXlfb2Zfd2VlayArPSBcIlNVTixcIjtcclxuICAgICAgICAgICAgaWYobWF0Y2hlcy5pbmNsdWRlcygnV0VFS0VORCcpICYmICFyZXN1bHRDcm9uLmRheV9vZl93ZWVrLmluY2x1ZGVzKCdTQVQnKSlcclxuICAgICAgICAgICAgICAgIHJlc3VsdENyb24uZGF5X29mX3dlZWsgKz0gXCJTQVQsXCI7XHJcbiAgICAgICAgICAgIGlmKG1hdGNoZXMuaW5jbHVkZXMoJ1dFRUtFTkQnKSAmJiAhcmVzdWx0Q3Jvbi5kYXlfb2Zfd2Vlay5pbmNsdWRlcygnU1VOJykpXHJcbiAgICAgICAgICAgICAgICByZXN1bHRDcm9uLmRheV9vZl93ZWVrICs9IFwiU1VOLFwiO1xyXG4gICAgICAgICAgICAvLyByZW1vdmVkIGV4dHJhIGNvbW1hXHJcbiAgICAgICAgICAgIHJlc3VsdENyb24uZGF5X29mX3dlZWsgPSByZXN1bHRDcm9uLmRheV9vZl93ZWVrLnNsaWNlKDAsLTEpO1xyXG4gICAgICAgICAgICByZXN1bHRDcm9uLmRheV9vZl9tb250aCA9IFwiP1wiO1xyXG4gICAgICAgICAgICB2YWx1ZSA9IFwiXCIrcmVzdWx0Q3Jvbi5kYXlfb2Zfd2VlaztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBUTyBETzogcHJvdmlkZSBpbiBmdXR1cmUuIGJ1dCBmb3IgTk9XICBlcnJvclxyXG4gICAgICAgICAgICBlcnJvciArPVwiIEluIHVucmVzb2x2ZWQgc3RhdGUgYXQgMjtEYXkgIVwiO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgbGV0IHN0YWNrRWxlbWVudCA9IHtcclxuICAgICAgICBcIm93bmVyU3RhdGVcIiA6IFwiZGF5XCIsXHJcbiAgICAgICAgXCJkYXlfb2Zfd2Vla1wiIDogcmVzdWx0Q3Jvbi5kYXlfb2Zfd2VlayxcclxuICAgICAgICBcImRheV9vZl9tb250aFwiIDogcmVzdWx0Q3Jvbi5kYXlfb2ZfbW9udGhcclxuICAgIH07XHJcbiAgICBzdGFjay5wdXNoKHN0YWNrRWxlbWVudCk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBnZXREYXlcclxufTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuY29uc3QgcmVnZXhTdHJpbmcgPSByZXF1aXJlKCcuLi9tYXBzJykucmVnZXhTdHJpbmc7XHJcbnZhciBmbGFncyA9IHJlcXVpcmUoJy4uL21hcHMnKS5mbGFncztcclxudmFyIHJlc3VsdENyb24gPSByZXF1aXJlKCcuLi9tYXBzJykucmVzdWx0Q3JvbjtcclxuXHJcblxyXG4vKmZyZXF1ZW5jeU9ubHkgZnVuY3Rpb24gdG8gcGFyc2UgYW5kIHN0b3JlIGZyZXF1ZW5jeSB2YWx1ZSB3aXRob3V0IG50aCovXHJcbmZ1bmN0aW9uIGdldEZyZXF1ZW5jeU9ubHkodG9rZW4sc3RhY2ssZXJyb3IpIHtcclxuICAgIGxldCBmcmVxID0gcGFyc2VJbnQodG9rZW4pO1xyXG4gICAgaWYoaXNOYU4odG9rZW4pKSB7XHJcbiAgICAgICAgZXJyb3IgKz1cIiB0b2tlbiBpcyBub3QgbnVtYmVyIGluIGZyZXF1ZW5jeSBvbmx5ICFcIjtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBpZihzdGFjay5sZW5ndGggPiAwICYmIHN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdLm93bmVyU3RhdGU9PVwicmFuZ2VFbmRcIikge1xyXG4gICAgICAgIGxldCB0b3BFbGVtZW50ID0gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XHJcbiAgICAgICAgc3RhY2sucG9wKCk7XHJcbiAgICAgICAgdG9wRWxlbWVudC5mcmVxdWVuY3kuZW5kID0gZnJlcTtcclxuICAgICAgICBzdGFjay5wdXNoKHRvcEVsZW1lbnQpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZihzdGFjay5sZW5ndGggPiAwICYmIHN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdLm93bmVyU3RhdGU9PVwicmFuZ2VTdGFydFwiKSB7XHJcbiAgICAgICAgbGV0IHRvcEVsZW1lbnQgPSBzdGFja1tzdGFjay5sZW5ndGggLSAxXTtcclxuICAgICAgICBzdGFjay5wb3AoKTtcclxuICAgICAgICB0b3BFbGVtZW50LmZyZXF1ZW5jeS5zdGFydCA9IGZyZXE7XHJcbiAgICAgICAgc3RhY2sucHVzaCh0b3BFbGVtZW50KTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIGxldCBzdGFja0VsZW1lbnQgPSB7XHJcbiAgICAgICAgXCJvd25lclN0YXRlXCIgOiBcImZyZXF1ZW5jeU9ubHlcIixcclxuICAgICAgICBcImZyZXF1ZW5jeVwiIDogZnJlcVxyXG4gICAgfTtcclxuICAgIHN0YWNrLnB1c2goc3RhY2tFbGVtZW50KTtcclxuICAgIHJldHVybiB0cnVlO1xyXG59XHJcblxyXG4vKmZyZXF1ZW5jeVdpdGggZnVuY3Rpb24gdG8gcGFyc2UgYW5kIHN0b3JlIGZyZXF1ZW5jeSB2YWx1ZSB3aXRoIG50aCovXHJcbmZ1bmN0aW9uIGdldEZyZXF1ZW5jeVdpdGgodG9rZW4sc3RhY2ssZXJyb3IpIHtcclxuICAgIC8vIFRPIERPOiBjaGVjayBmb3IgZ3JvdXBcclxuICAgIGxldCByZWdCdWlsZGVyID0gbmV3IFJlZ0V4cChyZWdleFN0cmluZy5mcmVxdWVuY3lPbmx5LnJlZ2V4ZXhlYyxcImlnXCIpO1xyXG4gICAgbGV0IGZyZXEgPSByZWdCdWlsZGVyLmV4ZWModG9rZW4pO1xyXG4gICAgbGV0IHZhbHVlID0gcGFyc2VJbnQoZnJlcSk7XHJcbiAgICBpZihpc05hTih2YWx1ZSkpIHtcclxuICAgICAgICBlcnJvciArPVwiIHRva2VuIGlzIG5vdCBudW1iZXIgaW4gZnJlcXVlbmN5IHdpdGggIVwiO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGlmKHN0YWNrLmxlbmd0aCE9MCAmJiBzdGFja1tzdGFjay5sZW5ndGggLSAxXS5vd25lclN0YXRlPT1cInJhbmdlRW5kXCIpIHtcclxuICAgICAgICBsZXQgdG9wRWxlbWVudCA9IHN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgIHN0YWNrLnBvcCgpO1xyXG4gICAgICAgIHRvcEVsZW1lbnQuZnJlcXVlbmN5LmVuZCA9IFwiXCIrdmFsdWU7XHJcbiAgICAgICAgc3RhY2sucHVzaCh0b3BFbGVtZW50KTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYoc3RhY2subGVuZ3RoID4gMCAmJiBzdGFja1tzdGFjay5sZW5ndGggLSAxXS5vd25lclN0YXRlPT1cInJhbmdlU3RhcnRcIikge1xyXG4gICAgICAgIGxldCB0b3BFbGVtZW50ID0gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XHJcbiAgICAgICAgc3RhY2sucG9wKCk7XHJcbiAgICAgICAgdG9wRWxlbWVudC5mcmVxdWVuY3kuc3RhcnQgPSBcIlwiK3ZhbHVlO1xyXG4gICAgICAgIHN0YWNrLnB1c2godG9wRWxlbWVudCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBsZXQgc3RhY2tFbGVtZW50ID0ge1xyXG4gICAgICAgIFwib3duZXJTdGF0ZVwiIDogXCJmcmVxdWVuY3lXaXRoXCIsXHJcbiAgICAgICAgXCJmcmVxdWVuY3lcIiA6IHZhbHVlXHJcbiAgICB9O1xyXG4gICAgc3RhY2sucHVzaChzdGFja0VsZW1lbnQpO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIGdldEZyZXF1ZW5jeU9ubHksXHJcbiAgICBnZXRGcmVxdWVuY3lXaXRoXHJcbn07XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IHJlZ2V4U3RyaW5nID0gcmVxdWlyZSgnLi4vbWFwcycpLnJlZ2V4U3RyaW5nO1xyXG52YXIgZmxhZ3MgPSByZXF1aXJlKCcuLi9tYXBzJykuZmxhZ3M7XHJcbnZhciByZXN1bHRDcm9uID0gcmVxdWlyZSgnLi4vbWFwcycpLnJlc3VsdENyb247XHJcblxyXG4vKmdldEhvdXIgZnVuY3Rpb24gdG8gcGFyc2UgSG91cnMqL1xyXG5mdW5jdGlvbiBnZXRIb3VyKHRva2VuLHN0YWNrLGVycm9yKSB7XHJcbiAgICAvLyBUTyBETzogY2hlY2sgZm9yIGdyb3VwXHJcbiAgICBsZXQgcmVnQnVpbGRlciA9IG5ldyBSZWdFeHAocmVnZXhTdHJpbmcuaG91ci5yZWdleGV4ZWNbMF0sXCJpZ1wiKTtcclxuICAgIGxldCB2YWx1ZTtcclxuICAgIC8vIGNoZWNrIGZvciB3b3JkIGhvdXJzXHJcbiAgICBpZihyZWdCdWlsZGVyLnRlc3QodG9rZW4pKSB7XHJcbiAgICAgICAgbGV0IHRvcEVsZW1lbnQgPSBzdGFja1tzdGFjay5sZW5ndGgtMV07XHJcbiAgICAgICAgaWYodG9wRWxlbWVudCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRvcEVsZW1lbnQgPSB7XHJcbiAgICAgICAgICAgICAgICAnZnJlcXVlbmN5JyA6IFwiKlwiXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIGlmKHRvcEVsZW1lbnQub3duZXJTdGF0ZSA9PSBcImZyZXF1ZW5jeU9ubHlcIikge1xyXG4gICAgICAgICAgICB2YWx1ZSA9IHRvcEVsZW1lbnQuZnJlcXVlbmN5O1xyXG4gICAgICAgICAgICByZXN1bHRDcm9uLmhvdXIgPSBcIjAvXCIrdG9wRWxlbWVudC5mcmVxdWVuY3k7XHJcbiAgICAgICAgICAgIHN0YWNrLnBvcCgpO1xyXG4gICAgICAgIH0gZWxzZSBpZih0b3BFbGVtZW50Lm93bmVyU3RhdGUgPT0gXCJmcmVxdWVuY3lXaXRoXCIpIHtcclxuICAgICAgICAgICAgLy9ob3VyIGFscmVhZHkgc2V0XHJcbiAgICAgICAgICAgIGlmKHJlc3VsdENyb24uaG91ciAhPSBcIipcIiAmJiByZXN1bHRDcm9uLmhvdXIgIT0gXCJcIilcclxuICAgICAgICAgICAgICAgIHJlc3VsdENyb24uaG91ciArPSBcIixcIit0b3BFbGVtZW50LmZyZXF1ZW5jeTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgcmVzdWx0Q3Jvbi5ob3VyID0gXCJcIit0b3BFbGVtZW50LmZyZXF1ZW5jeTtcclxuICAgICAgICAgICAgdmFsdWUgPSByZXN1bHRDcm9uLmhvdXI7XHJcbiAgICAgICAgICAgIHN0YWNrLnBvcCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmKGZsYWdzLmlzUmFuZ2VGb3JIb3VyID09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIGVycm9yICs9XCIgYWxyZWFkeSBzZXQgZm9yIHJhbmdlIGV4cHJlc3Npb25zLCBzZXBlcmF0ZSBpbnRvIHR3byBjcm9ucyFcIjtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmKHRvcEVsZW1lbnQub3duZXJTdGF0ZSA9PSBcInJhbmdlU3RhcnRcIikge1xyXG4gICAgICAgICAgICAgICAgdG9wRWxlbWVudC5ob3VyLnN0YXJ0ID0gdG9wRWxlbWVudC5mcmVxdWVuY3kuc3RhcnQ7XHJcbiAgICAgICAgICAgICAgICB0b3BFbGVtZW50LmZyZXF1ZW5jeS5zdGFydCA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICBzdGFjay5wb3AoKTtcclxuICAgICAgICAgICAgICAgIHN0YWNrLnB1c2godG9wRWxlbWVudCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmKHRvcEVsZW1lbnQub3duZXJTdGF0ZSA9PSBcInJhbmdlRW5kXCIpIHtcclxuICAgICAgICAgICAgICAgIHN0YWNrLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgdG9wRWxlbWVudC5ob3VyLnN0YXJ0ID0gdG9wRWxlbWVudC5mcmVxdWVuY3kuc3RhcnQ7XHJcbiAgICAgICAgICAgICAgICB0b3BFbGVtZW50LmhvdXIuZW5kID0gdG9wRWxlbWVudC5mcmVxdWVuY3kuZW5kO1xyXG4gICAgICAgICAgICAgICAgdG9wRWxlbWVudC5mcmVxdWVuY3kuZW5kID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIHJlc3VsdENyb24uaG91ciA9IHRvcEVsZW1lbnQuaG91ci5zdGFydCArIFwiLVwiK3RvcEVsZW1lbnQuaG91ci5lbmQ7XHJcbiAgICAgICAgICAgICAgICAvL2ZsYWdzLmlzUmFuZ2VGb3JIb3VyID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgbGV0IHN0YWNrRWxlbWVudCA9IHtcclxuICAgICAgICBcIm93bmVyU3RhdGVcIiA6IFwiaG91clwiLFxyXG4gICAgICAgIFwiaG91clwiIDogdmFsdWVcclxuICAgIH07XHJcbiAgICBzdGFjay5wdXNoKHN0YWNrRWxlbWVudCk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgZ2V0SG91clxyXG59O1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCByZWdleFN0cmluZyA9IHJlcXVpcmUoJy4uL21hcHMnKS5yZWdleFN0cmluZztcclxudmFyIGZsYWdzID0gcmVxdWlyZSgnLi4vbWFwcycpLmZsYWdzO1xyXG52YXIgcmVzdWx0Q3JvbiA9IHJlcXVpcmUoJy4uL21hcHMnKS5yZXN1bHRDcm9uO1xyXG5cclxuLypnZXRNaW51dGUgZnVuY3Rpb24gdG8gcGFyc2UgbWludXRlcyovXHJcbmZ1bmN0aW9uIGdldE1pbnV0ZSh0b2tlbixzdGFjayxlcnJvcikge1xyXG4gICAgLy8gVE8gRE86IGNoZWNrIGZvciBncm91cFxyXG4gICAgbGV0IHJlZ0J1aWxkZXIgPSBuZXcgUmVnRXhwKHJlZ2V4U3RyaW5nLm1pbnV0ZS5yZWdleGV4ZWNbMF0sXCJpZ1wiKTtcclxuICAgIGxldCB2YWx1ZTtcclxuICAgIC8vIGNoZWNrIGZvciB3b3JkIG1pbnV0ZSxtaW51dGVzXHJcbiAgICBpZihyZWdCdWlsZGVyLnRlc3QodG9rZW4pKSB7XHJcbiAgICAgICAgbGV0IHRvcEVsZW1lbnQgPSBzdGFja1tzdGFjay5sZW5ndGgtMV07XHJcbiAgICAgICAgaWYodG9wRWxlbWVudCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRvcEVsZW1lbnQgPSB7XHJcbiAgICAgICAgICAgICAgICAnZnJlcXVlbmN5JyA6IFwiKlwiXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIGlmKHRvcEVsZW1lbnQub3duZXJTdGF0ZSA9PSBcImZyZXF1ZW5jeU9ubHlcIikge1xyXG4gICAgICAgICAgICB2YWx1ZSA9IHRvcEVsZW1lbnQuZnJlcXVlbmN5O1xyXG4gICAgICAgICAgICByZXN1bHRDcm9uLm1pbiA9IFwiMC9cIit0b3BFbGVtZW50LmZyZXF1ZW5jeTtcclxuICAgICAgICAgICAgc3RhY2sucG9wKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmKHRvcEVsZW1lbnQub3duZXJTdGF0ZSA9PSBcImZyZXF1ZW5jeVdpdGhcIikge1xyXG4gICAgICAgICAgICB2YWx1ZSA9IHRvcEVsZW1lbnQuZnJlcXVlbmN5O1xyXG4gICAgICAgICAgICByZXN1bHRDcm9uLm1pbiA9IFwiXCIrdG9wRWxlbWVudC5mcmVxdWVuY3k7XHJcbiAgICAgICAgICAgIHN0YWNrLnBvcCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmKGZsYWdzLmlzUmFuZ2VGb3JNaW51dGUgPT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgZXJyb3IgKz1cIiBhbHJlYWR5IHNldCBmb3IgcmFuZ2UgZXhwcmVzc2lvbnMsIHNlcGVyYXRlIGludG8gdHdvIGNyb25zIVwiO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYodG9wRWxlbWVudC5vd25lclN0YXRlID09IFwicmFuZ2VTdGFydFwiKSB7XHJcbiAgICAgICAgICAgICAgICB0b3BFbGVtZW50Lm1pbi5zdGFydCA9IHRvcEVsZW1lbnQuZnJlcXVlbmN5LnN0YXJ0O1xyXG4gICAgICAgICAgICAgICAgdG9wRWxlbWVudC5mcmVxdWVuY3kuc3RhcnQgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgc3RhY2sucG9wKCk7XHJcbiAgICAgICAgICAgICAgICBzdGFjay5wdXNoKHRvcEVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZih0b3BFbGVtZW50Lm93bmVyU3RhdGUgPT0gXCJyYW5nZUVuZFwiKSB7XHJcbiAgICAgICAgICAgICAgICBzdGFjay5wb3AoKTtcclxuICAgICAgICAgICAgICAgIHRvcEVsZW1lbnQubWluLnN0YXJ0ID0gdG9wRWxlbWVudC5mcmVxdWVuY3kuc3RhcnQ7XHJcbiAgICAgICAgICAgICAgICB0b3BFbGVtZW50Lm1pbi5lbmQgPSB0b3BFbGVtZW50LmZyZXF1ZW5jeS5lbmQ7XHJcbiAgICAgICAgICAgICAgICB0b3BFbGVtZW50LmZyZXF1ZW5jeS5lbmQgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0Q3Jvbi5taW4gPSB0b3BFbGVtZW50Lm1pbi5zdGFydCArIFwiLVwiK3RvcEVsZW1lbnQubWluLmVuZDtcclxuICAgICAgICAgICAgICAgIC8vZmxhZ3MuaXNSYW5nZUZvck1pbiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGxldCBzdGFja0VsZW1lbnQgPSB7XHJcbiAgICAgICAgXCJvd25lclN0YXRlXCIgOiBcIm1pbnV0ZVwiLFxyXG4gICAgICAgIFwibWluXCIgOiB2YWx1ZVxyXG4gICAgfTtcclxuICAgIHN0YWNrLnB1c2goc3RhY2tFbGVtZW50KTtcclxuICAgIHJldHVybiB0cnVlO1xyXG59XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBnZXRNaW51dGVcclxufTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuY29uc3QgcmVnZXhTdHJpbmcgPSByZXF1aXJlKCcuLi9tYXBzJykucmVnZXhTdHJpbmc7XHJcbnZhciBmbGFncyA9IHJlcXVpcmUoJy4uL21hcHMnKS5mbGFncztcclxudmFyIHJlc3VsdENyb24gPSByZXF1aXJlKCcuLi9tYXBzJykucmVzdWx0Q3JvbjtcclxuXHJcbi8qZ2V0TW9udGggZnVuY3Rpb24gdG8gcGFyc2UgbW9udGhzKi9cclxuZnVuY3Rpb24gZ2V0TW9udGgodG9rZW4sc3RhY2ssZXJyb3IpIHtcclxuICAgIC8vIFRPIERPOiBjaGVjayBmb3IgZ3JvdXBcclxuICAgIGxldCByZWdCdWlsZGVyID0gbmV3IFJlZ0V4cChyZWdleFN0cmluZy5tb250aC5yZWdleGV4ZWNbMF0sXCJpZ1wiKTtcclxuICAgIGxldCB2YWx1ZSA9IFwiXCI7XHJcbiAgICAvLyBjaGVjayBmb3Igd29yZCBtb250aCxtb250aHNcclxuICAgIGlmKHJlZ0J1aWxkZXIudGVzdCh0b2tlbikpIHtcclxuICAgICAgICBsZXQgdG9wRWxlbWVudCA9IHN0YWNrW3N0YWNrLmxlbmd0aC0xXTtcclxuICAgICAgICBpZih0b3BFbGVtZW50ID09IG51bGwpIHtcclxuICAgICAgICAgICAgdG9wRWxlbWVudCA9IHtcclxuICAgICAgICAgICAgICAgICdmcmVxdWVuY3knIDogXCIqXCJcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodG9wRWxlbWVudC5vd25lclN0YXRlID09IFwiZnJlcXVlbmN5T25seVwiKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdENyb24ubW9udGggPSBcIjAvXCIrdG9wRWxlbWVudC5mcmVxdWVuY3k7XHJcbiAgICAgICAgICAgIHN0YWNrLnBvcCgpO1xyXG4gICAgICAgIH0gZWxzZSBpZih0b3BFbGVtZW50Lm93bmVyU3RhdGUgPT0gXCJmcmVxdWVuY3lXaXRoXCIpIHtcclxuICAgICAgICAgICAgcmVzdWx0Q3Jvbi5tb250aCA9IFwiXCIrdG9wRWxlbWVudC5mcmVxdWVuY3k7XHJcbiAgICAgICAgICAgIHN0YWNrLnBvcCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJlc3VsdENyb24ubW9udGggPSBcIipcIjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBjaGVjayBmb3IgdmFsdWVzIG9mIG1vbnRocyBiZXR3ZWVuIFtKQU4tREVDXVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgLy8gVE8gRE86IGNoZWNrIGZvciBncm91cFxyXG4gICAgICAgIHJlZ0J1aWxkZXIgPSBuZXcgUmVnRXhwKHJlZ2V4U3RyaW5nLm1vbnRoLnJlZ2V4ZXhlY1sxXSxcImlnXCIpO1xyXG4gICAgICAgIGxldCBtYXRjaGVzID0gdG9rZW4ubWF0Y2gocmVnQnVpbGRlcik7XHJcbiAgICAgICAgaWYobWF0Y2hlcyE9bnVsbCAmJiBtYXRjaGVzLmxlbmd0aCAhPSAwKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdENyb24ubW9udGggPSBcIlwiO1xyXG4gICAgICAgICAgICBmb3IobGV0IGk9MDsgaTxtYXRjaGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBtYXRjaGVzW2ldID0gbWF0Y2hlc1tpXS50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIFRPIERPOiBjaGVja1xyXG4gICAgICAgICAgICBsZXQgdG9wRWxlbWVudCA9IHN0YWNrW3N0YWNrLmxlbmd0aC0xXTtcclxuXHJcbiAgICAgICAgICAgIGlmKG1hdGNoZXMubGVuZ3RoID09IDEgJiYgdG9wRWxlbWVudCAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAvL0NoZWNrIGlmIGFscmVhZHkgYSByYW5nZSBpcyBkZWZpbmVkXHJcbiAgICAgICAgICAgICAgICBpZihmbGFncy5pc1JhbmdlRm9yTW9udGggPT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVycm9yICs9XCIgYWxyZWFkeSBzZXQgZm9yIHJhbmdlIGV4cHJlc3Npb25zLCBzZXBlcmF0ZSBpbnRvIHR3byBjcm9ucyFcIjtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBzdGFjay5wb3AoKTtcclxuICAgICAgICAgICAgICAgIGlmKHRvcEVsZW1lbnQub3duZXJTdGF0ZSA9PSBcImZyZXF1ZW5jeU9ubHlcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdENyb24uZGF5X29mX21vbnRoID0gdG9wRWxlbWVudC5mcmVxdWVuY3k7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYodG9wRWxlbWVudC5vd25lclN0YXRlID09IFwiZnJlcXVlbmN5V2l0aFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0Q3Jvbi5kYXlfb2ZfbW9udGggPSB0b3BFbGVtZW50LmZyZXF1ZW5jeTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZih0b3BFbGVtZW50Lm93bmVyU3RhdGUgPT0gXCJyYW5nZVN0YXJ0XCIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0b3BFbGVtZW50Lm1vbnRoLnN0YXJ0ID0gbWF0Y2hlc1swXTtcclxuICAgICAgICAgICAgICAgICAgICBzdGFjay5wdXNoKHRvcEVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKHRvcEVsZW1lbnQub3duZXJTdGF0ZSA9PSBcInJhbmdlRW5kXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZih0b3BFbGVtZW50LmZyZXF1ZW5jeS5lbmQgIT0gXCJcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRDcm9uLmRheV9vZl93ZWVrID0gXCI/XCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdENyb24uZGF5X29mX21vbnRoID0gdG9wRWxlbWVudC5mcmVxdWVuY3kuc3RhcnQgKyBcIi1cIiArIHRvcEVsZW1lbnQuZnJlcXVlbmN5LmVuZDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdG9wRWxlbWVudC5tb250aC5lbmQgPSBtYXRjaGVzWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdENyb24ubW9udGggPSB0b3BFbGVtZW50Lm1vbnRoLnN0YXJ0ICsgXCItXCIrdG9wRWxlbWVudC5tb250aC5lbmQ7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9mbGFncy5pc1JhbmdlRm9yTW9udGggPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKG1hdGNoZXMuaW5jbHVkZXMoJ0pBTicpICYmICFyZXN1bHRDcm9uLm1vbnRoLmluY2x1ZGVzKCdKQU4nKSlcclxuICAgICAgICAgICAgICAgIHJlc3VsdENyb24ubW9udGggKz0gXCJKQU4sXCI7XHJcbiAgICAgICAgICAgIGlmKG1hdGNoZXMuaW5jbHVkZXMoJ0ZFQicpICYmICFyZXN1bHRDcm9uLm1vbnRoLmluY2x1ZGVzKCdGRUInKSlcclxuICAgICAgICAgICAgICAgIHJlc3VsdENyb24ubW9udGggKz0gXCJGRUIsXCI7XHJcbiAgICAgICAgICAgIGlmKG1hdGNoZXMuaW5jbHVkZXMoJ01BUicpICYmICFyZXN1bHRDcm9uLm1vbnRoLmluY2x1ZGVzKCdNQVInKSlcclxuICAgICAgICAgICAgICAgIHJlc3VsdENyb24ubW9udGggKz0gXCJNQVIsXCI7XHJcbiAgICAgICAgICAgIGlmKG1hdGNoZXMuaW5jbHVkZXMoJ0FQUicpICYmICFyZXN1bHRDcm9uLm1vbnRoLmluY2x1ZGVzKCdBUFInKSlcclxuICAgICAgICAgICAgICAgIHJlc3VsdENyb24ubW9udGggKz0gXCJBUFIsXCI7XHJcbiAgICAgICAgICAgIGlmKG1hdGNoZXMuaW5jbHVkZXMoJ01BWScpICYmICFyZXN1bHRDcm9uLm1vbnRoLmluY2x1ZGVzKCdNQVknKSlcclxuICAgICAgICAgICAgICAgIHJlc3VsdENyb24ubW9udGggKz0gXCJNQVksXCI7XHJcbiAgICAgICAgICAgIGlmKG1hdGNoZXMuaW5jbHVkZXMoJ0pVTicpICYmICFyZXN1bHRDcm9uLm1vbnRoLmluY2x1ZGVzKCdKVU4nKSlcclxuICAgICAgICAgICAgICAgIHJlc3VsdENyb24ubW9udGggKz0gXCJKVU4sXCI7XHJcbiAgICAgICAgICAgIGlmKG1hdGNoZXMuaW5jbHVkZXMoJ0pVTCcpICYmICFyZXN1bHRDcm9uLm1vbnRoLmluY2x1ZGVzKCdKVUwnKSlcclxuICAgICAgICAgICAgICAgIHJlc3VsdENyb24ubW9udGggKz0gXCJKVUwsXCI7XHJcbiAgICAgICAgICAgIGlmKG1hdGNoZXMuaW5jbHVkZXMoJ0FVRycpICYmICFyZXN1bHRDcm9uLm1vbnRoLmluY2x1ZGVzKCdBVUcnKSlcclxuICAgICAgICAgICAgICAgIHJlc3VsdENyb24ubW9udGggKz0gXCJBVUcsXCI7XHJcbiAgICAgICAgICAgIGlmKG1hdGNoZXMuaW5jbHVkZXMoJ1NFUFQnKSAmJiAhcmVzdWx0Q3Jvbi5tb250aC5pbmNsdWRlcygnU0VQVCcpKVxyXG4gICAgICAgICAgICAgICAgcmVzdWx0Q3Jvbi5tb250aCArPSBcIlNFUFQsXCI7XHJcbiAgICAgICAgICAgIGlmKG1hdGNoZXMuaW5jbHVkZXMoJ09DVCcpICYmICFyZXN1bHRDcm9uLm1vbnRoLmluY2x1ZGVzKCdPQ1QnKSlcclxuICAgICAgICAgICAgICAgIHJlc3VsdENyb24ubW9udGggKz0gXCJPQ1QsXCI7XHJcbiAgICAgICAgICAgIGlmKG1hdGNoZXMuaW5jbHVkZXMoJ05PVicpICYmICFyZXN1bHRDcm9uLm1vbnRoLmluY2x1ZGVzKCdOT1YnKSlcclxuICAgICAgICAgICAgICAgIHJlc3VsdENyb24ubW9udGggKz0gXCJOT1YsXCI7XHJcbiAgICAgICAgICAgIGlmKG1hdGNoZXMuaW5jbHVkZXMoJ0RFQycpICYmICFyZXN1bHRDcm9uLm1vbnRoLmluY2x1ZGVzKCdERUMnKSlcclxuICAgICAgICAgICAgICAgIHJlc3VsdENyb24ubW9udGggKz0gXCJERUMsXCI7XHJcbiAgICAgICAgICAgIC8vIHJlbW92ZWQgZXh0cmEgY29tbWFcclxuICAgICAgICAgICAgcmVzdWx0Q3Jvbi5tb250aCA9IHJlc3VsdENyb24ubW9udGguc2xpY2UoMCwtMSk7XHJcbiAgICAgICAgICAgIHZhbHVlID0gXCJcIityZXN1bHRDcm9uLm1vbnRoO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIFRPIERPOiBwcm92aWRlIGluIGZ1dHVyZS4gYnV0IGZvciBOT1cgIGVycm9yXHJcbiAgICAgICAgICAgIGVycm9yICs9XCIgSW4gdW5yZXNvbHZlZCBzdGF0ZSBhdCAyO01vbnRoICFcIjtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGxldCBzdGFja0VsZW1lbnQgPSB7XHJcbiAgICAgICAgXCJvd25lclN0YXRlXCIgOiBcIm1vbnRoXCIsXHJcbiAgICAgICAgXCJtb250aFwiIDogcmVzdWx0Q3Jvbi5tb250aCxcclxuICAgIH07XHJcbiAgICBzdGFjay5wdXNoKHN0YWNrRWxlbWVudCk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgZ2V0TW9udGhcclxufTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuY29uc3QgcmVnZXhTdHJpbmcgPSByZXF1aXJlKCcuLi9tYXBzJykucmVnZXhTdHJpbmc7XHJcbnZhciBmbGFncyA9IHJlcXVpcmUoJy4uL21hcHMnKS5mbGFncztcclxudmFyIHJlc3VsdENyb24gPSByZXF1aXJlKCcuLi9tYXBzJykucmVzdWx0Q3JvbjtcclxuXHJcblxyXG4vKnJhbmdlU3RhcnRTdGF0ZSBmdW5jdGlvbiBmb3IgcmFuZ2UgaW5wdXQqL1xyXG5mdW5jdGlvbiByYW5nZVN0YXJ0U3RhdGUodG9rZW4sc3RhY2ssZXJyb3IpIHtcclxuICAgIGlmKGZsYWdzLmlzUmFuZ2VGb3JEYXkgfHwgZmxhZ3MuaXNSYW5nZUZvck1pbiB8fCBmbGFncy5pc1JhbmdlRm9yTW9udGggfHwgZmxhZ3MuaXNSYW5nZUZvclllYXIgfHwgZmxhZ3MuaXNSYW5nZUZvckhvdXIpIHtcclxuICAgICAgICBlcnJvciArPVwiIGFscmVhZHkgcmFuZ2UgZXhwcmVzc2lvbnMgIVwiO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGxldCBzdGFja0VsZW1lbnQgPSB7XHJcbiAgICAgICAgXCJvd25lclN0YXRlXCIgOiBcInJhbmdlU3RhcnRcIixcclxuICAgICAgICBcIm1pblwiOiB7XHJcbiAgICAgICAgICAgIFwic3RhcnRcIiA6IFwiXCIsXHJcbiAgICAgICAgICAgIFwiZW5kXCIgOiBcIlwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcImhvdXJcIiA6IHtcclxuICAgICAgICAgICAgXCJzdGFydFwiIDogXCJcIixcclxuICAgICAgICAgICAgXCJlbmRcIiA6IFwiXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiZGF5XCIgOiB7XHJcbiAgICAgICAgICAgIFwic3RhcnRcIiA6IFwiXCIsXHJcbiAgICAgICAgICAgIFwiZW5kXCIgOiBcIlwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIm1vbnRoXCIgOiB7XHJcbiAgICAgICAgICAgIFwic3RhcnRcIiA6IFwiXCIsXHJcbiAgICAgICAgICAgIFwiZW5kXCIgOiBcIlwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcInllYXJcIiA6IHtcclxuICAgICAgICAgICAgXCJzdGFydFwiIDogXCJcIixcclxuICAgICAgICAgICAgXCJlbmRcIiA6IFwiXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiZnJlcXVlbmN5XCIgOiB7XHJcbiAgICAgICAgICAgIFwic3RhcnRcIiA6IFwiXCIsXHJcbiAgICAgICAgICAgIFwiZW5kXCIgOiBcIlwiXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHN0YWNrLnB1c2goc3RhY2tFbGVtZW50KTtcclxuICAgIHJldHVybiB0cnVlO1xyXG59XHJcblxyXG4vKnJhbmdlRW5kU3RhdGUgZnVuY3Rpb24gZm9yIHJhbmdlIGlucHV0Ki9cclxuZnVuY3Rpb24gcmFuZ2VFbmRTdGF0ZSh0b2tlbixzdGFjayxlcnJvcikge1xyXG4gICAgbGV0IHN0YWNrRWxlbWVudCA9IHtcclxuICAgICAgICBcIm93bmVyU3RhdGVcIiA6IFwicmFuZ2VFbmRcIixcclxuICAgICAgICBcIm1pblwiOiB7XHJcbiAgICAgICAgICAgIFwic3RhcnRcIiA6IFwiXCIsXHJcbiAgICAgICAgICAgIFwiZW5kXCIgOiBcIlwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcImhvdXJcIiA6IHtcclxuICAgICAgICAgICAgXCJzdGFydFwiIDogXCJcIixcclxuICAgICAgICAgICAgXCJlbmRcIiA6IFwiXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiZGF5XCIgOiB7XHJcbiAgICAgICAgICAgIFwic3RhcnRcIiA6IFwiXCIsXHJcbiAgICAgICAgICAgIFwiZW5kXCIgOiBcIlwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIm1vbnRoXCIgOiB7XHJcbiAgICAgICAgICAgIFwic3RhcnRcIiA6IFwiXCIsXHJcbiAgICAgICAgICAgIFwiZW5kXCIgOiBcIlwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcInllYXJcIiA6IHtcclxuICAgICAgICAgICAgXCJzdGFydFwiIDogXCJcIixcclxuICAgICAgICAgICAgXCJlbmRcIiA6IFwiXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiZnJlcXVlbmN5XCIgOiB7XHJcbiAgICAgICAgICAgIFwic3RhcnRcIiA6IFwiXCIsXHJcbiAgICAgICAgICAgIFwiZW5kXCIgOiBcIlwiXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIGxldCB0b3BFbGVtZW50ID0gc3RhY2tbc3RhY2subGVuZ3RoLTFdO1xyXG4gICAgaWYodG9wRWxlbWVudCE9bnVsbCkge1xyXG4gICAgICAgIHN3aXRjaCh0b3BFbGVtZW50Lm93bmVyU3RhdGUpIHtcclxuICAgICAgICAgICAgY2FzZSBcImZyZXF1ZW5jeVdpdGhcIiA6XHJcbiAgICAgICAgICAgIGNhc2UgXCJmcmVxdWVuY3lPbmx5XCIgOlxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzdGFjay5wb3AoKTtcclxuICAgICAgICAgICAgICAgIHN0YWNrRWxlbWVudC5mcmVxdWVuY3kuc3RhcnQgPSB0b3BFbGVtZW50LmZyZXF1ZW5jeTtcclxuICAgICAgICAgICAgICAgIHN0YWNrRWxlbWVudC5vd25lclN0YXRlID0gXCJyYW5nZUVuZFwiO1xyXG4gICAgICAgICAgICAgICAgc3RhY2sucHVzaChzdGFja0VsZW1lbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgXCJjbG9ja1RpbWVcIiA6XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN0YWNrLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgc3RhY2tFbGVtZW50LmhvdXIuc3RhcnQgPSB0b3BFbGVtZW50LmhvdXI7XHJcbiAgICAgICAgICAgICAgICBzdGFja0VsZW1lbnQubWluLnN0YXJ0ID0gdG9wRWxlbWVudC5taW47XHJcbiAgICAgICAgICAgICAgICBzdGFja0VsZW1lbnQub3duZXJTdGF0ZSA9IFwicmFuZ2VFbmRcIjtcclxuICAgICAgICAgICAgICAgIHN0YWNrLnB1c2goc3RhY2tFbGVtZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFwicmFuZ2VTdGFydFwiIDpcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3RhY2sucG9wKCk7XHJcbiAgICAgICAgICAgICAgICB0b3BFbGVtZW50Lm93bmVyU3RhdGUgPSBcInJhbmdlRW5kXCI7XHJcbiAgICAgICAgICAgICAgICBzdGFjay5wdXNoKHRvcEVsZW1lbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFwibW9udGhcIiA6XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN0YWNrLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgc3RhY2tFbGVtZW50Lm93bmVyU3RhdGUgPSBcInJhbmdlRW5kXCI7XHJcbiAgICAgICAgICAgICAgICBzdGFja0VsZW1lbnQubW9udGguc3RhcnQgPSB0b3BFbGVtZW50Lm1vbnRoO1xyXG4gICAgICAgICAgICAgICAgc3RhY2sucHVzaChzdGFja0VsZW1lbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFwibWludXRlXCIgOlxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzdGFjay5wb3AoKTtcclxuICAgICAgICAgICAgICAgIHN0YWNrRWxlbWVudC5vd25lclN0YXRlID0gXCJyYW5nZUVuZFwiO1xyXG4gICAgICAgICAgICAgICAgc3RhY2tFbGVtZW50LmZyZXF1ZW5jeS5zdGFydCA9IHN0YWNrRWxlbWVudC5taW4uc3RhcnQgPSB0b3BFbGVtZW50Lm1pbjtcclxuICAgICAgICAgICAgICAgIHN0YWNrLnB1c2goc3RhY2tFbGVtZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBcImhvdXJcIiA6XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN0YWNrLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgc3RhY2tFbGVtZW50Lm93bmVyU3RhdGUgPSBcInJhbmdlRW5kXCI7XHJcbiAgICAgICAgICAgICAgICBzdGFja0VsZW1lbnQuZnJlcXVlbmN5LnN0YXJ0ID0gc3RhY2tFbGVtZW50LmhvdXIuc3RhcnQgPSB0b3BFbGVtZW50LmhvdXI7XHJcbiAgICAgICAgICAgICAgICBzdGFjay5wdXNoKHN0YWNrRWxlbWVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgXCJkYXlcIiA6XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN0YWNrLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgc3RhY2tFbGVtZW50Lm93bmVyU3RhdGUgPSBcInJhbmdlRW5kXCI7XHJcbiAgICAgICAgICAgICAgICBzdGFja0VsZW1lbnQuZGF5LnN0YXJ0ID0gdG9wRWxlbWVudC5kYXlfb2Zfd2VlaztcclxuICAgICAgICAgICAgICAgIHN0YWNrLnB1c2goc3RhY2tFbGVtZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBcInllYXJcIiA6XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN0YWNrLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgc3RhY2tFbGVtZW50Lm93bmVyU3RhdGUgPSBcInJhbmdlRW5kXCI7XHJcbiAgICAgICAgICAgICAgICBzdGFja0VsZW1lbnQueWVhci5zdGFydCA9IHRvcEVsZW1lbnQueWVhcjtcclxuICAgICAgICAgICAgICAgIHN0YWNrLnB1c2goc3RhY2tFbGVtZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgcmFuZ2VTdGFydFN0YXRlLFxyXG4gICAgcmFuZ2VFbmRTdGF0ZVxyXG59O1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCByZWdleFN0cmluZyA9IHJlcXVpcmUoJy4uL21hcHMnKS5yZWdleFN0cmluZztcclxudmFyIGZsYWdzID0gcmVxdWlyZSgnLi4vbWFwcycpLmZsYWdzO1xyXG52YXIgcmVzdWx0Q3JvbiA9IHJlcXVpcmUoJy4uL21hcHMnKS5yZXN1bHRDcm9uO1xyXG5cclxuLypnZXRTZWNvbmQgZnVuY3Rpb24gdG8gcGFyc2Ugc2Vjb25kcyovXHJcbmZ1bmN0aW9uIGdldFNlY29uZCh0b2tlbixzdGFjayxlcnJvcikge1xyXG4gICAgLy8gVE8gRE86IGNoZWNrIGZvciBncm91cFxyXG4gICAgbGV0IHJlZ0J1aWxkZXIgPSBuZXcgUmVnRXhwKHJlZ2V4U3RyaW5nLnNlY29uZC5yZWdleGV4ZWNbMF0sXCJpZ1wiKTtcclxuICAgIGxldCB2YWx1ZTtcclxuICAgIC8vIGNoZWNrIGZvciB3b3JkIHNlY29uZCxzZWNvbmRzXHJcbiAgICBpZihyZWdCdWlsZGVyLnRlc3QodG9rZW4pKSB7XHJcbiAgICAgICAgbGV0IHRvcEVsZW1lbnQgPSBzdGFja1tzdGFjay5sZW5ndGgtMV07XHJcbiAgICAgICAgaWYodG9wRWxlbWVudCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRvcEVsZW1lbnQgPSB7XHJcbiAgICAgICAgICAgICAgICAnZnJlcXVlbmN5JyA6IFwiKlwiXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIGlmKHRvcEVsZW1lbnQub3duZXJTdGF0ZSA9PSBcImZyZXF1ZW5jeU9ubHlcIikge1xyXG4gICAgICAgICAgICB2YWx1ZSA9IHRvcEVsZW1lbnQuZnJlcXVlbmN5O1xyXG4gICAgICAgICAgICByZXN1bHRDcm9uLnNlYyA9IFwiMC9cIit0b3BFbGVtZW50LmZyZXF1ZW5jeTtcclxuICAgICAgICAgICAgc3RhY2sucG9wKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmKHRvcEVsZW1lbnQub3duZXJTdGF0ZSA9PSBcImZyZXF1ZW5jeVdpdGhcIikge1xyXG4gICAgICAgICAgICB2YWx1ZSA9IHRvcEVsZW1lbnQuZnJlcXVlbmN5O1xyXG4gICAgICAgICAgICByZXN1bHRDcm9uLnNlYyA9IFwiXCIrdG9wRWxlbWVudC5mcmVxdWVuY3k7XHJcbiAgICAgICAgICAgIHN0YWNrLnBvcCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmKGZsYWdzLmlzUmFuZ2VGb3JTZWNvbmQgPT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgZXJyb3IgKz1cIiBhbHJlYWR5IHNldCBmb3IgcmFuZ2UgZXhwcmVzc2lvbnMsIHNlcGVyYXRlIGludG8gdHdvIGNyb25zIVwiO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYodG9wRWxlbWVudC5vd25lclN0YXRlID09IFwicmFuZ2VTdGFydFwiKSB7XHJcbiAgICAgICAgICAgICAgICB0b3BFbGVtZW50LnNlYy5zdGFydCA9IHRvcEVsZW1lbnQuZnJlcXVlbmN5LnN0YXJ0O1xyXG4gICAgICAgICAgICAgICAgdG9wRWxlbWVudC5mcmVxdWVuY3kuc3RhcnQgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgc3RhY2sucG9wKCk7XHJcbiAgICAgICAgICAgICAgICBzdGFjay5wdXNoKHRvcEVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZih0b3BFbGVtZW50Lm93bmVyU3RhdGUgPT0gXCJyYW5nZUVuZFwiKSB7XHJcbiAgICAgICAgICAgICAgICBzdGFjay5wb3AoKTtcclxuICAgICAgICAgICAgICAgIHRvcEVsZW1lbnQuc2VjLnN0YXJ0ID0gdG9wRWxlbWVudC5mcmVxdWVuY3kuc3RhcnQ7XHJcbiAgICAgICAgICAgICAgICB0b3BFbGVtZW50LnNlYy5lbmQgPSB0b3BFbGVtZW50LmZyZXF1ZW5jeS5lbmQ7XHJcbiAgICAgICAgICAgICAgICB0b3BFbGVtZW50LmZyZXF1ZW5jeS5lbmQgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0Q3Jvbi5zZWMgPSB0b3BFbGVtZW50LnNlYy5zdGFydCArIFwiLVwiK3RvcEVsZW1lbnQuc2VjLmVuZDtcclxuICAgICAgICAgICAgICAgIC8vZmxhZ3MuaXNSYW5nZUZvcnNlYyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGxldCBzdGFja0VsZW1lbnQgPSB7XHJcbiAgICAgICAgXCJvd25lclN0YXRlXCIgOiBcInNlY29uZFwiLFxyXG4gICAgICAgIFwic2VjXCIgOiB2YWx1ZVxyXG4gICAgfTtcclxuICAgIHN0YWNrLnB1c2goc3RhY2tFbGVtZW50KTtcclxuICAgIHJldHVybiB0cnVlO1xyXG59XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBnZXRTZWNvbmRcclxufTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuY29uc3QgcmVnZXhTdHJpbmcgPSByZXF1aXJlKCcuLi9tYXBzJykucmVnZXhTdHJpbmc7XHJcbnZhciBmbGFncyA9IHJlcXVpcmUoJy4uL21hcHMnKS5mbGFncztcclxudmFyIHJlc3VsdENyb24gPSByZXF1aXJlKCcuLi9tYXBzJykucmVzdWx0Q3JvbjtcclxuXHJcblxyXG4vKmdldFllYXIgZnVuY3Rpb24gdG8gcGFyc2UgeWVhciovXHJcbmZ1bmN0aW9uIGdldFllYXIodG9rZW4sc3RhY2ssZXJyb3IpIHtcclxuICAgIC8vIFRPIERPOiBjaGVjayBmb3IgZ3JvdXBcclxuICAgIGxldCByZWdCdWlsZGVyID0gbmV3IFJlZ0V4cChyZWdleFN0cmluZy55ZWFyLnJlZ2V4ZXhlY1swXSxcImlnXCIpO1xyXG4gICAgbGV0IHZhbHVlID0gXCJcIjtcclxuICAgIC8vIGNoZWNrIGZvciB3b3JkIHllYXIseWVhcnNcclxuICAgIGlmKHJlZ0J1aWxkZXIudGVzdCh0b2tlbikpIHtcclxuICAgICAgICBsZXQgdG9wRWxlbWVudCA9IHN0YWNrW3N0YWNrLmxlbmd0aC0xXTtcclxuICAgICAgICByZXN1bHRDcm9uLnllYXIgPSBcIj9cIjtcclxuICAgICAgICBpZih0b3BFbGVtZW50ID09IG51bGwpIHtcclxuICAgICAgICAgICAgdG9wRWxlbWVudCA9IHtcclxuICAgICAgICAgICAgICAgICdmcmVxdWVuY3knIDogXCIqXCJcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGVsc2UgaWYodG9wRWxlbWVudC5vd25lclN0YXRlID09IFwiZnJlcXVlbmN5T25seVwiKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdENyb24ueWVhciA9IFwiMC9cIit0b3BFbGVtZW50LmZyZXF1ZW5jeTtcclxuICAgICAgICAgICAgc3RhY2sucG9wKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmKHRvcEVsZW1lbnQub3duZXJTdGF0ZSA9PSBcImZyZXF1ZW5jeVdpdGhcIikge1xyXG4gICAgICAgICAgICByZXN1bHRDcm9uLnllYXIgPSBcIlwiK3RvcEVsZW1lbnQuZnJlcXVlbmN5O1xyXG4gICAgICAgICAgICBzdGFjay5wb3AoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXN1bHRDcm9uLnllYXIgPSBcIipcIjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBjaGVjayBmb3IgdmFsdWVzIG9mIHllYXJzXHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZWdCdWlsZGVyID0gbmV3IFJlZ0V4cChyZWdleFN0cmluZy55ZWFyLnJlZ2V4ZXhlY1sxXSxcImlnXCIpO1xyXG4gICAgICAgIGxldCByZWdCdWlsZGVyMiA9IG5ldyBSZWdFeHAocmVnZXhTdHJpbmcueWVhci5yZWdleGV4ZWNbMl0sXCJpZ1wiKVxyXG4gICAgICAgIGxldCBtYXRjaGVzID0gdG9rZW4ubWF0Y2gocmVnQnVpbGRlcik7XHJcbiAgICAgICAgbGV0IGV4YWN0TWF0Y2hlcyA9IG5ldyBTZXQoKTtcclxuICAgICAgICBmb3IobGV0IGk9MDsgaTxtYXRjaGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmKHJlZ0J1aWxkZXIyLnRlc3QobWF0Y2hlc1tpXSkpIHtcclxuICAgICAgICAgICAgICAgIGV4YWN0TWF0Y2hlcy5hZGQobWF0Y2hlc1tpXS5tYXRjaChyZWdCdWlsZGVyMilbMF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIFRPIERPOiBjaGVja1xyXG4gICAgICAgIGxldCB0b3BFbGVtZW50ID0gc3RhY2tbc3RhY2subGVuZ3RoLTFdO1xyXG4gICAgICAgIGlmKGV4YWN0TWF0Y2hlcy5zaXplID09IDEgJiYgdG9wRWxlbWVudCAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIC8vQ2hlY2sgaWYgYWxyZWFkeSBhIHJhbmdlIGlzIGRlZmluZWRcclxuICAgICAgICAgICAgaWYoZmxhZ3MuaXNSYW5nZUZvclllYXIgPT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgZXJyb3IgKz1cIiBDYW5ub3QgaGFuZGxlIG11bHRpcGxlIHJhbmdlIGV4cHJlc3Npb25zLCBzZXBlcmF0ZSBpbnRvIHR3byBjcm9ucyFcIjtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYodG9wRWxlbWVudC5vd25lclN0YXRlID09IFwicmFuZ2VTdGFydFwiKSB7XHJcbiAgICAgICAgICAgICAgICB0b3BFbGVtZW50LnllYXIuc3RhcnQgPSBBcnJheS5mcm9tKGV4YWN0TWF0Y2hlcylbMF07XHJcbiAgICAgICAgICAgICAgICBzdGFjay5wb3AoKTtcclxuICAgICAgICAgICAgICAgIHN0YWNrLnB1c2godG9wRWxlbWVudCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmKHRvcEVsZW1lbnQub3duZXJTdGF0ZSA9PSBcInJhbmdlRW5kXCIpIHtcclxuICAgICAgICAgICAgICAgIHRvcEVsZW1lbnQueWVhci5lbmQgPSBBcnJheS5mcm9tKGV4YWN0TWF0Y2hlcylbMF07XHJcbiAgICAgICAgICAgICAgICBzdGFjay5wb3AoKTtcclxuICAgICAgICAgICAgICAgIHJlc3VsdENyb24ueWVhciA9IHRvcEVsZW1lbnQueWVhci5zdGFydCArIFwiLVwiK3RvcEVsZW1lbnQueWVhci5lbmQ7XHJcbiAgICAgICAgICAgICAgICAvL2ZsYWdzLmlzUmFuZ2VGb3JZZWFyID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKGV4YWN0TWF0Y2hlcy5zaXplICE9IDApIHtcclxuICAgICAgICAgICAgcmVzdWx0Q3Jvbi55ZWFyID0gXCJcIjtcclxuICAgICAgICAgICAgZXhhY3RNYXRjaGVzLmZvckVhY2goZnVuY3Rpb24oeXIpe1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0Q3Jvbi55ZWFyICs9IHlyK1wiLFwiO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gcmVtb3ZlZCBleHRyYSBjb21tYVxyXG4gICAgICAgICAgICByZXN1bHRDcm9uLnllYXIgPSByZXN1bHRDcm9uLnllYXIuc2xpY2UoMCwtMSk7XHJcbiAgICAgICAgICAgIHZhbHVlID0gXCJcIityZXN1bHRDcm9uLnllYXI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gVE8gRE86IHByb3ZpZGUgaW4gZnV0dXJlLiBidXQgZm9yIE5PVyAgZXJyb3JcclxuICAgICAgICAgICAgZXJyb3IgKz1cIiBJbiB1bnJlc29sdmVkIHN0YXRlIGF0IDI7eWVhciAhXCI7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBsZXQgc3RhY2tFbGVtZW50ID0ge1xyXG4gICAgICAgIFwib3duZXJTdGF0ZVwiIDogXCJ5ZWFyXCIsXHJcbiAgICAgICAgXCJ5ZWFyXCIgOiByZXN1bHRDcm9uLnllYXJcclxuICAgIH07XHJcbiAgICBzdGFjay5wdXNoKHN0YWNrRWxlbWVudCk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBnZXRZZWFyXHJcbn07XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IHJlZ2V4U3RyaW5nID0gcmVxdWlyZSgnLi9tYXBzJykucmVnZXhTdHJpbmc7XHJcbnZhciBmbGFncyA9IHJlcXVpcmUoJy4vbWFwcycpLmZsYWdzO1xyXG52YXIgcmVzdWx0Q3JvbiA9IHJlcXVpcmUoJy4vbWFwcycpLnJlc3VsdENyb247XHJcbi8vdG9rZW5pemVJbnB1dCBmdW5jdGlvbiB0byBzZXBlcmF0ZSBvdXQgYWxsIHRva2Vuc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICB0b2tlbml6ZUlucHV0IDogZnVuY3Rpb24oaW5wdXRTdHJpbmcpe1xyXG4gICAgICAgIGxldCByZWdCdWlsZGVyID0gbmV3IFJlZ0V4cChyZWdleFN0cmluZy50b2tlbmlzaW5nLnJlZ2V4ZXhlYyxcImlnXCIpO1xyXG4gICAgICAgIGxldCBtYXRjaGVzID0gaW5wdXRTdHJpbmcubWF0Y2gocmVnQnVpbGRlcik7XHJcbiAgICAgICAgaWYobWF0Y2hlcyA9PSBudWxsIHx8IG1hdGNoZXMubGVuZ3RoID09IDAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yKGxldCBpPTA7aTxtYXRjaGVzLmxlbmd0aDtpKyspIHtcclxuICAgICAgICAgICAgbWF0Y2hlc1tpXSA9IChtYXRjaGVzW2ldK1wiXCIpLnRyaW0oKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG1hdGNoZXM7XHJcbiAgICB9XHJcbn07XHJcbiJdfQ==
