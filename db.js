// var MongoClient = require('mongodb').MongoClient,
//     assert = require('assert');
var mongoose = require('mongoose');
var url = process.env.MONGODB_URI;
mongoose.connect(url, { useMongoClient: true });

var Schema = mongoose.Schema;
// create a schema
var callogs = new Schema({
    salesmanName: String,
    email: String,
    //  salesmanContact: String,
    customerName: String,
    contact: String,
    comment: String,
    location: String,
    latitude : String,
    longitude: String,
    order: String,
    vibe: String,
    created_at: String,
    updated_at: String,
    time: String,
    salesmanId: String,
    date: String,
    callType: String,
    region: String,
    customerType: String,
    isCopyEmail: String,
    customerId: String
});
var callLogs_table = mongoose.model('CallLogs', callogs);

var teamRecordsLogs = new Schema({
    teamStarttime: String,
    teamEndtime: String,
    averageCallLog: String,
    date: String,
    totalCallLog: String
});
var teamRecords = mongoose.model('TeamRecords', teamRecordsLogs);

var customerLogs = new Schema({
    id: String,
    customerName: String,
    customerLocation: String,
    customerType: String,
    contact: [String]
});
var customer = mongoose.model('Customer', customerLogs);

// var custLocation = new Schema({});

// var custLoc = mongoose.model('CustomerLocation', custLocation);


var userLogs = new Schema({
    username: String,
    password: String,
    email: String,
    phone: String,
    region: String,
    status: String,
    flag: String,
    isAdmin: Boolean,
    otp: String
})
var user = mongoose.model('user', userLogs);

module.exports = {
    callLogs_table: callLogs_table,
    teamRecords: teamRecords,
    customer: customer,
    //   custLoc: custLoc,
    user: user
};