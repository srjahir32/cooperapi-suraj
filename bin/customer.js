var models = require("../db.js");
var moment = require('moment');
var fun = require('./function');
var SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const sgMail = require('@sendgrid/mail');
var ics = require('ics');
var fs = require('fs');
var moment = require('moment-timezone');

function toTweleveHours(date){
    toDate = new Date(date);
    var hours = toDate.getHours();
    var minutes = toDate.getMinutes();
    var seconds = toDate.getSeconds();
  
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
   
    var strTime = hours + ':' + minutes + ' ' + ampm;
   
    return strTime;
}

function convertToTwelvehours(time, date){
    var timeDate = new Date(date +' '+ time);
    console.log(date +' '+ time);
  //  var m = moment(timeDate).tz(timezone).format('YYYY-MM-DDTHH:mm:SS'); //2018-03-16T11:35:00
    var n = new Date(timeDate)
    var hours = n.getHours();
    var minutes = n.getMinutes();
    var seconds = n.getSeconds();
   
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
   
    var localTime = hours + ':' + minutes + ' ' + ampm;
    
    return localTime;
}

// function convertToLocatTz(time, date, timezone){
//     var timeDate = new Date(date +' '+ time);
//     console.log(date +' '+ time);
//     var m = moment(timeDate).tz(timezone).format('YYYY-MM-DDTHH:mm:SS'); //2018-03-16T11:35:00
//     var n = new Date(m)
//     var hours = n.getHours();
//     var minutes = n.getMinutes();
//     var seconds = n.getSeconds();
   
//     var ampm = hours >= 12 ? 'pm' : 'am';
//     hours = hours % 12;
//     hours = hours ? hours : 12; // the hour '0' should be '12'
//     minutes = minutes < 10 ? '0'+minutes : minutes;
   
//     var localTime = hours + ':' + minutes + ' ' + ampm;
    
//     return localTime;
// }

