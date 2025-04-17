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
