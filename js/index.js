var app = angular.module("myapps", []);

app.controller("myctr", function($scope, $http, $window) {

    var vm = $scope;
    vm.submit = function() { //function to call on form submit
        console.log('clicked');
        vm.upload(vm.file); //call upload function

    }
    vm.upload = function(file) {
        var req = {
            method: 'POST',
            url: '/api/addCustomer',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1YTNhNWFlNjcyZjYxMjAwMTQ4NDlmYTMiLCJ1c2VybmFtZSI6ImFiYyIsImVtYWlsIjoiYWJjMThAeWFob28uaW4iLCJpYXQiOjE1MTM4MzUwMzMsImV4cCI6MTUxNjQyNzAzM30.NgGOYzizrVbwQ00nV91Pev06E6Q3582dvrYqhTBfGMU',
                'app_version': 1.0,
                'api_version': 1.0,
                'app_type': 'android',
                'language': 'en'
            },
            data: { file: file }
        }

        $http(req).then(function(success) {
            console.log('File uploaded', success.data)
        }, function(err) {
            console.log('Error', err)
        });

    };

    // $window.onload = function() {

    //     var a = new Date();
    //     console.log("full formate", a);
    //     var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    //     var year = a.getFullYear();
    //     var month = months[a.getMonth()];
    //     var date = a.getDate();
    //     var hour = a.getHours();
    //     var min = a.getMinutes();
    //     var sec = a.getSeconds();

    //     if (hour == 0 && hour < 12) {
    //         mid = "am";
    //     } else if (hour >= 12) {
    //         mid = 'pm';
    //     }

    //     var Date_at = date + '-' + month + '-' + year;
    //     var Time = hour + ':' + min + ':' + sec + mid;

    //     console.log("Date", Date_at);
    //     console.log("Time", Time);

    //     $http({

    //         method: "GET",
    //         url: "http://localhost:8080/api/get/profile",
    //         // data:angular.toJson(params),
    //         // data: serialize(params),
    //         headers: {
    //             'Content-Type': 'application/x-www-form-urlencoded'

    //         }

    //     }).then(
    //         function success(res) {

    //             console.log("response", res);
    //             var list = [];
    //             for (var i = 0; i < res.data.data.length; i++) {
    //                 list.push({
    //                     id: res.data.data[i]._id,
    //                     Customer_name: res.data.data[i].Customer_name,
    //                     Contact_number: res.data.data[i].Contact_number,
    //                     Location: res.data.data[i].Location,
    //                     Commets: res.data.data[i].Commets,
    //                     Order: res.data.data[i].Order,
    //                     Vibe: res.data.data[i].Vibe,
    //                     Score: res.data.data[i].Score,
    //                 });
    //                 $scope.data = list;
    //             }
    //             // Customer_name
    //             // Contact_number
    //             // Location
    //             // Commets
    //             // Order
    //             // Vibe
    //             // Score
    //         },
    //         function error(res) {

    //             console.log("error", res);

    //         }
    //     )
    // }

    // $scope.count = function() {
    //     $http({

    //         method: "GET",
    //         url: "http://localhost:8080/api/get/profile",
    //         headers: {
    //             'Content-Type': 'application/x-www-form-urlencoded'
    //         }
    //     }).then(
    //         function success(res) {
    //             console.log("response", res);
    //             $scope.totalcount = res.data.data.length;
    //         },
    //         function error(res) {
    //             console.log("error", res);
    //         }
    //     )
    // }
    // $scope.min = function() {
    //     $http({

    //         method: "GET",
    //         url: "http://localhost:8080/api/min/record",
    //         headers: {
    //             'Content-Type': 'application/x-www-form-urlencoded'
    //         }
    //     }).then(
    //         function success(res) {
    //             console.log("response", res);
    //             $scope.totalmin = res.data.data[0].Score;
    //         },
    //         function error(res) {
    //             console.log("error", res);
    //         }
    //     )
    // }
    // $scope.max = function() {
    //     $http({
    //         method: "GET",
    //         url: "http://localhost:8080/api/max/record",
    //         headers: {
    //             'Content-Type': 'application/x-www-form-urlencoded'
    //         }
    //     }).then(
    //         function success(res) {
    //             console.log("response", res);
    //             $scope.totalmax = res.data.data[0].Score;
    //         },
    //         function error(res) {
    //             console.log("error", res);
    //         }
    //     )
    // }
    // $scope.add = function() {

    //     var params = {

    //         'photo': "wdewe"

    //     }

    //     $http({

    //         method: "POST",
    //         url: "http://localhost:8080/api/add/profile",
    //         data: angular.toJson(params),
    //         headers: {
    //             "Content-Type": "application/json",
    //             "charset": "utf-8"
    //         }
    //     }).then(
    //         function success(res) {
    //             console.log("response", res);
    //         },
    //         function error(res) {
    //             console.log("error", res);
    //         }
    //     )

    // }

    // $scope.update = function() {
    //     console.log("enter1");

    //     serialize = function(obj) {
    //         var str = [];
    //         for (var p in obj)
    //             if (obj.hasOwnProperty(p)) {
    //                 str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    //             }
    //         return str.join("&");
    //     };

    //     var params = {
    //         'id': $scope.id,
    //         'photo': $scope.photo

    //     }

    //     $http({

    //         method: "POST",
    //         url: "http://localhost:8080/update/photo",
    //         // data:angular.toJson(params),
    //         data: serialize(params),
    //         headers: {
    //             'Content-Type': 'application/x-www-form-urlencoded'

    //         }

    //     }).then(
    //         function success(res) {

    //             console.log("response", res);

    //         },
    //         function error(res) {

    //             console.log("error", res);

    //         }
    //     )

    // }

})