function toDateFormat(date){
    toDate = new Date(date);
    var month = toDate.getMonth()+1;
    var day = toDate.getDate();
    var year = toDate.getFullYear();
   
    var onlyDate = month + '/' + day + '/' + year;
    return onlyDate;
}
exports.addcalllog = function(req, res) {
    timezone = req.headers['timezone'];
   
        var m = req.body.createdAt;
        var a = new Date(m);
        var d = new Date();
        console.log('from Phone d>>>>',d);
        console.log('from Phone m>>>>',m);
        console.log('from Phone a>>>>',  a.getFullYear()+"-"+a.getMonth()+"-"+a.getDate+" and  "+a.getHours()+":"+a.getMinutes()+":"+a.getSeconds());
  
  
//     console.log("Timezone", req.headers['timezone']);
//   //  console.log("Current Server Time", b);
//     console.log("Converted time to TZ",m);
//     console.log("Date object created to TZ",a);
    


    var salesmanId = req.user.userId;
    
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();

    /* Added 0 beofre hms if < 10 to insert in db */
    var min1 = min < 10 ? '0'+min : min;
    var hour1 = hour < 10 ? '0'+hour : hour;
    var sec1 = sec < 10 ? '0'+sec : sec;
    
    var Date_at = date + '-' + month + '-' + year;
    var time = hour1 + ':' + min1 + ':' + sec1;
    console.log('created_at', Date_at);
    console.log('time', time);
    var log = new models.callLogs_table();
    log.email = req.user.email;

    log.customerName = req.body.customerName;
    log.contact = req.body.contact;
    log.comment = req.body.comment;
    log.location = req.body.location;
    log.latitude = req.body.latitude;
    log.longitude = req.body.longitude;
    log.vibe = req.body.vibe;
    log.order = req.body.order;
    log.created_at = Date_at;
    log.time = time;
    // log.customerType = "Prospect";
    log.salesmanId = salesmanId;
    log.date = req.body.date;
    log.callType = req.body.callType;
    log.customerId = req.body.customerId;
    // log.isPhoneCall = req.body.isPhoneCall;
    // log.visitSite = req.body.visitSite;
    log.isCopyEmail = req.body.isCopyEmail;
    console.log('Date Object', req.body.date);
    
    
    models.user.find({ _id: salesmanId }, function(err, data) {
        if (!err) {
            if (data.length > 0) {
            //    console.log('data[0].region', data[0]);
                log.salesmanName = data[0].username || data[0].email;
                log.region = data[0].region;
                var email = data[0].email;
               
               
                if (!log.salesmanName || log.salesmanName == "") {
                    res.json(st.addcallLog.salesmanName);
                    return;
                } else if (!log.salesmanId || log.salesmanId == "") {
                    res.json(st.addcallLog.salesmanId);
                    return;
                } else if (!log.callType || log.callType == "") {
                    res.json(st.addcallLog.callType);
                    return;
                } else if (!["phonecall", "sitevisit"].includes(log.callType)) {
                    res.json({ code: 101, start: 'error', message: 'Call type must be any one from phonecall or sitevisit' });
                    return;
                } 
                /*else if (!log.date || log.date == "") {
                    res.json(st.addcallLog.date);
                    return;
                }*/
                else if (!log.email || log.email == "") {
                    res.json(st.login.email);
                    return;
                } else if (!log.customerName || log.customerName == "") {
                    res.json(st.addcallLog.customerName);
                    return;
                } else if (!log.location || log.location == "") {
                    res.json(st.addcallLog.location);
                    return;
                } else if (!log.vibe || log.vibe == "") {
                    res.json(st.addcallLog.vibe);
                    return;
                } else if (!log.order || log.order == "") {
                    res.json(st.addcallLog.order);
                    return;
                } else if (!log.contact || log.contact == "") {
                    res.json(st.addcallLog.contact);
                    return;
                } else if (!log.isCopyEmail || log.isCopyEmail == "") {
                    res.json(st.addcallLog.isCopyEmail);
                    return;
                }
                
                /* sendICSmail object created */
                var userContent = {
                    text: "Call log added",
                    subject: "Cooper-Schedule Call to "+req.body.customerName,
                    html: "<p>You scheduled follow up with the customer " + req.body.customerName + " is set on "+req.body.date+"</p></br></br>" +
                    "<div><h3> Call Log Details </h3></br>"+
                    "Appointment Date : " + toDateFormat(req.body.date) + "<br />" +
                    "Appointment Time : " + toTweleveHours(req.body.date) + "<br />" +
                    "Call Date : " + log.created_at + "<br />" +
                    "Call Time : " + log.time + "<br />" +
                    "Customer Name : " + log.customerName + "<br />" +
                    "Contact : " + log.contact + "<br />" +
                    "Location : " + log.location + "<br />" +
                    "Comments : " + log.comment + "<br />" +
                    "Order : " + log.order + "<br />" +
                    "Vibe : " + log.vibe + "<br />" +
                    "Type of Call : " + log.callType + "<br />" +
                    "Salesman Name : " +  log.salesmanName + "</div>" 
                    
                    // Cal object
                }

            




                var customerId = log.customerId;

    CreateCustomer(log.customerName, log.location, log.contact, salesmanId, customerId,
                    function(type, msg) {
                        if (type) {
                            log.customerType = type;
                      //     console.log('Type', type);
                            log.save(function(err, data) {
                                if (!err) {
                                 
                                  //  console.log("record inserted success", data);
                                  // Send Email Copy is Checkbox is marked on app
                                    if (req.body.isCopyEmail && req.body.isCopyEmail == "yes") {
                                        var bodyContent = {
                                            text: "Call log added",
                                            subject: "Call log copy",
                                            html:"Scheduled Follow Up Date : " + req.body.date + "<br />" +
                                                "email : " + log.email + "<br />" +
                                                "Customer Name : " + log.customerName + "<br />" +
                                                "Contact : " + log.contact + "<br />" +
                                                "Location : " + log.location + "<br />" +
                                                "Comment : " + log.comment + "<br />" +
                                                "Order : " + log.order + "<br />" +
                                                "Vibe : " + log.vibe + "<br />" +
                                                "Type of Call : " + log.callType + "<bt />" +
                                                "Type of Customer : " + type + "<br />" 
                                        }
                                        SendEmail(email, bodyContent, false);
                                        console.log("Copy Email Sent")
                                    }

                                    
                                   //  Send ICS file With call log data
                                    if( req.body.date != "" && req.body.date != null){
                                        console.log('Date Schedule Call',req.body.date);
                                        SendIcsEmail(email, req.body.date, userContent, req.headers['timezone'], log.customerName);
                                    }  

                                 //   SendIcsEmail(email, req.body.date, userContent, req.headers['timezone'],log.customerName);

                                    res.json({ 'code': 200, 'status': 'success', 'message': 'Record created successfully' });
                                    console.log("Record updated");
                                    return;
                                } else {
                                    console.log("error", err);
                                    res.json(st.addcalllog.createRecord);
                                    return;
                                }
                            });

                        } else {
                            res.json({ 'code': 103, 'status': 'error', 'message': msg });
                            return;
                        }
                    });


            }
        } else {
            console.log('Error ', err);
        }
    })
}


