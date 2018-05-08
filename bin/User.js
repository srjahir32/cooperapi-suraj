var models = require("../db.js");
var validator = require('validator');
var bcrypt = require('bcrypt-nodejs');
var jwt = require("jsonwebtoken");
var config = require('../config/config.js');
var SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const sgMail = require('@sendgrid/mail');
var parseXlsx = require('excel');
var multer = require('multer');
var fs = require('fs');
var moment = require('moment-timezone');

// log.customerType = "Prospect"

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

function AppointmentTime(date){
    var n = new Date(date);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    var hours = n.getHours();
    var minutes = n.getMinutes();
    var seconds = n.getSeconds();
    var year = n.getFullYear();
    var month = n.getMonth();
    var day = n.getDate();
    
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
  
    day = day < 10 ? '0'+day : day;
    var date = day + '-' + months[month] + '-' + year +' '+hours + ':' + minutes + '' + ampm;
    
    return date;
}


function getAdminEmail(callback) {

    models.user.find({ isAdmin: true }, { email: 1 }, function(err, data) {
        if (!err) {
            var email = [];
            for (var i = 0; i < data.length; i++) {
                email.push(data[i].email);
            }
            callback(email)
        } else {
            console.log('erro', err);
        }
    })
}

exports.registration = function(req, res) {
    receivedValues = req.body
    if (JSON.stringify(receivedValues) === '{}') {
        res.send(st.register.bodyisBlank);
        return
    } else {
        usercolumns = ["password", "email", "phone", "region"];
        var storeData = new models.user();
        var checkProfessional = false;
        for (var iter = 0; iter < usercolumns.length; iter++) {
            columnName = usercolumns[iter];
            if (columnName == 'email') {
                email1 = req.body.email;
                if (validator.isEmail(email1)) {
                    console.log('Email is vaild');
                } else {
                    console.log('Email is not valid');
                    res.json(st.register.emailNotValid);
                    return;
                }
            }
            // && (columnName == 'email' || columnName == 'password')
            if ((receivedValues[columnName] == undefined)) {
                if (receivedValues[columnName] == "password") {
                    res.json(st.register.password);
                    return;
                }
                if (receivedValues[columnName] == "email") {
                    res.json(st.register.email);
                    return;
                }
                if (receivedValues[columnName] == "phone") {
                    res.json(st.register.phone);
                    return;
                }
                if (receivedValues[columnName] == "region") {
                    res.json(st.register.region);
                    return;
                }
            } else if (receivedValues[columnName] !== undefined && receivedValues[columnName] !== "" && columnName == 'password') {
                if (req.body.password.length < 8) {
                    console.log(st.register.passwordLength.message);
                    res.json(st.register.passwordLength);
                    return;
                } else {
                    receivedValues.password = bcrypt.hashSync(receivedValues.password, bcrypt.genSaltSync(8))
                }
            }

            if (receivedValues[columnName] == undefined || receivedValues[columnName] == "") {
                storeData[usercolumns[iter]] = '';
            } else {
                storeData[usercolumns[iter]] = receivedValues[columnName];
            }
        }
        storeData["status"] = "pending";
        storeData["flag"] = "active";
        storeData["isAdmin"] = req.body.isAdmin ? true : false;
        console.log('storeData', storeData);

        var email = storeData["email"];
        models.user.find({ email: email }, function(err, data) {
            if (!err) {
                console.log('data', data);
                if (data.length > 0) {
                    console.log('data length', data.length);
                    res.send(st.register.alredyUser);
                    return;
                } else {
                    storeData.save(function(err, insData) {
                        if (!err) {
                            // var customerContenct = {
                            //     text: "Status is pending",
                            //     subject: "Cooper account created",
                            //     html: "<p>Your request has been sent to the admin. Please wait while he approves your request.</p>"
                            // }
                            // var adminContenct = {
                            //     text: "Status change",
                            //     subject: "Cooper account created",
                            //     html: "<p>" + req.body.email + " has requested permission into the app.Please open the console to accept or reject him. </p>"
                            // }



                            SendEmail(email, emailContent.registerToUser, false); //to user
                            getAdminEmail(function(emails) {
                                SendEmail(emails, emailContent.registerToAdmin, req.body.email); //to admin
                            })

                            res.send({ code: 200, status: 'success', 'message': 'User created successfully' });
                            return;
                        } else {
                            console.log('Error for inserting new user', err);
                            res.send(st.register.saveUser);
                            return;
                        }
                    })
                }
            } else {
                console.log('Error', err);
                res.send(st.register.selectUser);
                return;
            }
        })
    }
}
exports.login = function(req, res) {
    var data = ["email", "password"]
    var email = req.body.email;
    var password = req.body.password;
    if (!email) {
        res.send(st.login.email);
        return;
    }
    if (!password) {
        res.send(st.login.password);
        return;
    }
    models.user.find({ email: email }, function(err, data) {
        if (!err) {
            if (data.length > 0) {
                data = data[0];
                console.log('Status', data)
                if (data.status == "approved") {
                    console.log('form Password', req.body.password, 'db password', data.password);
                    console.log('comparepwd', bcrypt.compareSync(req.body.password, data.password));

                    if (bcrypt.compareSync(req.body.password, data.password)) {
                        var receivedValues = {
                            userId: data._id,
                            email: data.email
                        }
                        var token = jwt.sign(receivedValues, config.secret, {
                            expiresIn: 1440 * 60 * 30 // expires in 1440 minutes
                        });
                        console.log("*** Authorised User");
                        res.json({
                            "code": 200,
                            "status": "success",
                            "token": token,
                            "userData": data,
                            "message": "Authorised User!"
                        });
                        return;
                    } else {
                        console.log("*** Redirecting: Your password is incorrect.");
                        res.json(st.login.passwordNotValid);
                        return;
                    }
                } else {
                    res.send({ code: 101, status: 'error', message: 'Your profile is under review, please wait till its approved' });
                    return;
                }
            } else {
                res.send(st.login.noUserWithEmail);
                return;
            }
        } else {
            console.log('Error for selecting from user table', err);
            res.send(st.login.selectingdata);
        }
    })
}

