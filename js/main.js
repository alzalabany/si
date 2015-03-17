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
        when('/home', {templateUrl: './views/home.html',controller: 'homeCtrl'}).
        when('/inbox', {templateUrl: 'views/inbox.html',controller: 'inboxCtrl'}).
        when('/inbox/msg/:id', {templateUrl: 'views/inboxMsg.html',controller: 'inboxMsg'}).
        when('/calendar', {templateUrl: 'views/calendar.html', controller: 'calendarCtrl'}).
        when('/profile', {templateUrl: 'views/user.html', controller: 'profileCtrl'}).
        when('/wall', {templateUrl: 'views/wall.html', controller: 'wallCtrl'}).
        when('/timetable', {templateUrl: 'views/timetable.html', controller: 'timetableCtrl'}).
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
    .directive('bsmodal', function () {
        return {
            template: '<div class="modal fade">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
            '<h4 class="modal-title">{{ title }}</h4>' +
            '</div>' +
            '<div class="modal-body" ng-transclude></div>' +
            '</div>' +
            '</div>' +
            '</div>',
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: true,
            link: function postLink(scope, element, attrs) {
                scope.title = attrs.title;

                scope.$watch(attrs.visible, function (value) {
                    if (value === true)
                        jQuery(element).modal('show');
                    else
                        jQuery(element).modal('hide');
                });

                $(element).on('shown.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = true;
                    });
                });

                $(element).on('hidden.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = false;
                    });
                });
            }
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
                        if(path.split('/').length > 2){
                            path = '/'+path.split('/')[1];
                        }
                        angular.forEach(element.find('li'), function (li) {
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
            template: '<button class="btn btn-default btn-xs"><i class="fa fa-backward"></i>{{back}}</button>',
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
    })
    .controller('inboxCtrl', function ($scope) {
        $scope.showModal = false;
        $scope.toggleModal = function () {
            $scope.showModal = !$scope.showModal;
            console.log('change showModal');
        };
        $scope.new = {
            body: null,
            group_id: null,
            user_id: null,
            title: null
        };

        $scope.groupMsg = function () {
            console.log($scope.new);
        };
        $scope.userMsg = function () {
            console.log($scope.new);
        };
        $scope.offset = 0;
        $scope.inbox = [
            {
                title: 'This is big title',
                time: '12:10 am',
                type: 'msg',
                read: false,
                from: 'Bhaumik Patel',
                id: 1
            },
            {
                title: 'This is big title',
                time: '11:10 am',
                type: 'ann',
                read: true,
                from: 'Bhaumik Patel',
                id: 2
            }, {
                title: 'This is big title',
                time: '10:10 am',
                type: 'msg',
                read: true,
                from: 'Bhaumik Patel',
                id: 3
            },
        ];
    })
    .controller('inboxMsg', function ($scope, $route) {
        $scope.addMsg = function () {
            $scope.msg.data.push({
                msg: $scope.body,
                from: 'teacher',
                'date': new Date().toISOString(),
                id: Math.floor(Math.random() * (100000 - 10)) + 10,
                name: 'Momen Zalabany'
            });
            $scope.body = '';
            jQuery('html, body,.media-list').animate({
                scrollTop: (jQuery('.media').last().offset().top)
            }, 500);
        };
        $scope.msg = {
            data: [
                {
                    msg: 'hello',
                    from: 'student',
                    'date': '2015-02-28 11:00:00',
                    id: 1,
                    name: 'Bakbak Zalabany'
                },
                {
                    msg: 'hi',
                    from: 'teacher',
                    'date': '2015-02-28 12:00:00',
                    id: 2,
                    name: 'Momen Zalabany'
                },
                {
                    msg: 'very nice system thanx',
                    from: 'student',
                    'date': '2015-02-28 12:30:00',
                    id: 3,
                    name: 'Bakbak Zalabany'
                },
            ],
            title: 'hello dear teacher'
        };
    })
    .controller('calendarCtrl', function ($scope,$window) {
        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();

        $scope.events = [
            {title: 'All Day Event',start: new Date(y, m, 1)},
            {title: 'Long Event',start: new Date(y, m, d - 5),end: new Date(y, m, d - 2)},
            {id: 999,title: 'Repeating Event',start: new Date(y, m, d - 3, 16, 0),allDay: false},
            {id: 999,title: 'Repeating Event',start: new Date(y, m, d + 4, 16, 0),allDay: false},
            {title: 'Birthday Party',start: new Date(y, m, d + 1, 19, 0),end: new Date(y, m, d + 1, 22, 30),allDay: false},
            {title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
        ];
        $scope.calEventsExt = {
            color: '#f00',
            textColor: 'yellow',
            events: [
                {type:'party',title: 'Lunch',start: new Date(y, m, d, 12, 0),end: new Date(y, m, d, 14, 0),allDay: false},
                {type:'party',title: 'Lunch 2',start: new Date(y, m, d, 12, 0),end: new Date(y, m, d, 14, 0),allDay: false},
                {type:'party',title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
            ]
        };

        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();

        $window.jQuery('#calendar').fullCalendar({
            header: {
                left: 'prev,next today',
                center: 'title',
                right: 'month,agendaWeek,agendaDay'
            },
            editable: true,
            events: [
                {
                    title: 'All Day Event',
                    start: new Date(y, m, 1),
                },
                {
                    title: 'Long Event',
                    start: new Date(y, m, d - 5),
                    end: new Date(y, m, d - 2)
                },
                {
                    id: 999,
                    title: 'Repeating Event',
                    start: new Date(y, m, d - 3, 16, 0),
                    allDay: false
                },
                {
                    id: 999,
                    title: 'Repeating Event',
                    start: new Date(y, m, d + 4, 16, 0),
                    allDay: false
                },
                {
                    title: 'Meeting',
                    start: new Date(y, m, d, 10, 30),
                    allDay: false
                },
                {
                    title: 'Lunch',
                    start: new Date(y, m, d, 12, 0),
                    end: new Date(y, m, d, 14, 0),
                    allDay: false
                },
                {
                    title: 'Birthday Party',
                    start: new Date(y, m, d + 1, 19, 0),
                    end: new Date(y, m, d + 1, 22, 30),
                    allDay: false
                },
                {
                    title: 'Click for Google',
                    start: new Date(y, m, 28),
                    end: new Date(y, m, 29),
                    url: 'http://google.com/'
                }
            ]
        });

    })
    .controller('profileCtrl', function ($scope) {})
    .controller('wallCtrl', function ($scope) {
        $scope.posts = [{user:'momen',body:'hi there'},{user:'momen',body:'hi there'},{user:'momen',body:'hi there'}];
    })
    .controller('timetableCtrl', function ($scope,$window) {
        $scope.doit = function($event){
            console.log($event.target);
            c = $window.prompt('class');
            angular.element($event.target).html(c);
        }
    });