function CreateCustomer(name, loc, con, salesmanId, cusId, callback) {
    var customerName = name;
    var location = loc;
    var contact = con;
    var customerId = cusId;
   // console.log('customerId', customerId);
    if (customerId) {
        if (customerId.match(/^[0-9a-fA-F]{24}$/)) {
            var query = { _id: customerId }
            console.log("Custoemer Id...",customerId );
        }else{
            console.log("Invalid Custoemer Id",customerId );
            callback(false, st.addcallLog.validId.message); 
            return;
        }
    } else {
        console.log("Empty Custoemer Id.");
        callback('Prospect', '');  
        return;     
    }
    
    //  var custName = String(customerName).replace(/([.*+?=^!:${}()|[\]\/\\])/g, '\\$1');
    // models.customer.find({ "customerName": { $regex: '.*' + custName + '.*', $options: 'i' } },
    /* Finds Customer based on CustomerID, if found update contact, location and customerType. */
    models.customer.find(query,
        function(err, data) {
            if (!err) {
             //   console.log('customer data', data);
                if (data.length > 0) {
                    console.log('customer found');
                    models.user.update({ _id: salesmanId }, {
                        $set: { customerType: "customer" }
                    }, function(err, data) {
                        if (!err) {
                            console.log('updated');
                        } else {
                            console.log('Error', err);
                        }
                    })

                  //  console.log('data:', data );
                    function findContact(data, con) {
                        if (data[0].contact.indexOf(con) !== -1) {
                          return true;
                        } else {
                          return false;
                        }
                      } 

                     
                  //  console.log('Contact Name :', findContact(data,con));
                    if(findContact(data, con ) == false){
                        models.customer.update({ _id: data[0]._id }, { $push: { contact: contact } }, function(err, up) {
                            if (!err) {
                                console.log('updated')
                            } else {
                                console.log('Error', err);
                            }
                        })
                      console.log('contact created');  
                   }
                    models.customer.update({ _id: data[0]._id }, { $set: { customerType: "customer", customerLocation: location } }, function(err, up) {
                        if (!err) {
                            callback('customer', '');
                        } else {
                            callback(false, err);
                        }
                    })
                } else {
                    callback('Prospect', '');
                }
            } else {
                console.log('Error', err);
                callback(false, st.addcalllog.findCustomer.message);
            }
        });
    // }
}