exports.forgotPassword = function(req, res) {
    var email = req.body.email;
    models.user.find({ email: email }, function(err, data) {
        if (!err) {
            if (data.length > 0) {
                var OTP = Math.floor(1000 + Math.random() * 9000);
                console.log('Reset OTP generated-1', OTP);
                checkWithOtp(OTP);

                function checkWithOtp(otp) {
                    var otptoUpdate = otp;
                    models.user.find({ otp: otp }, function(err, oldOtp) {
                        if (!err) {
                            if (oldOtp.length > 0) {
                                var otp = Math.floor(1000 + Math.random() * 9000);
                                checkWithOtp(otp);
                            } else {
                                // var userContent = {
                                //     text: "Status is pending",
                                //     subject: "Cooper reset password",
                                //     html: "<p>Password reset OTP number is <b>" + otptoUpdate + " </b></p>"
                                // }
                                console.log('OTP', OTP);
                                console.log('otptoUpdate', otptoUpdate);

                                SendEmail(email, emailContent.forgotPasswordOtp, otptoUpdate);
                                models.user.update({ email: email }, { $set: { otp: otptoUpdate } },
                                    function(err, updated) {
                                        if (!err) {
                                            res.send({ code: 111, status: 'success', message: 'OTP send successfully' });
                                            return;
                                        } else {
                                            console.log('Error', err);
                                            res.send({ code: 111, status: 'error', message: 'Error for sending OTP' });
                                            return;
                                        }
                                    });
                            }
                        } else {
                            res.send(422).json({ status: 'error', message: 'Error for find using OTP' });
                            return;
                        }
                    })
                }
            } else {
                console.log('Email not found');
                res.send(st.forgotPassword.notFoudWithEmail);
                return;
            }
        }
    });
}

