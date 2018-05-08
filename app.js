var express = require('express');
var apiRoutes = express.Router();
var apiHeader = express.Router();
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var busboy = require('connect-busboy');
var app = express();
var jwt = require("jsonwebtoken");
var config = require('./config/config.js');
var multer = require('multer')
var paginate = require('express-paginate');
var https = require("https");
server = require('http').createServer(app);
// var upload = multer({ filename: 'file.xlsx', dest: 'uploads/' });

adminEmail = "noreply@applabs.media";

var customer = require(__dirname + "/bin/customer.js");
var excel = require(__dirname + "/bin/excel.js");
var user = require(__dirname + "/bin/User.js");

app.set('port', process.env.PORT || 9001);
app.use(bodyParser.urlencoded({
    limit: '500mb',
    extended: true,
    parameterLimit: 50000
}));
var error = require(__dirname + '/constants/error.json');
var email = require(__dirname + '/constants/email.json');

app.use(bodyParser.json());
app.use(function(req, res, next) {
    // Website you wish to allow to connect

    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,token,app_version,api_version,app_type,language,timezone');
    //res.setHeader('*');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});



app.get('/', function(req, res) {
    res.sendFile('index.html', { 'root': "view" });
});
// app.post('/api/addCustomer', upload.single('file'), user.addCustomer);
app.post('/api/addCustomer', user.addCustomer);


app.use(paginate.middleware(10, 50));
app.use(expressValidator());
app.use(bodyParser.json());
app.use(busboy());
app.use(express.static(__dirname + '/public'));

app.use("/js", express.static(__dirname + '/js'));
app.use("/css", express.static(__dirname + '/css'));
app.use("/node_modules", express.static(__dirname + '/node_modules'));
// var jobs = require(__dirname + '/bin/worker')(app);
//Call API//   


app.get('/download/:filename', user.downloadFile);
apiRoutes.use(function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['token'];
    if (token) {
        jwt.verify(token, config.secret, function(err, decoded) {
            if (err) {
                return res.json({ "code": 200, "status": "Error", "message": "Failed to authenticate token" });
            } else {
                req.user = decoded;
                next();
            }
        });
    } else {
        return res.json({ "code": 200, "status": "Error", "message": "No token provided" });
    }
});

app.use('/api', apiRoutes);

apiHeader.use(function(req, res, next) {
    var app_version = req.body.app_version || req.query.app_version || req.headers['app_version'];
    var api_version = req.body.api_version || req.query.api_version || req.headers['api_version'];
    var app_type = req.body.app_type || req.query.app_type || req.headers['app_type'];
    var language = req.body.language || req.query.language || req.headers['language'];
    var timezone = req.body.timezone || req.query.timezone || req.headers['timezone'];

    if (!app_version) {
        return res.json({ "code": 200, "status": "Error", "message": "No app_version provided" });
    } else if (!api_version) {
        return res.json({ "code": 200, "status": "Error", "message": "No api_version provided" });
    } else if (!app_type) {
        return res.json({ "code": 200, "status": "Error", "message": "No app_type provided" });
    } else if (!["android", "ios"].includes(app_type)) {
        return res.json({ "code": 200, "status": "Error", "message": "app_type must be from android or ios" });
    } else if (!language) {
        return res.json({ "code": 200, "status": "Error", "message": "No language provided" });
    } else if (!["en", "fr"].includes(language)) {
        return res.json({ "code": 200, "status": "Error", "message": "language must be from en or fr" });
    } else {
        if (language == "en") {
            st = error.en;
            emailContent = email.en;
        } else if (language == "fr") {
            st = error.fr;
            emailContent = email.fr;
        }
        
        next();
    }
})
app.use('/', apiHeader);

app.get('/api/createExcel', user.createExcel);
app.get('/api/exportCustomer', user.exportCustomer);

app.post('/api/add/addcalllog', customer.addcalllog); //insert new record //
app.get('/api/get/gatcallbydate', customer.getcallbydate1); //insert new record //
app.get('/api/searchcust/:customerName', customer.searchcust);
app.get('/api/searchcontact', customer.searchcontact);

app.get('/api/genrate_excel', excel.genrate_excel);
app.get('/api/getlocation/:customerName', customer.getlocation);
//app.post('/api/salesman_contact', customer.salesman_contact);

// User APIS
app.post('/registration', user.registration);
app.post('/login', user.login);
app.post('/forgotPassword', user.forgotPassword);
app.post('/api/resetPassword', user.resetPassword);
app.post('/resetPasswordOTP', user.resetPasswordOTP);
app.post('/api/profileApproval', user.profileApproval);
app.post('/api/rejectUser', user.rejectUser);
app.post('/api/deleteUser', user.deleteUser);
app.post('/api/deactiveUser', user.deactiveUser);
app.post('/api/activeUser', user.activeUser);


app.post('/api/callLogs', user.callLogs);

// Admin APIS
app.post('/api/changeRegion', user.changeRegion);
app.get('/api/callLogsadmin', user.callLogsadmin);
// app.post('/api/addCustomer', user.addCustomer);

app.get('/api/getAlluser', user.getAlluser);

// setInterval(function() {
//     http.get("https://cooperapp.herokuapp.com/");
//     console.log('Heroku interval start');
// }, 1200000);

server.listen(app.get('port'));
// create server port //
// app.listen(app.get('port'));
console.log("Started on Port No. ", app.get('port'));