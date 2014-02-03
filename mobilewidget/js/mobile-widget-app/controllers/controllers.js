app.config(function($routeProvider) {
        $routeProvider

            // route for the home page
            .when('/', {
                templateUrl : 'views/retailerlist.html',
                controller  : 'mainController'
            })

            // route for the about page
            .when('/retailer', {
                templateUrl : 'views/retailer.html',
                controller  : 'retailerController'
            })

            // route for the about page
            .when('/retailer:retailerid', {
                templateUrl : 'views/retailer.html',
                controller  : 'retailerController'
            })
            // route for the about page
            .when('/retailer:retailerid/prmotioncode:promotioncode', {
                templateUrl : 'views/retailer.html',
                controller  : 'retailerController'
            })
            // route for the about page
            .when('/retailer:retailerid/promotioncode:promotioncode/storeid:storeid', {
                templateUrl : 'views/retailer.html',
                controller  : 'retailerController'
            })

    });

var retailersToStore = []

//Main controller that loads the list of retailer logos
app.controller("mainController", function($scope, $http){
    
    $scope.retailers = [];
    $scope.slides = [];
    var _scrollinterval = null;
    
    $scope.init = function() 
    {
        $scope.currentSlide = 1;
        $scope.totalSlides = 0;
        $scope.initialLoad = true;
        $scope.autoslide = true;

        $http.jsonp('http://api2.shoplocal.com/retail/5369d0c743bd59c2/2013.1/json/multiretailerpromotions?radius=5&siteid=1553&MultRetPromoSort=1&pageimagewidth=156&citystatezip=60601&callback=JSON_CALLBACK').success(function(data) {

            var logosperpage = 6;
            
            angular.forEach(data.Results, function(retailer, index){
                    $scope.retailers.push(retailer);
            });
            retailersToStore = data.Results;

            //Split the retailers array into chuncks
            for (var i=0; i<$scope.retailers.length; i+=logosperpage) {
                var slide = $scope.retailers.slice(i,i+logosperpage);
                $scope.slides.push(slide);
            }

            $scope.totalSlides = $scope.slides.length;

            if($scope.autoslide)
            {
                autoslide();
            }
            var pleasewait = document.getElementById("pleasewait");
            pleasewait.style.display='none';

        }).error(function(error) {
 
        });
    };

    $scope.$on('$viewContentLoaded', function(){

        var test = "test";

    });

    $scope.openHeroPromotion = function(index, retailerid)
    {

    }


    var autoslide = function()
    {
        if($scope.initialLoad && $scope.autoslide)
        {
           _scrollinterval =  setInterval(function(){ 
                    if($scope.currentSlide <= $scope.totalSlides)
                    {
                        $scope.currentSlide = $scope.currentSlide +1; 
                        goAutoForward();                         
                    }
                    else
                    {
                        $scope.currentSlide = 1;
                        $scope.myScroll['wrapper'].scrollToPage(0, 0);
                    }

                },2000);
        }
        else
        {
            clearInterval();
        }
    }

    $scope.$parent.myScrollOptions = {
            snap: true,
            momentum: false,
            hScrollbar: false,
            onScrollEnd: function () {
            } 
        };

    // expose refreshiScroll() function for ng-onclick or other meth
    $scope.refreshiScroll = function ()
    {
        $scope.$parent.myScroll['wrapper'].refresh();
    };


        var goAutoForward = function () {
        if($scope.currentSlide <= $scope.totalSlides)
        {
            clearInitialLoad();
            $scope.myScroll['wrapper'].scrollToPage('next', 0);
        }
    };

    var goAutoBack = function () {
        if($scope.currentSlide > 1)
        {
            clearInitialLoad();
            $scope.myScroll['wrapper'].scrollToPage('prev', 0);
        }
    };

    $scope.goForward = function () {
        $scope.autoslide = false;
        clearInterval(_scrollinterval);
        _scrollinterval = null;
        if($scope.currentSlide < $scope.totalSlides)
        {
            clearInitialLoad();
            $scope.currentSlide = $scope.currentSlide +1; 
            $scope.myScroll['wrapper'].scrollToPage('next', 0);
        }
    };

    $scope.goBack = function () {
        $scope.autoslide = false;
        clearInterval(_scrollinterval);
        scrollinterval = null;
        if($scope.currentSlide > 1)
        {
            $scope.currentSlide = $scope.currentSlide - 1; 
            clearInitialLoad();
            $scope.myScroll['wrapper'].scrollToPage('prev', 0);
        }
    };

    var clearInitialLoad = function(){
        if($scope.initialLoad)
        {
            $scope.initialLoad = false;
        }
    }
});

//Retailer controller that loads promotions based on the retailer.
app.controller('retailerController', function($scope, $route, $routeParams, $http) {

    $scope.retailerid = $routeParams.retailerid.replace(":","");
    $scope.storeid = $routeParams.storeid.replace(":","");
    $scope.promotioncode = $routeParams.promotioncode.replace(":","");
    $scope.pages = [];
    $scope.currentHeroSlide = 1;
    $scope.totalHeroslides = 0;
    $scope.retailers = [];
    $scope.retailer = null;
    $scope.init = function() 
    {        
        // Get all the cookies pairs in an array

        var noadds = document.getElementById("noadds");
        noadds.style.display = 'none';
        
        $http.jsonp('http://api2.shoplocal.com/retail/5369d0c743bd59c2/2013.1/json/multiretailerpromotions?radius=5&siteid=1553&MultRetPromoSort=1&pageimagewidth=156&citystatezip=60601&callback=JSON_CALLBACK').success(function(data) {

            $scope.retailers = data.Results;

            if($scope.retailerid && $scope.retailers.length)
            {

                angular.forEach($scope.retailers, function(retailerfound, index){
                      if(retailerfound.RetailerID == $scope.retailerid)  
                      {
                        $scope.retailer =  retailerfound;
                      }
                });

                $http.jsonp('http://api2.shoplocal.com/retail/42ace9ccb488c1dd/2013.1/json/fullpromotionpages?storeid='+$scope.storeid+'&promotioncode='+$scope.promotioncode+'&callback=JSON_CALLBACK').success(function(data) {
                    angular.forEach(data.Results, function(page, index){
                            page.ImageLocation = page.ImageLocation.replace("200","300");
                            $scope.pages.push(page);        
                    });



                    $scope.totalHeroslides = $scope.pages.length; 

                    var pleasewait = document.getElementById("pleasewait");
                    pleasewait.style.display='none';

                    if($scope.pages.length == 0)
                    {
                        noadds.style.display = 'block';                    
                    }

                }).error(function(error) {
         
                });
            }

        }).error(function(error) {
     
        });



    };

    $scope.goHeroPromoForward = function () {
        if($scope.currentHeroSlide < $scope.pages.length)
        {
            $scope.currentHeroSlide = $scope.currentHeroSlide +1; 
            $scope.myScroll['wrapper-hero'].scrollToPage('next', 0);
        }
    };

    $scope.goHeroPromoBack = function () {
        
        if($scope.currentHeroSlide > 1)
        {
            $scope.currentHeroSlide = $scope.currentHeroSlide - 1; 
            $scope.myScroll['wrapper-hero'].scrollToPage('prev', 0);
        }
    };
});