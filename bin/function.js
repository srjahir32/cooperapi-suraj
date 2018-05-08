var consoleHolder = console;
var looper = {
    dateFormat: function(date) {
        var now = new Date(date);
        var month = now.getUTCMonth() + 1;
        return now.getUTCFullYear() + "-" + month + "-" + now.getUTCDate() + " " + now.getUTCHours() + ":" + now.getUTCMinutes();
    },
    debug: function(bool) {
        if (!bool) {
            consoleHolder = console;
            console = {};
            console.log = function() {};
        } else
            console = consoleHolder;
    },
    checkDate: function(currVal) {

        if (currVal == '') return false;

        //Declare Regex  
        var rxDatePattern = /^(\d{1,2})(\/|-)([a-zA-Z]{3})(\/|-)(\d{4})$/;

        var dtArray = currVal.match(rxDatePattern); // is format OK?

        if (dtArray == null) return false;

        var dtDay = parseInt(dtArray[1]);
        var dtMonth = dtArray[3];
        var dtYear = parseInt(dtArray[4]);

        // need to change to lowerCase because switch is
        // case sensitive
        switch (dtMonth.toLowerCase()) {
            case 'jan':
                dtMonth = '01';
                break;
            case 'feb':
                dtMonth = '02';
                break;
            case 'mar':
                dtMonth = '03';
                break;
            case 'apr':
                dtMonth = '04';
                break;
            case 'may':
                dtMonth = '05';
                break;
            case 'jun':
                dtMonth = '06';
                break;
            case 'jul':
                dtMonth = '07';
                break;
            case 'aug':
                dtMonth = '08';
                break;
            case 'sep':
                dtMonth = '09';
                break;
            case 'oct':
                dtMonth = '10';
                break;
            case 'nov':
                dtMonth = '11';
                break;
            case 'dec':
                dtMonth = '12';
                break;
        }

        // convert date to number
        dtMonth = parseInt(dtMonth);

        if (isNaN(dtMonth)) return false;
        else if (dtMonth < 1 || dtMonth > 12) return false;
        else if (dtDay < 1 || dtDay > 31) return false;
        else if ((dtMonth == 4 || dtMonth == 6 || dtMonth == 9 || dtMonth == 11) && dtDay == 31) return false;
        else if (dtMonth == 2) {
            var isleap = (dtYear % 4 == 0 && (dtYear % 100 != 0 || dtYear % 400 == 0));
            if (dtDay > 29 || (dtDay == 29 && !isleap)) return false;
        }
        return true;
    },
};
module.exports = looper;