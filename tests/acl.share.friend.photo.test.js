// -*-  mode:js2;coding:utf-8 -*-
//var mouse = require('mouse').create(casper);

var url=baseURL+'/';
testId="sharefriends";


casper.test.begin("Test share friends", function suite(test) {

  casper.start(url, function() {
    this.viewport(1024, 768);
  });

  login();
  gotoPhoto(true);

  casper.waitForSelector(".photo", function() {

    test.assertExists('a[data-activates="friendsDrop"]', "Bouton selection amis présent");
    test.assertSelectorHasText('a#add', "Utilisateur B", "Utilisateur B est dans la liste d'amis");

    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoId+'", key:"share.isPublic"}).value', 'isShare === false' ,function(value){ return value === false; });
    assertMongo.call(test, 'db.photos.findOne({_id:"'+photoId+'"})', 'photo.share === undef' ,function(value){return value.share === undefined; });
    assertMongo.call(test, 'db.albums.findOne({_id:"'+albumId+'"})', 'albums.share === undef' ,function(value){return value.share === undefined; });
    assertMongo.call(test, 'db.users.findOne({_id:"'+userId+'"})', 'users.share === undef' ,function(value){return value.share === undefined; });
  });

  casper.wait(100);
  casper.thenClick('a#add');

  casper.waitWhileSelector('a#add',function(){
    test.assertDoesntExist('a[data-activates="friendsDrop"]', "Bouton selection amis plus présent");
    test.assertSelectorHasText('a.tag', "Utilisateur B", "Utilisateur B est dans la liste de partage");

    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoId+'", key:"share.friends"}).value', 'friends === userBId' ,function(value){return value && value[0] === userBId; });

  });

  logout();

  casper.wait(100,function(){
    /*
     * homepage: invisible sur la home si pas loggé
     */
    test.assertFalsy(clientFindOnePhoto(photoAlbumId), "photo A non présente sur la homepage client");
    test.assertFalsy(clientFindOnePhoto(photoId), "photo B non présente sur la homepage client");


    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoId+'", key:"share.isPublic"}).value', 'isShare === false' ,function(value){ return value === false; });
    assertMongo.call(test, 'db.photos.findOne({_id:"'+photoId+'"})', 'photo.share === undef' ,function(value){return value.share !== undefined && value.share.friends !== undefined && value.share.friends[0] === userBId; });
    assertMongo.call(test, 'db.albums.findOne({_id:"'+albumId+'"})', 'albums.share === undef' ,function(value){return value.share === undefined; });
    assertMongo.call(test, 'db.users.findOne({_id:"'+userId+'"})', 'users.share === undef' ,function(value){return value.share === undefined; });
  });

  login(1);
  gotoPhoto();
  casper.waitForSelector(".photo");
  casper.waitForSelector("#mainPhoto", function(){
    var photo = clientFindOnePhoto(photoId);
    test.assertTruthy(photo, "photo B dans la base");
    test.assertTruthy(photo.share.friends === undefined , "amis photo B non publiés");
  });

  logout();
  login();
  gotoPhoto(true);

  casper.waitForSelector("#tagRemove",function(){
    test.assertDoesntExist('a[data-activates="friendsDrop"]', "Bouton selection amis plus présent");
    test.assertSelectorHasText('a.tag', "Utilisateur B", "Utilisateur B est dans la liste de partage");
  });
  casper.thenClick('#tagRemove');
  casper.waitForSelector('a#add',function(){
    test.assertExists('a[data-activates="friendsDrop"]', "Bouton selection amis présent");
    test.assertSelectorHasText('a#add', "Utilisateur B", "Utilisateur B est dans la liste d'amis");

    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoId+'", key:"share.friends"}).value', 'friends empty' ,function(value){return value && value.length === 0; });

  });

  logout();
  login(1);
  gotoPhoto();
  casper.waitForSelector(".photo");
  casper.waitForText("Photo non trouvée ou autorisation insuffisante",function(){
    test.assertFalsy(clientFindOnePhoto(photoId), "photo B non présente sur la homepage client");
  });


  casper.run(function() {
//    sc_("text_edit_fin");
    test.done();
  });
});
