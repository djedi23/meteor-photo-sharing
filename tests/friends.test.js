// -*-  mode:js2;coding:utf-8 -*-
//var mouse = require('mouse').create(casper);

var url=baseURL+'/';
testId="add friends";


casper.test.begin("Test add friends", function suite(test) {

  casper.start(url, function() {
    this.viewport(1024, 768);
  });

//   casper.then(function(){
//     test.assertFalsy(clientFindOnePhoto(photoId), "photo absente sur la homepage client");
//   });

  login();
  gotoUserB();

  casper.waitForSelector('a#userInvite', function() {
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoId+'", key:"share.isPublic"}).value', 'isShare === false' ,function(value){ return value === false; });
    assertMongo.call(test, 'db.photos.findOne({_id:"'+photoId+'"})', 'photo.share === undef' ,function(value){return value.share === undefined; });
    assertMongo.call(test, 'db.albums.findOne({_id:"'+albumId+'"})', 'albums.share === undef' ,function(value){return value.share === undefined; });
    assertMongo.call(test, 'db.users.findOne({_id:"'+userId+'"})', 'users.share === undef' ,function(value){return value.share === undefined; });
  });

  casper.then(function() {
    this.click('a#userInvite');
  });

  casper.waitWhileSelector('a#userInvite', function() {
    if (meteorUser() && meteorUser().invitationSent && meteorUser().invitationSent[0])
      casper.test.assertEquals(meteorUser().invitationSent[0].user,userBId, "Invitation envoyée à l'utilistateur B");
    else
      test.fail("Invitation non envoyée");
  });

  logout();
  login(1);

  casper.then(function() {
    if (meteorUser() && meteorUser().invitation && meteorUser().invitation[0])
      casper.test.assertEquals(meteorUser().invitation[0].user,userId, "Invitation reçue par l'utilistateur B");
    else
      test.fail("Invitation non reçue");
  });

  gotoMyProfile();

  casper.then(function(){
    casper.test.assertExists('#confirmInvitation', "Invitation présente sur le profil");
    casper.test.assertTextDoesntExist('Amis', "Absence block amis");
    this.click('#confirmInvitation');
  });

  casper.waitWhileSelector('#confirmInvitation', function() {
    casper.test.assertTextExists('Amis', "Block amis");
    casper.test.assertEquals(meteorUser().friends[0].user,userId, "A est ami de B");
  });

  logout();
  login();

  casper.then(function(){
    casper.test.assertEquals(meteorUser().friends[0].user,userBId, "B est ami de A");
  });

  gotoUserB();

  casper.waitForSelector('.profile-picture', function() {
    test.assertDoesntExist("a#userInvite","Le bouton d'invitation n'est plus présent");

    var invitationCount =  casper.evaluate(function(userid){
      return Meteor.users.update({_id: userid }, {$addToSet: {invitation: {user: Meteor.userId(), date: new Date()}}});
    }, userBId);

    test.assertEquals(invitationCount, 1, "La seconde invitation a été injectée");
    assertMongo.call(test, 'db.users.findOne({_id:"'+userBId+'"})', 'La seconde invitation n a pas été prise en compte' ,function(value){return value.invitation.length === 0; });
  });


  casper.run(function() {
//    sc_("text_edit_fin");
    test.done();
  });
});