exports.gatcallbydate = function(req, res) {
    // var salesmanContact = req.query.salesmanContact;
    var date = req.query.date;
    var page = req.query.page;
    var email = req.query.email || req.user.email;

    var teamMemberCount, memberStarttime, memberEndtime, teamStarttime, teamEndtime, averageCallLog, rank;
    var allRecord = [];
    var result = [];

    if (!req.query.date || req.query.date == "" || req.query.date == undefined) {
        res.json(st.addcallLog.date);
        return;
    } else {
        if (!fun.checkDate(date)) {
            //date is not valid with format like DD-MMM-YYYY
            res.json(st.getcallbydate.dateFormat);
            return;
        } else {
            models.user.find({ email: email }, function(err, currUser) {
                if (!err) {
                    if (currUser.length > 0) {
                        var region = currUser[0].region;
                        if (region) {
                            models.teamRecords.find({ "date": date }, function(err, res_data) {
                                if (!err) {
                                    if (res_data.length > 0) {
                                        console.log('Total Logs',res_data);
                                        getSalesmanRecord(email, function(response) {
                                            if (response) {
                                                calculateOpration(response, function(data) {
                                                    getAllRecordCountByDate(date, region,
                                                        function(response) {
                                                            if (response.length > 0) {
                                                             //   console.log('going for getAllRecordCountByDate');
                                                                calculateOprationOfRank(response, email, function(rank_data) {
                                                                    result.push(
                                                                        rank_data,
                                                                        data[0].memberStarttime,
                                                                        data[0].memberEndtime,
                                                                        res_data[0].teamStarttime,
                                                                        res_data[0].teamEndtime,
                                                                        res_data[0].averageCallLog,
                                                                        res_data[0].totalCallLog
                                                                    );
                                                            //        console.log("result", result);
                                                                    var array = [];
                                                                    array.push({
                                                                        rank: result[0],
                                                                        memberFirstcall: result[1],
                                                                        memberLastcall: result[2],
                                                                        teamFirstcall: result[3],
                                                                        teamLastcall: result[4],
                                                                        averageCallLog: result[5],
                                                                        totalTeamMember: response.length,
                                                                        totalCallLog: result[6],
                                                                        region: region,
                                                                        email: email
                                                                    });

                                                                    res.json({ 'code': 200, 'message': 'success', 'data': array });
                                                                //    console.log('final result', array);
                                                                    return;
                                                                });
                                                            } else {
                                                                res.json({ 'code': 200, 'message': 'success', 'data': [] });
                                                             //   console.log('final result', []);
                                                                return;
                                                            }
                                                        });


                                                });
                                            } else {
                                                getAllRecordCountByDate(date, region,
                                                    function(response) {

                                                        result.push(
                                                            "0",
                                                            "",
                                                            "",
                                                            res_data[0].teamStarttime,
                                                            res_data[0].teamEndtime,
                                                            res_data[0].averageCallLog,
                                                            "0"
                                                        );
                                                      //  console.log("result", result);
                                                        var array = [];
                                                        array.push({
                                                            rank: result[0],
                                                            memberFirstcall: result[1],
                                                            memberLastcall: result[2],
                                                            teamFirstcall: result[3],
                                                            teamLastcall: result[4],
                                                            averageCallLog: result[5],
                                                            totalTeamMember: response.length,
                                                            totalCallLog: result[6],
                                                            region: region,
                                                            email: email
                                                        });

                                                        res.json({ 'code': 200, 'message': 'success', 'data': array });
                                                      //  console.log('final result', array);
                                                        return;
                                                    });
                                            }
                                        });
                                    } else {
                                        getTeamData(date, function(data) {
                                            if (data) {
                                                var log = new models.teamRecords();
                                                log.teamStarttime = data.teamStarttime;
                                                log.teamEndtime = data.teamEndtime;
                                                log.averageCallLog = data.averageCallLog;
                                                log.date = data.date;
                                                log.save(function(err, data) {
                                                    if (!err) {
                                                        if (data) {
                                                            console.log("record inserted success", data);
                                                            res.json({ 'code': 200, 'status': 'success', 'message': 'Record inserted success' });
                                                            return;
                                                        } else {
                                                            console.log('null')
                                                        }
                                                    } else {
                                                        console.log("error", err);
                                                        res.json({ 'code': 500, 'status': 'error', 'message': 'Internal server error : Error for insert record ' });
                                                        return;
                                                    }
                                                });
                                            } else {
                                                res.json(st.getcallbydate.recordNotfound);
                                                return;
                                            }
                                        });
                                    }
                                } else {
                                    console.log('Error', err);
                                    res.json(st.internalServer);
                                    return;
                                }
                            });
                        } else {
                            res.json({ 'code': 111, 'status': 'error', 'message': 'Current user region not found' });
                            return;
                        }
                    } else {
                        res.json({ code: 111, status: 'error', message: 'No user found with this email' });
                        return;
                    }
                } else {
                    console.log('Error for selecting current user', err);
                    res.json(st.getcallbydate.currentUser);
                    return;
                }
            })
        }
    }
}