// OTP 6932
exports.resetPasswordOTP = function(req, res) {
    var otp = req.body.otp;
    var password = req.body.password;
    var confPassword = req.body.confPassword;
    if (!otp) {
        res.send(st.resetPasswordOTP.otp);
        return;
    }
    if (!password) {
        res.send(st.login.password);
        return;
    }
    if (!confPassword) {
        res.send(st.resetPasswordOTP.confPassword);
        return;
    }
    if (password != confPassword) {
        res.send(st.resetPasswordOTP.confPasswordMatch);
        return;
    }

    console.log('request body password', req.body.password);
    console.log('unencrypted password', password);

    models.user.find({ otp: otp }, function(err, data) {
        if (!err) {
            if (data.length > 0) {

                var password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8));
                console.log('reset encrypted Password', password, 'email', data[0].email)
                models.user.update({ email: data[0].email }, { $set: { password: password, otp: "" } },
                    function(err, up) {
                        if (!err) {
                            res.send({ code: 200, status: 'success', message: 'Password reset successfully' });
                            return;
                        } else {
                            res.send(st.resetPasswordOTP.UpdateUser);
                            return;
                        }
                    });
                // var randomPassword = Math.random().toString(36).slice(-10);
            } else {
                console.log('There is no user found with pro')
                res.send(st.resetPasswordOTP.otpNotMatch);
                return;
            }
        } else {
            console.log('Error for finding ', err);
            res.send(st.resetPasswordOTP.findUser);
            return;
        }
    });
}

exports.resetPassword = function(req, res) {
    var email = req.user.email;
    var oldPassword = req.body.oldPassword;
    var newPassword = req.body.newPassword;

    if (!oldPassword) {
        res.send(st.resetPassword.oldPasswordRequired);
        return;
    }
    if (!newPassword) {
        res.send(st.resetPassword.newPasswordRequired);
        return;
    }

    models.user.find({ email: email }, function(err, data) {
        if (!err) {
            if (data.length > 0) {
                data = data[0];
                if (bcrypt.compareSync(oldPassword, data.password)) {
                    console.log('password match');
                    var password = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(8))
                    models.user.update({ _id: data._id }, { $set: { password: password } },
                        function(err, updated) {
                            if (!err) {
                                res.status(200).json({ status: 'success', message: 'Password changed successfully!' });
                                return;
                            } else {
                                console.log('Error', err);
                                res.send(st.resetPassword.passwordChange);
                                return;
                            }
                        });
                } else {
                    res.send(st.resetPassword.oldPassword);
                    return;
                }
            } else {
                res.json({ code: 101, status: 'error', message: 'User not found with this email' });
                return;
            }
        } else {
            console.log(st.resetPassword.selectUserData.message, err);
            res.send(st.resetPassword.selectUserData);
            return;
        }
    })
}
exports.profileApproval = function(req, res) {
    var email = req.body.email;
    if (!email) {
        res.send(st.login.email);
        return;
    } else {
        models.user.find({ email: email }, function(err, data) {
            if (!err) {
                data = data[0];
                if (data.status != "approved") {
                    models.user.update({ _id: data._id }, { $set: { status: "approved" } },
                        function(err, StatUpdate) {
                            if (!err) {
                                // var userContent = {
                                //     text: "Approved profile",
                                //     subject: "Cooper profile Approved",
                                //     html: "<p>You account has been approved. Please login to app.</p>"
                                // }
                                SendEmail(email, emailContent.profileApprovalEmail, false);

                                res.status(200).json({ status: 'success', message: 'Status update successfully' });
                                return;
                            } else {
                                res.send(st.profileApproval.updateStatus);
                                return;
                            }
                        });
                } else {
                    res.send(st.profileApproval.userApproved);
                    return;
                }
            } else {
                console.log(st.profileApproval.emailNotFound.message);
                res.send(st.profileApproval.emailNotFound);
                return;
            }
        })
    }
}
exports.rejectUser = function(req, res) {
    var email = req.body.email;
    if (!email) {
        res.send(st.login.email);
        return;
    } else {
        models.user.find({ email: email }, function(err, data) {
            if (!err) {
                if (data.length > 0) {
                    data = data[0];
                    if (data.isAdmin) {
                        res.json({ code: 101, status: 'error', message: 'Can not reject to admin' });
                        return;
                    } else {
                        // if (data.status != "approved") {
                        models.user.remove({ _id: data._id },
                            function(err, StatUpdate) {
                                if (!err) {
                                    // var userContent = {
                                    //     text: "Reject profile",
                                    //     subject: "Cooper profile rejected",
                                    //     html: "<p>Your account has been rejected.</p>"
                                    // }
                                    SendEmail(email, emailContent.rejectUserEmail, false);

                                    res.status(200).json({ status: 'success', message: 'Profile rejected successfully' });
                                    return;
                                } else {
                                    res.json({ code: 104, status: 'error', message: 'Error for remove profile' })
                                    return;
                                }
                            });
                        // } else {
                        //     res.send(st.profileApproval.userApproved);
                        //     return;
                        // }
                    }
                } else {
                    console.log('Profile not found with provided email');
                    res.json({ code: 104, status: 'error', message: 'Profile not found with provided email' })
                    return;
                }
            } else {
                console.log(st.profileApproval.emailNotFound.message);
                res.send(st.profileApproval.emailNotFound);
                return;
            }
        })
    }
}

