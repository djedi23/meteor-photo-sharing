// -*-  mode:js2;coding:utf-8 -*-

var colorizer = require('colorizer').create('Colorizer');
var screenshots_dir = '/tmp/screenshots/';

viewports = [
  {
    'name': 'smartphone-portrait',
    'viewport': {width: 320, height: 480}
  },
  {
    'name': 'smartphone-landscape',
    'viewport': {width: 480, height: 320}
  },
  {
    'name': 'tablet-portrait',
    'viewport': {width: 768, height: 1024}
  },
  {
    'name': 'tablet-landscape',
    'viewport': {width: 1024, height: 768}
  },
  {
    'name': 'desktop-standard',
    'viewport': {width: 1280, height: 1024}
  }
];

function pad(number) {
  var r = String(number);
  if ( r.length === 1 ) {
    r = '0' + r;
  }
  return r;
}

function clearStorage(){
    casper.evaluate(function() {
        localStorage.clear();
        sessionStorage.clear();
	window.localStorage.clear();
    });
}

randi = function(n) {
  return Math.floor(Math.random() * n);
};

sc = function (screenshotUrl, titre) {
  var screenshotNow = new Date();
  var screenshotDateTime = screenshotNow.getFullYear() + pad(screenshotNow.getMonth() + 1) + pad(screenshotNow.getDate()) + '-' + pad(screenshotNow.getHours()) + pad(screenshotNow.getMinutes()) + pad(screenshotNow.getSeconds());
  casper.each(viewports, function(casper, viewport) {
    this.then(function() {
      this.viewport(viewport.viewport.width, viewport.viewport.height);
    });
    this.thenOpen(screenshotUrl, function() {
      this.wait(500);
    });
    this.then(function(){
      this.echo('Screenshot for ' + viewport.name + ' (' + viewport.viewport.width + 'x' + viewport.viewport.height + ')', 'info');
      this.capture(screenshots_dir + titre+'_' + screenshotDateTime + '/' + viewport.name + '-' + viewport.viewport.width + 'x' + viewport.viewport.height + '.png', {
        top: 0,
        left: 0,
        width: viewport.viewport.width,
        height: viewport.viewport.height
      });
    });
  });
};

screenshotNumber=1;
testId="";

sc_ = function (titre) {
  var screenshotNow = new Date();
  if (testId=="")
    require('utils').dump("Attention pas de testID.");
  var screenshotDateTime = screenshotNow.getFullYear() + pad(screenshotNow.getMonth() + 1) + pad(screenshotNow.getDate()) + '-' + pad(screenshotNow.getHours()) + pad(screenshotNow.getMinutes()) + pad(screenshotNow.getSeconds());
  casper.capture(screenshots_dir + testId +'_'+pad(screenshotNumber)+"_" + screenshotDateTime+ '_' + titre + '.png');
  screenshotNumber++;
};


userFromUserName = function(name){
  return fusers.filter(function(user){
    return (user.Username === name);
  });
};


xp = require('casper').selectXPath;

login = function(userNumber){
  var user = userNumber?users[userNumber]:users[0];
  casper.waitForSelector("#at-nav-button",function() {
    casper.thenClick("#at-nav-button", function(){
      casper.waitForSelector("#at-btn",function() {
	casper.test.assertExists('#at-btn');
	casper.test.assertExists('#at-field-email');
	this.sendKeys('#at-field-email', user.username);
	this.sendKeys('#at-field-password', user.password);
	this.click("#at-btn");
      });
    });
  }, function(){},20000);
  //   casper.thenBypassUnless(function(){
  //     return this.exists(".at-error");
  //   },2);
  //   casper.thenClick('#at-signUp');
  // //  casper.sendKeys('#at-field-password_again', password);
  //   casper.thenClick("#at-btn");

  casper.waitForSelector("#logoutButton",function() {
    casper.echo('Login:' + user.username,'TRACE');
  }, function() {
    sc_("login_fail");
  });
};

logout = function () {
  casper.waitForSelector("#logoutButton",function() {
    if (this.exists('#logoutButton')) {
      casper.thenClick("#logoutButton");
    }
  });
  casper.waitForSelector("#at-nav-button",function() {
    casper.echo('Logout','TRACE');
  }, function() {
       sc_("logout_fail");
     });
};