exports.getcallbydate1 = function(req, res){
    var timezone = req.headers['timezone'];
    var date = req.query.date;
    var page = req.query.page;
    var email = req.query.email || req.user.email;

    var teamMemberCount, memberStarttime, memberEndtime, teamStarttime, teamEndtime, averageCallLog, rank, totalCallLog;
    var allRecord = [];
    var result = [];

    if (!req.query.date || req.query.date == "" || req.query.date == undefined) {
        res.json(st.addcallLog.date);
        return;
    } else {
        if (!fun.checkDate(date)) {
            //date is not valid with format like DD-MMM-YYYY
            res.json(st.getcallbydate.dateFormat);
            return;
        } else {
            models.user.find({ email: email }, function(err, currUser) {
                if (!err) {
                    if (currUser.length > 0) {
                        var region = currUser[0].region;
                        console.log('region Email', region + ''+ date);
                        if (region) {
                          /* Finding all call logs based on region*/
                            models.callLogs_table.find(
                            {   
                                $and : [{region:region},{created_at:date}]
                            }).sort({'time':1}).exec(function(err,data){

                            if(!err){  
                               if(data != null && data.length > 0) {
                                    var lastIndex = data.length - 1;
                                    totalCallLog = data.length;
                                    teamStarttime = data[0].time;
                                    teamEndtime = data[lastIndex].time;
                                    createdAt = data[0].created_at;
                                    var currentUserCalls= [];
                                    var uniqueCalls= [{}];
                                    for(i=0;i<totalCallLog;i++)
                                    {   
                                        if(uniqueCalls.indexOf(data[i].email) === -1){
                                            uniqueCalls.push(data[i].email);        
                                        }        

                                        if(data[i].email == email){
                                        currentUserCalls.push({
                                            "time": data[i].time
                                        })
                                    }
                                    }
                                
                                           
                                    
                                    /* Calculate Rank Based on Number */
                                    var result = Object.values(data.reduce((a, c) => {
                                        (a[c.email] || (a[c.email] = {email: c.email, rank: 0})).rank++;
                                        return a;
                                    }, {})).sort((a, b) => b.rank - a.rank);
                                    
                                    result.forEach((r, i) => r.rank = i + 1);
                                    
                                    var ranks = result.length;

                                    for(var j=0;j<result.length;j++){
                                        if(result[j].email == email) {
                                            rank = result[j].rank;
                                            break;
                                        }
                                    }

                                    var teamMemberCount = uniqueCalls.length; 
                                    var cuSize =  currentUserCalls.length; 
                                    /* Number of current user call logs */
                                    if(currentUserCalls.length != 0){
                                        memberStarttime = currentUserCalls[0].time;
                                        memberEndtime = currentUserCalls[cuSize-1].time

                                        newmemberStarttime = convertToTwelvehours(memberStarttime, createdAt);
                                        newmemberEndtime = convertToTwelvehours(memberEndtime, createdAt);
                                    }
                                    else {
                                        
                                        newmemberStarttime = "00:00";
                                        newmemberEndtime = "00:00";
                                    }


                                   
                                    averageCallLog = totalCallLog/teamMemberCount;                                   
                                    newteamStarttime =   convertToTwelvehours(teamStarttime, createdAt); 
                                    newteamEndtime =     convertToTwelvehours(teamEndtime, createdAt); 

                                    var array = [];
                                        array.push({
                                            rank: rank,
                                            memberFirstcall: newmemberStarttime,
                                            memberLastcall: newmemberEndtime,
                                            teamFirstcall: newteamStarttime,
                                            teamLastcall: newteamEndtime,
                                            averageCallLog: averageCallLog,
                                            totalTeamMember: teamMemberCount,
                                            totalCallLog: totalCallLog,
                                            region: region,
                                            email: email
                                        });
                                    

                                        console.log('Number of call logs based on region', newteamEndtime);
                                        res.json({
                                            code : 200,
                                            message : "success",
                                            data : array
                                        });
                                        return;
                                     }
                                      else {
                                        
                                        res.json(st.getcallbydate.findCallLog);
                                        return;
                                      }
                            }else {
                                
                                res.json(st.getcallbydate.findDatafromcallLog);
                                return;
                            }
                            
                        });  
                         

                        }
                        else{
                             /* User's region is not found. */
                           
                            res.json(st.getcallbydate.recordNotfound);
                            return;
                        }
                    }
                    else {
                        /* User not found with given Email */
                        console.log('Error for selecting current user', err);
                        res.json(st.getcallbydate.currentUser);
                        return;
                    }
                }
                else{
                    /* Error in Query */
                    console.log('Error for selecting current user', err);
                    res.json(st.getcallbydate.currentUser);
                    return;
                }
            });      
           
        }
    }

}