exports.deleteUser = function(req, res) {
    var email = req.body.email;
    if (!email) {
        res.send(st.login.email);
        return;
    } else {
        models.user.find({ email: email }, function(err, data) {
            if (!err) {
                if (data.length > 0) {
                    data = data[0];
                    if (data.status == "approved") {
                        if (data.isAdmin) {
                            res.json({ code: 101, status: 'error', message: 'Can not delete to admin' });
                            return;
                        } else {
                            deleteMe(data._id)
                        }
                    } else {
                        deleteMe(data._id)
                    }

                    function deleteMe(id) {
                        models.user.remove({ _id: id },
                            function(err, StatUpdate) {
                                if (!err) {
                                    // var userContent = {
                                    //     text: "Reject profile",
                                    //     subject: "Cooper profile Rejected",
                                    //     html: "<p>Your account has been Rejected.</p>"
                                    // }
                                    SendEmail(email, emailContent.deleteUserEmail, false);
                                    res.status(200).json({ status: 'success', message: 'Profile rejected successfully.' });
                                    return;
                                } else {
                                    res.json({ code: 104, status: 'error', message: 'Error for remove profile.' })
                                    return;
                                }
                            });
                    }

                } else {
                    console.log('Profile not found with provided email');
                    res.json({ code: 104, status: 'error', message: 'Profile not found with provided email.' })
                    return;
                }
            } else {
                console.log(st.profileApproval.emailNotFound.message);
                res.send(st.profileApproval.emailNotFound);
                return;
            }
        })
    }
}

exports.deactiveUser = function(req, res) {
    var email = req.body.email;
    if (!email) {
        res.send(st.login.email);
        return;
    } else {
        models.user.find({ email: email }, function(err, data) {
            if (!err) {
                data = data[0];
                if (data.status != "pending") {
                    if (data.flag != "deactive") {
                        models.user.update({ _id: data._id }, { $set: { flag: "deactive" } },
                            function(err, StatUpdate) {
                                if (!err) {
                                    // var userContent = {
                                    //     text: "Deactivated profile",
                                    //     subject: "Cooper profile Deactivated",
                                    //     html: "<p>You account has been deactivated.</p>"
                                    // }
                                    SendEmail(email, emailContent.deactiveUserEmail, false);

                                    res.status(200).json({ status: 'success', message: 'User update successfully to deactive.' });
                                    return;
                                } else {
                                    res.send(st.profileApproval.updateStatus);
                                    return;
                                }
                            });
                    } else {
                        res.send({ code: 101, status: 'error', message: 'User already deactivated.' });
                        return;
                    }
                } else {
                    res.send(st.profileApproval.userPending);
                    return;
                }
            } else {
                console.log(st.profileApproval.emailNotFound.message);
                res.send(st.profileApproval.emailNotFound);
                return;
            }
        })
    }
}

