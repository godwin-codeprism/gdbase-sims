window.lout = function () {
  angular
    .element("#simsController")
    .scope()
    .logoutHandler();
};
var runFunction = function ($rootScope, $transitions, authService, $state) {
  
  // App Version
  var appVersion = "1.1";
  console.log(`%cSimulation App Version: ${appVersion}`, 'color:#f60; font-size:large');


  // jQuery Stuff
  // var header = $('header').html?v=1.1();
  // $('header').remove();
  // $('#main').prepend('<header class="fusion-header-wrapper" style="height: 134px;"> ' + header + ' </header>');
  // var menuBtn = $('[aria-label="Toggle mobile menu"]');
  // menuBtn.removeAttr('href');
  // menuBtn.click(function () {
  //   var mobileNav = $('nav.fusion-mobile-nav-holder');
  //   mobileNav.is(':visible') ? mobileNav.hide() : mobileNav.show();
  // })

  /*$('#menu-top-header-menu').append('<li role="menuitem" id="logoutBtn" class="button-no-padding-rt menu-item menu-item-type-custom menu-item-object-custom menu-item-239 fusion-menu-item-button" data-classes="button-no-padding-rt"> <span class="menu-text fusion-button button-default button-medium"> <span class="fusion-button-text-center">Logout</span> </span> </a></li>');

  $('#logoutBtn').click(function () {
    angular.element('#simsController').scope().logoutHandler();
  });*/

  // Angular Stuff
  $transitions.onBefore({}, function (trans) {
    if (trans.$to().name != "login" && trans.$to().name != "signup") {
      $('section#content').css({
        'height': '100%'
      });

      if (localStorage.getItem("gdbaseToken") != null) {
        authService
          .checkToken(
            localStorage.getItem("gdbaseToken").split("|")[0],
            localStorage.getItem("gdbaseToken")
          )
          .then(function (res) {
            console.log({res, toke: localStorage.getItem("gdbaseToken")});
            if (res != "good") {
              console.log("Token mismatch 1");
              localStorage.removeItem("gdbaseToken");
              $state.go("login");
            }
          });
      } else {
        console.log("Token missing");
        $state.go("login");
      }
    } else {
      // change section height if signup or login page
      $('section#content').css({
        'height': '700px'
      });
    }
    if (trans.$to().name == "login") {
      if (localStorage.getItem("gdbaseToken") != null) {
        authService
          .checkToken(
            localStorage.getItem("gdbaseToken").split("|")[0],
            localStorage.getItem("gdbaseToken")
          )
          .then(function (res) {
            if (res == "good") {
              console.log("Token matched");
              $state.go("sims.select", {
                user: localStorage.getItem("gdbaseToken").split("|")[0]
              });
            } else {
              console.log("Token mismatch 2");
            }
          });
      }
    }
  });
  $transitions.onSuccess({}, function (trans) {
    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="tooltip"]').click(function () {
      $('[data-toggle="tooltip"]').tooltip("hide");
    });
  });
};
runFunction.$inject = ["$rootScope", "$transitions", "authService", "$state"];
angular
  .module("gdbaseSims", ["ngSanitize", "ui.router", "ngAnimate"])
  .config([
    "$stateProvider",
    "$urlRouterProvider",
    "$locationProvider",
    "$injector",
    function ($stateProvider, $urlRouterProvider) {
      $urlRouterProvider.otherwise("/signup");
      $stateProvider
        .state("signup", {
          url: "/signup",
          templateUrl: baseURL + "views/signup.html?v=1.1",
          controller: "signupController"
        })
        .state("login", {
          url: "/login",
          templateUrl: baseURL + "views/login.html?v=1.1",
          controller: "loginController"
        })
        .state("sims", {
          url: "/:user",
          templateUrl: baseURL + "views/sims.html?v=1.1",
          controller: "simsController"
        })
        .state("sims.select", {
          url: "/simulations",
          templateUrl: baseURL + "views/sim_select.html?v=1.1",
          controller: "simSelectController"
        })
        .state("sims.simulation", {
          url: "/:currentSimulation",
          templateUrl: baseURL + "views/simulation.html?v=1.1",
          controller: "simulationController",
          resolve: {
            checkSims: [
              "$q",
              "authSimService",
              "$stateParams",
              "$state",
              function ($q, authSimService, $stateParams, $state) {
                var deferred = $q.defer();
                authSimService
                  .checkSimPayment(
                    $stateParams.user,
                    $stateParams.currentSimulation
                  )
                  .then(function (res) {
                    if (res) {
                      deferred.resolve();
                    } else {
                      $state.go("sims.select");
                      deferred.reject("Please pay for " + $stateParams.currentSimulation + " to gain access.");
                    }
                  })
                  .catch(function (err) {
                    console.error(err);
                  });
                return deferred.promise;
              }
            ]
          }
        });
    }
  ])
  .run(runFunction);