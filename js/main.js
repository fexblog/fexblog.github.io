"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var POSTS_URL = 'api/posts.json',
    HTTP_OK = 200,
    AT = "access_token=",
    TOKEN = "f817635b9f791a74e711eb4cc32504deea8caf69";

var app = angular.module('app', ['ngSanitize']);

app.controller("NavigationController", ['$scope', '$rootScope', function NavigationController($scope, $rootScope) {
    $scope.filter = "";
    $scope.isSearchEnabled = false;
    $scope.isMenuEnabled = false;
    $scope.categories = ['javascript', 'CSS', 'HTML', 'other'];
    $scope.setFilter = function setFilter() {
        var filter = arguments.length <= 0 || arguments[0] === undefined ? undefined : arguments[0];

        $rootScope.$emit('filterPostsByCategory', filter);
    };
}]);

app.controller('PostsController', ['$scope', '$rootScope', '$http', function PostsController($scope, $rootScope, $http) {
    $scope.posts = [];
    $scope.filter = undefined;
    function loadUserInformation(post) {
        var ghAPI = 'https://api.github.com/users/';
        if (!!post.author_gh) {
            $http.get(ghAPI + post.author_gh + "?" + AT + TOKEN).then(function getPostAuthor(response) {
                if (response.status === HTTP_OK) {
                    post.author = {};
                    post.author.name = response.data.name;
                    post.author.url = response.data.html_url;
                    post.author.avatar = response.data.avatar_url;
                }
            }, function onError(error) {
                console.error(error);
            });
        }
    }

    function loadPostContent(post) {
        if (post.origin instanceof String) {
            var base = 'https://raw.githubusercontent.com',
                gh = 'https://github.com';
            if (!!post.origin && post.origin.indexOf(gh) === 0) {
                post.origin = post.origin.replace(gh, base).replace('/blob', '');
            }
            $http.get(post.origin).then(function getPostContent(response) {
                if (response.status === HTTP_OK) {
                    post.content = response.data;
                }
            }, function onError(error) {
                console.error(error);
            });
        } else if (_typeof(post.origin) === 'object') {
            var branch = void 0;
            if (!!post.origin.branch) {
                branch = "ref=" + post.origin.branch;
            }
            var url = "https://api.github.com/repos/" + post.author_gh + "/" + post.origin.repo + "/contents/" + post.origin.path + "?" + branch + "&" + AT + TOKEN;
            $http.get(url).then(function getPostContent(response) {
                if (response.status === HTTP_OK) {
                    post.content = atob(response.data.content);
                }
            }, function onError(error) {
                console.error(error);
            });
        }
    }

    function loadPostInfo(post) {
        if (_typeof(post.origin) === 'object') {
            var branch = void 0;
            if (!!post.origin.branch) {
                branch = "ref=" + post.origin.branch;
            }
            var infoURL = "https://api.github.com/repos/" + post.author_gh + "/" + post.origin.repo + "?" + branch + "&" + AT + TOKEN;
            $http.get(infoURL).then(function getPostContent(response) {
                if (response.status === HTTP_OK) {
                    post.published = moment(response.data.updated_at).format('MMMM D, YYYY');
                }
            }, function onError(error) {
                console.error(error);
            });
        }
    }

    $rootScope.$on('filterPostsByCategory', function PostsController_filter(evt, filter) {
        $scope.filter = filter;
    });

    $scope.checkFilter = function checkFilter(post) {
        if (!$scope.filter || post.category === $scope.filter) {
            return true;
        }
        return false;
    };

    $scope.loadPosts = function loadPosts() {
        $http.get(POSTS_URL).then(function getArticles(response) {
            if (response.status === HTTP_OK) {
                $scope.posts = response.data;
                response.data.map(loadPostInfo);
                response.data.map(loadPostContent);
                response.data.map(loadUserInformation);
            }
        }, function onError(error) {
            console.error(error);
        });
    };
    $scope.loadPosts();
}]);

app.directive('blogPost', ['$sce', function PostDirective($sce) {
    return {
        'restrict': 'E',
        'replace': true,
        'controller': function controller($scope) {
            $scope.getPostContent = function (post) {
                var html = void 0;
                if (!!post.content) {
                    html = marked(post.content);
                }
                return $sce.trustAsHtml(html);
            };
        },
        'templateUrl': './components/post.html'
    };
}]);
//# sourceMappingURL=main.js.map