exports.activeUser = function(req, res) {
    var email = req.body.email;
    if (!email) {
        res.send(st.login.email);
        return;
    } else {
        models.user.find({ email: email }, function(err, data) {
            if (!err) {
                data = data[0];
                if (data.status != "pending") {
                    if (data.flag != "active") {
                        models.user.update({ _id: data._id }, { $set: { flag: "active" } },
                            function(err, StatUpdate) {
                                if (!err) {
                                    // var userContent = {
                                    //     text: "Active profile",
                                    //     subject: "Cooper profile Active",
                                    //     html: "<p>You account has been active.</p>"
                                    // }
                                    SendEmail(email, emailContent.activeUserEmail, false);

                                    res.status(200).json({ status: 'success', message: 'User update successfully to active' });
                                    return;
                                } else {
                                    res.send(st.profileApproval.updateStatus);
                                    return;
                                }
                            });
                    } else {
                        res.send({ code: 101, status: 'error', message: 'User already active' });
                        return;
                    }
                } else {
                    res.send(st.profileApproval.userPending);
                    return;
                }
            } else {
                console.log(st.profileApproval.emailNotFound.message);
                res.send(st.profileApproval.emailNotFound);
                return;
            }
        })
    }
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
            console.log('Sended successfully');
        } else {
            console.log('Error', err);
        }
    });
}

// var customerName = "PAINTING LTD (4W1096-A1- )";
// customerName = String(customerName).replace(/([.*+?=^!:${}()|[\]\/\\])/g, '\\$1');
// console.log('customerName', customerName);
// models.callLogs_table.find({ "customerName": { $regex: '.*' + customerName + '.*', $options: 'i' } },
//     function(err, tot) {
//         if (!err) {
//             console.log('tot', tot);
//         } else {
//             console.log('Error', err);
//         }
//     });