exports.getlocation = function(req, res) {
    var customerName = req.params.customerName;
    console.log('name', customerName);
    if (!customerName) {
        res.json(st.addcallLog.salesmanName);
        return;
    } else {
        models.customer.find({ 'customerName': customerName },
            function(err, resLoc) {
                if (!err) {
                    if (resLoc.length > 0) {
                        res.json({ 'code': 200, 'status': 'success', 'message': 'Customer location found ', 'data': resLoc });
                        return;
                    } else {
                        res.json(st.getlocation.customerLocaltionNotfound);
                        return;
                    }
                } else {
                    res.json(st.getlocation.customerLocaltion);
                    return;
                }
            });
    }
}

function getTeamData(date, callback) {
    models.callLogs_table.find({ 'created_at': date }).distinct('email', function(err, res) {
        if (!err) {
            console.log('callLogs_table res', res);
            if (res.length > 0) {
                var teamMemberCount = res.length;
                getAllRecord(date, function(response) {
                    console.log('getAllRecord', response);
                    if (response) {
                        var teamStarttime = response[0].time;
                        var teamEndtime = response[response.length - 1].time;
                        var averageCallLog = response.length / teamMemberCount;
                        var data = {
                            teamStarttime: teamStarttime,
                            teamEndtime: teamEndtime,
                            averageCallLog: averageCallLog,
                            date: date
                        }
                        console.log('data', data);
                        return callback(data);
                    } else {

                        //   res.json(st.getcallbydate.findCallLog);
                        callback(false, st.getcallbydate.findCallLog.message);
                    }
                });
            } else {
                console.log('no match with today date');
                callback(false, 'No recorde found with current date');
            }

        } else {
            console.log('err', err);
            return callback(false, st.getcallbydate.findDatafromcallLog.message);
        }
    });
}

function getAllRecord(passingDate, callback) {

    models.callLogs_table.find({ 'created_at': passingDate }, function(err, res) {
        if (!err) {
            if (res.length > 0) {
                return callback(res);
            } else {
                console.log('getAllRecord not found');
                return callback(false);
            }
        } else {
            console.log("err", err);
            return callback("[]");
        }
    });
}


function getSalesmanRecord(email, callback) {
    models.callLogs_table.find({ 'email': email }, function(err, res) {
        if (!err) {
          //  console.log('callLogs_table res', res);
            if (res.length > 0) {
                return callback(res);
            } else {
            //    console.log('Salesman res not found');
                return callback(false);
            }
        } else {
           //console.log("err", err);
            return callback("[]");
        }
    });
}

function calculateOpration(allRecord, callback) {
    var memberStarttime = allRecord.length > 0 ? allRecord[0].time : "";
    var memberEndtime = allRecord.length > 0 ? allRecord[allRecord.length - 1].time : "";

    var data = [];
    data.push({
        memberStarttime: memberStarttime,
        memberEndtime: memberEndtime
    })
  //  console.log('calculateOpration', data);
    return callback(data);
}


function getAllRecordCountByDate(passingDate, region, callback) {
    // 
    models.callLogs_table.aggregate(
        [   { $sort: { created_at: -1 } },
            { $match: { $and: [{ created_at: passingDate }, { region: region }] } },
            {
                $group: {
                        _id: '$email',
                        total_products: { $sum: 1 }
                    },
            },
        ],
        function(err, data) {
            if (!err) {
                console.log('getAllRecordCountByDate', data);
                return callback(data);
            } else {
                console.log("err", err);
                return callback("[]");
            }
        });
}

function calculateOprationOfRank(allRecord, email, callback) {
    console.log('allRecord', allRecord, email);
    for (var i = 0; i < allRecord.length; i++) {
     //   console.log(allRecord[i]._id, '==', email);
        if (allRecord[i]._id == email) {
            rank = i + 1;
            return callback(rank);
            break;
        } else {
            rank = i;
        }
    }
}


