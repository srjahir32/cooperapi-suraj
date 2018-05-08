var models = require("../db.js");
var json2xls = require('json2xls');
var fs = require('fs');
var nodemailer = require('nodemailer');
var SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(SENDGRID_API_KEY);
var adminEmail = "noreply@applabs.media";



exports.genrate_excel = function() {
    models.callLogs_table.find({}, function(err, data) {
        if (!err) {
            getTeamData(getDate(new Date()), function(data) {
                console.log('data', data);
                var today_date = new Date();
                models.teamRecords.find({ "date": getDate(today_date) }, function(err, TeamData) {
                    if (!err) {
                        if (TeamData.length > 0) {
                            console.log('update old log', getDate(today_date));
                            var log = {
                                teamStarttime: data.teamStarttime,
                                teamEndtime: data.teamEndtime,
                                averageCallLog: data.averageCallLog,
                                date: data.date,
                                totalCallLog: data.totalCallLog
                            }
                            models.teamRecords.update({ "date": getDate(today_date) }, { $set: log },
                                function(err, data) {
                                    if (!err) {
                                        console.log("record inserted success", data);
                                        return;
                                    } else {
                                        console.log("error", err);
                                        return;
                                    }
                                });
                        } else {
                            console.log('Insert new log');
                            var log = new models.teamRecords();
                            log.teamStarttime = data.teamStarttime;
                            log.teamEndtime = data.teamEndtime;
                            log.averageCallLog = data.averageCallLog;
                            log.date = data.date;
                            log.totalCallLog = data.totalCallLog;
                            log.save(function(err, data) {
                                if (!err) {
                                    console.log("record inserted success", data);
                                    return;
                                } else {
                                    console.log("error", err);
                                    return;
                                }
                            });

                        }
                    } else {
                        console.log('Error', err);
                    }
                });

            });
          
            create_excel(function(genrated) {
                if (genrated) {
                    console.log('success');
                }
            });

        } else {
            console.log('Error', err);
        }
    });
}


// exports.genrate_excel = function(req, res) {
//     create_excel(function(data) {
//         if (data) {
//             res.json({ 'code': 200, 'status': 'success', 'message': 'Excel sheet gererated' });
//             return;
//         }
//     })
// }


function create_excel(callback) {

    var d = new Date(); // Today!
    d.setDate(d.getDate() - 1);
    console.log('Yesterday - ' ,d);

    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = d.getFullYear();
    var month = months[d.getMonth()];
    var date = d.getDate();
    var hour = d.getHours();
    var min = d.getMinutes();
    var sec = d.getSeconds();
    var mid;
    if (hour == 0 && hour < 12) {
        mid = "AM";
    } else if (hour >= 12) {
        mid = 'PM';
    }

    var Date_at = date + '-' + month + '-' + year;
    var time = hour + ':' + min + ':' + sec + ' ' + mid;
    
    models.callLogs_table.find({ 'created_at': Date_at }, function(err, data) {
        if (!err) {
            var ele = [];
            data.forEach(function(element) {
                if (element.order == "yes") {
                    var order = 'Y'
                } else {
                    var order = 'N'
                }
                ele.push({
                    //_id: element._id,
                    "Date": element.created_at,
                    "Time": element.time,
                    "Salesman": element.salesmanName,
                    "Customer name": element.customerName,
                    "Contact name": element.contact,
                    "Customer type": element.customerType,
                    "Call Type" : element.callType,
                    "Location" : element.location,
                    "Latitude" : element.latitude,
                    "Longitude": element.longitude,
                    //Site Location
                    "Commets": element.comment,
                    "Order Y/N": order,
                    "Happy/Sad": element.vibe,
                    //salesman_contact: element.salesman_contact,
                })
            });
            // Create xlsx file from here
            var xls = json2xls(ele);
            fs.writeFileSync('salesman_contact.xlsx', xls, 'binary');
            var data = fs.readFileSync('salesman_contact.xlsx');
            // "srjahir32@gmail.com"
            var allemails = ["anshul@applabs.media", "g.anshul@gmail.com","bspilak@cooperequipment.ca"];
            sendMail(allemails, data);
            callback(true);
        } else {
            console.log('Error', err);
        }
    });
}