exports.callLogs = function(req, res) {
    var customerName = req.body.customerName ? String(req.body.customerName).replace(/([.*+?=^!:${}()|[\]\/\\])/g, '\\$1') : false;
    var salesmanName = req.body.salesmanName ? String(req.body.salesmanName).replace(/([.*+?=^!:${}()|[\]\/\\])/g, '\\$1') : false;
    var fromDate = req.body.fromDate;
    var toDate = req.body.toDate;

    var timezone = req.headers['timezone'];

    var record = req.body.record;
    var p = req.body.page;
    if (!record) {
        record = 10;
    }
    if (!p) {
        p = 1
    }
    record = parseInt(record);

    var page = (parseInt(p) - 1) * 10;

    if (!customerName) {
        res.send({ code: 101, status: 'error', message: 'customerName field is required' });
        return;
    }
    if (salesmanName && !fromDate && !toDate) {
        var query = {
            $and: [
                { "salesmanName": { $regex: '.*' + salesmanName + '.*', $options: 'i' } },
                { "customerName": { $regex: '.*' + customerName + '.*', $options: 'i' } }
            ]
        };
    } else if (salesmanName && !fromDate && !toDate) {
        var query = {
            $and: [
                { "salesmanName": { $regex: '.*' + salesmanName + '.*', $options: 'i' } },
                 { "customerName": { $regex: '.*' + customerName + '.*', $options: 'i' } }
                ] 
            };
    } else if (salesmanName && (fromDate || toDate)) {
        if (!fromDate) {
            var fromDate = formatDate(new Date());
        }
        if (!toDate) {
            var toDate = formatDate(new Date());
        }
        var query = { $and: [{ "salesmanName": { $regex: '.*' + salesmanName + '.*', $options: 'i' } }, { "customerName": { $regex: '.*' + customerName + '.*', $options: 'i' } }, { created_at: { $gte: fromDate } }, { created_at: { $lte: toDate } }] }
    } else if (!salesmanName && (fromDate || toDate)) {
        if (!fromDate) {
            var fromDate = formatDate(new Date());
        }
        if (!toDate) {
            var toDate = formatDate(new Date());
        }
        var query = { $and: [{ "customerName": { $regex: '.*' + customerName + '.*', $options: 'i' } }, { created_at: { $gte: fromDate } }, { created_at: { $lte: toDate } }] }
    } else if (!salesmanName && !fromDate && !toDate) {
        var query = { "customerName": { $regex: '.*' + customerName + '.*', $options: 'i' } }
    }
    // console.log('query', query);
    models.callLogs_table.find(query, null, { skip: page },
        function(err, tot) {
            if (!err) {
                var total = tot.length;
                if (page != 0) {
                    var remain = total > record ? total - (page * record) : 0;
                } else {
                    var remain = total > record ? total - record : 0;
                }

                models.callLogs_table.find(query, null, { skip: page, limit: record, sort: { "created_at": -1 } },
                    function(err, data) {
                        if (!err) {
                            console.log('')
                            if (data.length > 0) {
                                var message = "Call log get successfully";
                            } else {
                                var message = "There is no calllog present with this condition. Please check your parameters and try again.";
                            }
                           var array1 = [];
                           for(var i=0; i<data.length; i++){
                               var time =  data[i].time;
                               var date = data[i].created_at;
                               console.log(date);
                               array1.push({
                                "_id": data[i].id,
                                "customerType": data[i].customerType,
                                "region": data[i].region,
                                "salesmanName": data[i].salesmanName,
                                "isCopyEmail": data[i].isCopyEmail,
                                "customerId": data[i].customerId,
                                "callType": data[i].callType,
                                "date": date,
                                "salesmanId": data[i].salesmanId,
                                "time": convertToTwelvehours(time,date),
                                "created_at": data[i].created_at,
                                "order": data[i].order,
                                "vibe": data[i].vibe,
                                "location": data[i].location,
                                "latitude": data[i].latitude,
                                "longitude": data[i].longitude,
                                "comment": data[i].comment,
                                "contact": data[i].contact,
                                "customerName": data[i].customerName,
                                "email": data[i].email,
                                "__v": 0
                               }); 
                          } 

                        console.log('call-logs',array1);
                            res.send({ code: 200, status: 'success', message: message, remain: remain, data: array1 });
                            return;
                        } else {
                            console.log('error', err);
                            res.send(st.callLogs.selectData);
                            return;
                        }
                    });

            } else {

            }
        });
}

//For admin
exports.callLogsadmin = function(req, res) {
    var customerName = req.query.customerName;
    var date = req.query.date;
    var fromDate = req.query.fromDate;
    var toDate = req.query.toDate;
    var region = req.query.region;

    if (!req.body) {
        res.send(st.callLogs.fieldRequired);
        return;
    }
    if (customerName && !date && !fromDate && !toDate && !region) {
        var query = { customerName: customerName };
    } else if (customerName && date && !fromDate && !toDate && !region) {
        var query = { $and: [{ customerName: customerName }, { created_at: date }] };
    } else if (customerName && !date && (fromDate || toDate)) {
        if (!fromDate) {
            var fromDate = formatDate(new Date());
        }
        if (!toDate) {
            var toDate = formatDate(new Date());
        }
        var query = { $and: [{ customerName: customerName }, { created_at: { $gte: fromDate } }, { created_at: { $lte: toDate } }] }
    } else if (!customerName && (date || (fromDate || toDate))) {
        if (date) {
            var query = { created_at: date }
        } else {
            if (!fromDate) {
                var fromDate = formatDate(new Date());
            }
            if (!toDate) {
                var toDate = formatDate(new Date());
            }
            var query = { $and: [{ created_at: { $gte: fromDate } }, { created_at: { $lte: toDate } }] }
        }
    } else if (customerName && region) {
        var query = { $and: [{ customerName: customerName }, { region: region }] };
    } else if (region && !customerName && !date && !fromDate && !toDate) {
        var query = { region: region };
    }
    console.log('customerName', customerName)
    models.callLogs_table.find(query,
        function(err, data) {
            if (!err) {
                if (data.length > 0) {
                    var message = "Call log get successfully";
                } else {
                    var message = "No records found";
                }
                res.send({ code: 200, status: 'success', message: message, data: data });
                return;
            } else {
                res.send(st.callLogs.selectData);
                return;
            }
        });
}