findByDisplayId = function(did){
  return casper.evaluate(function(did){
    return getElement(displayIdsConv(did));
  }, did);
};
findById = function(id){
  return casper.evaluate(function(id){
    return getElement(id);
  }, id);
};
meteorUser = function(id){
  return casper.evaluate(function(){
    return Meteor.user();
  });
};


var gotoPhoto = function gotoPhoto (toggle) {
  casper.thenOpen(baseURL+ '/photo/' + photoId);
  casper.waitForSelector(".photo");
  if (toggle){
    casper.waitForSelector("#toggleEditShareMode");
    casper.thenClick("#toggleEditShareMode");
    casper.waitForSelector('input[data-key="isPublic"]');
  }
};
var gotoPhotoAlbum = function gotoPhoto (toggle) {
  casper.thenOpen(baseURL+ '/album/' + albumId +'/photo/' + photoAlbumId);
  casper.waitForSelector(".photo");
  if (toggle){
    casper.waitForSelector("#toggleEditShareMode");
    casper.thenClick("#toggleEditShareMode");
    casper.waitForSelector('input[data-key="isPublic"]');
  }
};


var gotoAlbum = function gotoAlbum (toggle) {
  casper.thenOpen(baseURL+ '/album/' + albumId);
  casper.waitForSelector(".album");
  if (toggle){
    casper.waitForSelector("#toggleEditShareMode");
    casper.thenClick("#toggleEditShareMode");
    casper.waitForSelector('input[data-key="isPublic"]');
  }
};
var gotoMyProfile = function gotoMyProfile () {
  casper.thenOpen(baseURL+ '/profile');
  casper.waitForSelector(".myprofile");
};
var gotoUserA = function gotoUserA () {
  casper.thenOpen(baseURL+ '/profile/'+userId);
  casper.waitForSelector(".profile-picture");
};
var gotoUserB = function gotoUserB () {
  casper.thenOpen(baseURL+ '/profile/'+userBId);
  casper.waitForSelector(".profile-picture");
};




  // casper.on('http.status.200', function(resource) {
  //   this.echo('wait, this url is 200: ' + resource.url);
  // });
  // casper.on('http.status.404', function(resource) {
  //   this.echo('wait, this url is 404: ' + resource.url);
  // });
  // casper.on('http.status.500', function(resource) {
  //   this.echo('woops, 500 error: ' + resource.url);
  // });
  // casper.on('complete.error', function(err) {
  //   this.echo('cmplete error: ' + err);
  // });
  // casper.on('open', function(location,settings) {
  //   this.echo('open: ' + location); //+" "+JSON.stringify({o:settings}));
  // });
  // casper.on('error', function(err) {
  //   this.echo('error: ' + err);
  // });
  // casper.on('load.started', function() {
  //   this.echo('load.started');
  // });
  // casper.on('load.failed', function(err) {
  //   this.echo('load.failed ' + err);
  // });
  // casper.on('load.finished', function(err) {
  //   this.echo('load.finished ' + err);
  // });
  // casper.on('page.created', function(err) {
  //   this.echo('page.created ' + err);
  // });
  //   casper.on('page.error', function(err, trace) {
  //     this.echo('page.error ' + err);
  //   });
  // casper.on('page.initialized', function(err) {
  //   this.echo('page.initialized ' + err);
  // });
  // casper.on('page.resource.requested', function(res) {
  //   this.echo('page.resource.requested ' + res.url); // JSON.stringify({o:res}));
  // });
  // casper.on('resource.requested', function(res) {
  //   this.echo('resource.requested ' + res.url); // JSON.stringify({o:res}));
  // });
  // casper.on('resource.received', function(res) {
  //   this.echo('resource.received ' + res.url); // JSON.stringify({o:res}));
  // });
  // casper.on('resource.error', function(res) {
  //   this.echo('resource.error ' + JSON.stringify({o:res}));
  // });
  //   casper.on('remote.message', function(msg) {
  //     this.echo('remote.message ' + msg);
  //   });