function sendMail(toMail, data) {
    var date = new Date();
    date.setDate(date.getDate() - 1);
    var dd = date.getDate();
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var mm = months[date.getMonth()];
    var yy = date.getFullYear();

   
    var dmy = dd + '-' + mm + '-' + yy;
    console.log("Email Yesterday", dmy);
    const msg = {
        to: toMail,
        from: adminEmail,
        subject: "Sales call report",
        text: "Please find your daily sales call report.",
        attachments: [{
            filename: 'salesCallReport-' + dmy + '.xlsx', // required only if file.content is used.
            content: data.toString('base64') //
        }],
    };
    sgMail.send(msg, function(err, sended) {
        if (!err) {
            console.log('Sent successfully');
        } else {
            console.log('Error', err);
        }
    });
}

function getDate(a) {
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var mid;
    if (hour == 0 && hour < 12) {
        mid = "AM";
    } else if (hour >= 12) {
        mid = 'PM';
    }

    var Date_at = date + '-' + month + '-' + year;
    var time = hour + ':' + min + ':' + sec + ' ' + mid;
    return Date_at;
}

function getPreviousDate(a) {
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate() - 1;
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var mid;
    if (hour == 0 && hour < 12) {
        mid = "AM";
    } else if (hour >= 12) {
        mid = 'PM';
    }

    var Date_at = date + '-' + month + '-' + year;
    var time = hour + ':' + min + ':' + sec + ' ' + mid;
    return Date_at;
}


function getTeamData(date, callback) {
    models.callLogs_table.find({ 'created_at': date }).distinct('salesmanContact', function(err, res) {
        if (!err) {
            var teamMemberCount = res.length;

            getAllRecord(date, function(response) {
                if (response.length > 0) {
                    var teamStarttime = response[0].time;
                    var teamEndtime = response[response.length - 1].time;
                    var averageCallLog = response.length / teamMemberCount;


                    var data = {
                        teamStarttime: teamStarttime,
                        teamEndtime: teamEndtime,
                        averageCallLog: averageCallLog,
                        date: date,
                        totalCallLog: response.length
                    }
                    console.log('data', data);
                    return callback(data);
                } else {
                    console.log('FOR CRONE: There is no any calllogs for today');
                }
            })
        } else {
            console.log('err', err);
        }
    });
}

function getAllRecord(passingDate, callback) {

    models.callLogs_table.find({ 'created_at': passingDate }, function(err, res) {
        if (!err) {
            return callback(res);
        } else {
            console.log("err", err);
            return callback("[]");
        }
    });
}


exports.xlsTodb = function(req, res) {
    var mongoXlsx = require('mongo-xlsx');
    var model = null;
    var xlsx = './customer.xlsx';

    mongoXlsx.xlsx2MongoData(xlsx, model, function(err, data) {
        data.forEach(function(element) {
            console.log('element', element.name);
            var log = new models.customer();
            log.customerName = element.name;
            log.save(function(err, data) {
                if (!err) {
                    console.log('saved');
                    return;
                } else {
                    console.log('Error', err);
                    return;
                }
            });
        });
    });
}



// var filepath = "./salesman_contact.xlsx";
// var smtpTransport = nodemailer.createTransport({
//     host: 'smtp.gmail.com',
//     port: 465,
//     secure: true,
//     service: 'Gmail',
//     auth: {
//         user: 'surajahir18@gmail.com', // Your email id
//         pass: "Sonal_87" // Your password
//     }
// });

// var mailOptions = {
//     from: 'surajahir18@gmail.com', // sender address
//     to: "", // srjahir32@gmail.com,g.anshul@gmail.com // list of receivers
//     subject: 'Email Example', // Subject line

//     attachments: [{
//         filename: 'salesman_contact.xlsx',
//         path: filepath
//     }],
//     html: '<b>salesman_contact ✔</b>' // You can choose to send an HTML body instead
// };
// smtpTransport.sendMail(mailOptions, function(error, info) {
//     if (error) {
//         console.log(error);

//     } else {
//         console.log('Message sent: ' + info.response);

//     };
// });