exports.searchcust = function(req, res) {
    var customerName = req.params.customerName;
    models.customer.find({ "customerName": { $regex: "^" + customerName, $options: 'i' } }).sort({customerName : 1}).exec(
        function(err, data) {
            if (!err) {
              
                
                
                if (data.length > 0) {
                    res.json({ 'code': 200, 'status': 'success', 'message': 'customer data found', 'data': data });
                    return;
                } else {
                    res.json({ code: 101, start: 'error', message: 'Result data is blank', data: [] });
                    return;
                }
            } else {
                res.json(st.getdataFromCust);
                return;
            }
        }
    )
}


exports.searchcontact = function(req, res) {
    var customerName = req.query.customerName;
    var contactName = req.query.contactName;

    // if (customerName.length >= 3) {
    models.customer.find({
            $and: [{ "contact": { $regex: '.*' + contactName + '.*', $options: 'i' } },
                { "_id": customerName }
            ]
        },
        function(err, data) {
            if (!err) {

                

                if (data.length > 0) {
                   
                    var temp = data[0].contact;
                    var templst = [];
                    
                    for (var index = 0; index < temp.length; index++) {
                            if (temp[index].toLowerCase().indexOf(contactName.toLowerCase()) != -1) {
                                templst.push(temp[index]);
                            }
                    }

                    data[0].contact = [];
                    data[0].contact = templst;

                    res.json({ 'code': 200, 'status': 'success', 'message': 'contact data found', 'data': data });
                    return;
                    
                } else {
                    res.json({ code: 101, start: 'error', message: 'Result data is blank', data: [] });
                    return;
                }
            } else {
                res.json(st.getdataFromCust);
                return;
            }
        });
    // } else {
    //     res.json(st.enter3Char);
    //     return;
    // }
}

function SendEmail(email, data, userEmail) {
    sgMail.setApiKey(SENDGRID_API_KEY);
    const msg = {
        to: email,
        from: adminEmail,
        subject: data.subject,
        text: data.text,
        html: userEmail ? data.html.replace("ReplaceMe", userEmail) : data.html,
    };
    console.log('email message to send', msg)
    sgMail.send(msg, function(err, sended) {
        if (!err) {
            console.log('Insida SendEmail Function - Email Sent.');
        } else {
            console.log('Error', err);
        }
    });
}

function SendIcsEmail(email, date, data,timezone,customerName) {
   
   console.log('ics tz',timezone)
    var fmt   = "MM/DD/YYYY h:mm:ss A";  // must match the input
    // TimeZone Format  = "Asia/Kolkata";

    // construct a moment object
    var m = moment.tz(date, fmt, timezone).utc().format(fmt);
    date1 = new Date(m);
    
    const event = {
        start: [date1.getFullYear(), date1.getMonth() + 1, date1.getDate(), date1.getHours(), date1.getMinutes()],
        duration: { minutes: 30 }, //hours: date.getHours(),
        title: 'Schedule call to customer: '+ customerName,
        description: data.html,
        //location: 'Folsom Field, University of Colorado (finish line)',
        //url: 'http://www.bolderboulder.com/',
        //geo: { lat: 40.0095, lon: 105.2669 },
        //categories: ['10k races', 'Memorial Day Weekend', 'Boulder CO'],
        //status: 'CONFIRMED',
    }
    console.log("ICS date" ,event);
    var sg = require('sendgrid')(SENDGRID_API_KEY);
    ics.createEvent(event, (err, calendar) => {
        if (!err) {
            var helper = require('sendgrid').mail;
            var fromEmail = new helper.Email(adminEmail);
            var toEmail = new helper.Email(email);
            var subject = data.subject;
            var content = new helper.Content('text/html', data.html);
            var mail = new helper.Mail(fromEmail, subject, toEmail, content);
            var base64Content = new Buffer(calendar).toString('base64');
            mail.attachments = [{ 'filename': 'calendar.ics', 'content': base64Content, 'type': 'text/Calendar' }]
            var requestBody = mail.toJSON();
            var request = sg.emptyRequest();
            request.method = 'POST';
            request.path = '/v3/mail/send';
            request.body = requestBody;
            sg.API(request, function(error, response) {
                if (error) {
                    console.log('Error response received');
                } else {
                    console.log("Inside SendICSmail Function - successfully");
                }
            });
        } else {
            console.log('Error for Creating Event', err);
        }
    });
}