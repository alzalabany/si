var si = angular.module('simpleSchool', ['ngAnimate', 'ngRoute', 'ngResource', 'ngCookies'])
    .constant("api_url", "http://localhost/si/metronic/")
    .config(function($routeProvider, $httpProvider, $locationProvider, $provide, api_url) {
        //suppress error on 401s
        $provide.decorator('$templateRequest', function($delegate) {
            var mySilentProvider = function(tpl, ignoreRequestError) {
                return $delegate(tpl, true);
            }
            return mySilentProvider;
        });
        //adjust params for $http->post since angular send ajax not params
        $httpProvider.defaults.transformRequest = function(data) {
            if (data === undefined) {
                return data;
            }
            return jQuery.param(data);
        };

        $routeProvider.
        when('/home', {
            templateUrl: './views/home.html',
            controller: 'homeCtrl'
        }).
        otherwise({
            redirectTo: '/home'
        });
    })
    .run(function($rootScope, $http, $window) {
        $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
        $rootScope.innerHeight = $window.innerHeight;
        $rootScope.innerWidth = $window.innerWidth;
    })
    .filter('dateToISO', function() {
        return function(badTime) {
            //console.log(badTime);
            if (!badTime) return '';
            var goodTime = badTime.replace(/(.+) (.+)/, "$1T$2Z");
            return goodTime;
        };
    })
    .directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if (event.which === 13) {
                    scope.$apply(function() {
                        scope.$eval(attrs.ngEnter, {
                            'event': event
                        });
                    });

                    event.preventDefault();
                }
            });
        };
    })
    .directive('autoActive', ['$location', function($location) {
        return {
            restrict: 'A',
            scope: false,
            link: function(scope, element) {
                function setActive() {
                    var path = $location.path();
                    if (path) {
                        angular.forEach(element.find('li'), function(li) {
                            var anchor = li.querySelector('a');
                            if (anchor.href.match('#' + path + '(?=\\?|$)')) {
                                angular.element(li).addClass('active');
                            } else {
                                angular.element(li).removeClass('active');
                            }
                        });
                    }
                }
                setActive();
                scope.$on('$locationChangeSuccess', setActive);
            }
        }
    }])
    .directive('bkbutton', function() {
        return {
            restrict: 'E',
            template: '<button class="btn"><i class="fa fa-backward"></i>{{back}}</button>',
            scope: {
                back: '@back',
                forward: '@forward',
                icons: '@icons'
            },
            link: function(scope, element, attrs) {
                jQuery(element[0]).on('click', function() {
                    history.back();
                    scope.$apply();
                });
            }
        };
    })
    .factory("session", function($window) {
        return {
            clear: function() {
                $window.sessionStorage.clear();
            },
            kill: function(VAR) {
                $window.sessionStorage.removeItem(VAR);
            },
            exists: function(VAR) {
                return (typeof $window.sessionStorage.getItem(VAR) !== undefined && $window.sessionStorage.getItem(VAR));
            },
            set: function(VAR, val) {
                if (typeof val === 'object' || Array.isArray(val)) {
                    val = JSON.stringify(val);
                }
                $window.sessionStorage.setItem(VAR, val);
                return val;
            },
            get: function(VAR) {
                var x = $window.sessionStorage.getItem(VAR);
                if (typeof x === undefined || !x) return false;

                //if numric, then convert to number;
                if (!isNaN(x)) x = parseInt(x);

                try {
                    return JSON.parse(x);
                } catch (e) {
                    return x;
                }
            }
        };
    })
    .factory("storage", function($window) {
        return {
            clear: function() {
                $window.localStorage.clear();
            },
            kill: function(VAR) {
                $window.localStorage.removeItem(VAR);
            },
            exists: function(VAR) {
                return (typeof $window.sessionStorage.getItem(VAR) !== undefined && $window.sessionStorage.getItem(VAR));
            },
            set: function(VAR, val) {
                if (typeof val === 'object' || Array.isArray(val)) {
                    val = JSON.stringify(val);
                }
                $window.localStorage.setItem(VAR, val);
                return val;
            },
            get: function(VAR) {
                var x = $window.localStorage.getItem(VAR);
                if (typeof x === undefined || !x) return null;

                //if numric, then convert to number;
                if (!isNaN(x)) x = parseInt(x);

                try {
                    return JSON.parse(x);
                } catch (e) {
                    return x;
                }
            }
        };
    })
    .controller('homeCtrl', function($scope, $rootScope) {
        $scope.error = null;
    });