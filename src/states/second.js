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