function formatDate(date) {
    date = new Date(date);
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ]
    return date.getDate() + '-' + monthNames[date.getMonth()] + '-' + date.getFullYear();
}

exports.changeRegion = function(req, res) {
    var email = req.body.email;
    var region = req.body.region;

    if (!email) {
        res.send(st.login.email);
        return;
    } else {
        models.user.find({ email: email },
            function(err, data) {
                if (!err) {
                    data = data[0];
                    models.user.update({ _id: data._id }, { $set: { region: region } },
                        function(err, StatUpdate) {
                            if (!err) {
                                // var userContent = {
                                //     text: "Approved profile",
                                //     subject: "Cooper profile Approved",
                                //     html: "<p>You account has been approved. Please login to app.</p>"
                                // }
                                // SendEmail(email, userContent);
                                res.status(200).json({ status: 'success', message: 'Region changed successfully' });
                                return;
                            } else {
                                res.send(st.changeRegion);
                                return;
                            }
                        });
                } else {
                    console.log('Error for selecting data using email');
                    res.send(st.profileApproval.emailNotFound);
                    return;
                }
            })
    }
}

exports.addCustomer = function(req, res) {
    //  console.log('call for upload', req.file);
    var storage = multer.diskStorage({ //multers disk storage settings
        destination: function(req, file, cb) {
            cb(null, __dirname);
        },
        filename: function(req, file, cb) {
            cb(null, file.originalname);
        }
    });

    var upload = multer({ //multer settings
        storage: storage
    }).single('file');

    upload(req, res, function(err, data) {
        if (err) {
            res.json({ error_code: 1, err_desc: err });
            return;
        } else {
            if (req.file) {
                var fileName = req.file.filename;
                var re = /(?:\.([^.]+))?$/;

                var ext = re.exec(fileName)[1];
                console.log('Ext', ext);
                if (ext == "xlsx" || ext == "xls") {
                    console.log('@@@@@@@@@@@@@@@@@@@@ req.file.filename', req.file.filename);
                    var file = __dirname + '/' + req.file.filename;
                    console.log('$$$$$$$$$$$$$$$$$$$$ req.file.filename', req.file.filename);
                    res.status(200).json({ status: 'success', message: 'We have received your file. It will take sometime to reflect in the database. This could take upwards of 10 minutes. Please check in a bit !' });

                    parseXlsx(file, function(err, data) {
                        if (err) {
                            console.log('Error', err);
                        } else {
                            console.log('data', data.length);

                            for (var i = 1; i < data.length; i++) {
                                setTimeout(function(j) {
                                    var name = data[j][0];
                                    var location = data[j][3] || "";
                                    if (name != "") {
                                        models.customer.find({ "id": data[j][0] }, function(err, oldC) {
                                            if (!err) {
                                                if (oldC.length > 0) {
                                                    console.log('*********** Alredy there ', data.length - j);
                                                } else {
                                                    console.log('Saving', data.length - j);
                                                    var log = new models.customer();
                                                    log.id = data[j][0];
                                                    log.customerName = data[j][1];
                                                    log.customerLocation = location;
                                                    log.contact = []
                                                    log.save(function(err, data) {
                                                        if (!err) {
                                                            console.log('saved');
                                                        } else {
                                                            console.log('Error', err);
                                                        }
                                                    });
                                                }
                                            } else {
                                                console.log('Error', err);
                                            }
                                        })
                                    } else {
                                        console.log('name is blank', j, name)
                                    }
                                }, i * 100, i);
                            }
                        }
                    });
                } else {
                    console.log('File must be excel');
                    res.status(200).json({ status: 'error', message: 'File must be excel' });
                    return;
                }
                fs.unlink(file, (err) => {
                    if (err) throw err;
                    console.log('successfully deleted');
                });
            } else {
                res.status(201).json({ 'status': 0, message: 'There is no file' });
                return;
            }

        }
    });
}

