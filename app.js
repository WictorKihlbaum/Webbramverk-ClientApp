angular
    .module('app', ['ngMaterial', 'ngMessages', 'ngRoute', 'ngResource', 'ngMap', 'angularMoment'])
    .constant('API', {
        'baseURL': 'http://webbramverk-registerapp.herokuapp.com',
        'eventsPath': '/api/v1/events',
        'apiKey': '4089210b1b572b3b688bdf8abeb19516',
        'format': 'application/json'
    })
    .config(['$routeProvider', '$locationProvider',
        ($routeProvider, $locationProvider) => {
            $routeProvider.
            when('/events', {
                templateUrl: 'partials/events.html',
                controller: 'Event',
                controllerAs: 'event'
            }).
            when('/create', {
                templateUrl: 'partials/create.html',
                controller: 'Event',
                controllerAs: 'event'
            }).
            otherwise({
                redirectTo: '/events'
            });

            $locationProvider.html5Mode(true);
        }])
    .config($httpProvider => {
        $httpProvider.interceptors.push('authInterceptor');
    })
    .config(function($mdIconProvider) {
        $mdIconProvider
            .icon('infoIcon', 'assets/img/info.svg')
            .icon('editIcon', 'assets/img/edit.svg')
            .icon('deleteIcon', 'assets/img/delete.svg')
            .icon('helpIcon', 'assets/img/help.svg')
            .icon('renewIcon', 'assets/img/renew.svg')
    });