exports.getAlluser = function(req, res) {
    models.user.find({}, { password: 0 },
        function(err, allData) {
            if (!err) {
                res.status(200).json({ status: 'success', message: 'User get succssfull', data: allData });
                return;
            } else {
                res.send(st.getAlluser);
                return;
            }
        })
}

var json2xls = require('json2xls');


exports.createExcel = function(req, res) {
    var customerName = req.query.customerName;
    var region = req.query.region;
    var fromDate = req.query.fromDate;
    var toDate = req.query.toDate;

    if (customerName && !region && !fromDate && !toDate) {
        var query = { $and: [{ customerName: customerName }] };
    } else if (customerName && region && !fromDate && !toDate) {
        var query = { $and: [{ customerName: customerName }, { region: region }] };
    } else if (customerName && !region && (fromDate || toDate)) {
        if (!fromDate) {
            var fromDate = formatDate(new Date());
        }
        if (!toDate) {
            var toDate = formatDate(new Date());
        }
        var query = { $and: [{ customerName: customerName }, { created_at: { $gte: fromDate } }, { created_at: { $lte: toDate } }] }
    } else if (!customerName && (region || (fromDate || toDate))) {
        if (region) {
            var query = { region: region }
        } else {
            if (!fromDate) {
                var fromDate = formatDate(new Date());
            }
            if (!toDate) {
                var toDate = formatDate(new Date());
            }
            var query = { $and: [{ created_at: { $gte: fromDate } }, { created_at: { $lte: toDate } }] }
        }
    } else {
        var query = {}
    }
    console.log('query', query);
    models.callLogs_table.find(query, function(err, allLogs) {
        if (!err) {
            if (allLogs.length > 0) {

                var xls = json2xls(allLogs, {
                    fields: ['customerName', 'location', 'latitude','longitude','isCopyEmail', 'customerType', 'callType', 'date', 'time', 'created_at', 'order', 'vibe', 'comment', 'contact', 'salesmanName']
                });

                // var xls = json2xls(allLogs, {
                //     fields: { foo: 'string', qux: 'string', poo: 'string', stux: 'string' }
                // });

                var time = new Date().getTime();
                var file = time + '.xlsx';
                fs.writeFileSync(file, xls, 'binary');

                res.json({ code: 200, status: 'success', message: 'Call logs exported successfully.', data: { url: req.headers.host + '/download/' + file } })
                return;
            } else {
                res.json({ code: 200, status: 'success', message: 'There is no calllog present with this condition. Please check your parameters and try again.' });
                return;
            }
        } else {
            console.log('Error', err);
        }
    })
}
exports.exportCustomer = function(req, res) {
    var customerName = req.query.customerName;

    if (customerName) {
        var query = { "customerName": { $regex: '.*' + customerName + '.*', $options: 'i' } };
    } else {
        var query = {}
    }
    console.log('query', query);
    models.customer.find(query, function(err, allLogs) {
        if (!err) {
            if (allLogs.length > 0) {
                var xls = json2xls(allLogs, {
                    fields: ['id', 'customerName']
                });

                // var xls = json2xls(allLogs, {
                //     fields: { foo: 'string', qux: 'string', poo: 'string', stux: 'string' }
                // });

                var time = new Date().getTime();
                var file = time + '.xlsx';
                fs.writeFileSync(file, xls, 'binary');

                res.json({ code: 200, status: 'success', message: 'File exported successfully', data: { url: req.headers.host + '/download/' + file } })
                return;
            } else {
                res.json({ code: 200, status: 'success', message: 'Cant find any customers. Please upload the latest customer list and try again.' });
                return;
            }
        } else {
            console.log('Error', err);
        }
    })
}
exports.downloadFile = function(req, res) {
    var filename = req.params.filename;
    res.download(filename);
    setTimeout(() => {
        console.log('filename', filename);
        fs.unlink(filename);
    }, 5000);
}
