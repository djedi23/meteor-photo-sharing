// -*-  mode:js2;coding:utf-8 -*-
//var mouse = require('mouse').create(casper);

var url=baseURL+'/';
testId="sharefriends";


casper.test.begin("Test share album friends", function suite(test) {

  casper.start(url, function() {
    this.viewport(1024, 768);
  });

  login();
  gotoAlbum(true);
    /*
     *     :   [share] [acl]
     * user:  []       []
     * album: []       []
     * photo: []       []
     */
  casper.waitForSelector(".album", function() {

    test.assertExists('a[data-activates="friendsDrop"]', "Bouton selection amis présent");
    test.assertSelectorHasText('a#add', "Utilisateur B", "Utilisateur B est dans la liste d'amis");

    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoAlbumId+'", key:"share.isPublic"}).value', 'isShare === false' ,function(value){ return value === false; });
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoAlbumId+'", key:"share.friends"})', 'photo friends === false' ,function(value){return value === null; });
    assertMongo.call(test, 'db.acl.findOne({collection:"albums", id:"'+albumId+'", key:"share.friends"})', 'album friends === false' ,function(value){return value === null; });
    assertMongo.call(test, 'db.photos.findOne({_id:"'+photoAlbumId+'"})', 'photo.share === undef' ,function(value){return value.share === undefined; });
    assertMongo.call(test, 'db.albums.findOne({_id:"'+albumId+'"})', 'albums.share === undef' ,function(value){return value.share === undefined; });
    assertMongo.call(test, 'db.users.findOne({_id:"'+userId+'"})', 'users.share === undef' ,function(value){return value.share === undefined; });
  });

  casper.wait(100);
  casper.thenClick('a#add');

    /*
     *     :  [share] [acl]
     * user:  []       []
     * album: [userB]  [userB]
     * photo: []       [userB]
     */
  casper.waitWhileSelector('a#add',function(){
    test.assertDoesntExist('a[data-activates="friendsDrop"]', "Bouton selection amis plus présent");
    test.assertSelectorHasText('a.tag', "Utilisateur B", "Utilisateur B est dans la liste de partage");

  });

  logout();

  casper.wait(100,function(){
    /*
     * homepage: invisible sur la home si pas loggé
     */
    test.assertFalsy(clientFindOnePhoto(photoAlbumId), "photo A non présente sur la homepage client");
    test.assertFalsy(clientFindOnePhoto(photoId), "photo B non présente sur la homepage client");

    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoAlbumId+'", key:"share.friends"})', 'photo friends === userBId' ,function(value){return value && value.value  && value.value[0] === userBId; });
    assertMongo.call(test, 'db.acl.findOne({collection:"albums", id:"'+albumId+'", key:"share.friends"})', 'album friends === userBId' ,function(value){return value && value.value  && value.value[0] === userBId; });
    assertMongo.call(test, 'db.photos.findOne({_id:"'+photoAlbumId+'"})', 'photo.share === undef' ,function(value){return value.share === undefined; });
    assertMongo.call(test, 'db.albums.findOne({_id:"'+albumId+'"})', 'albums.share === undef' ,function(value){return value.share && value.share.friends[0] === userBId; });
  });

  login(1);
  gotoPhotoAlbum();
  casper.waitForSelector(".photo");
  casper.waitForSelector("#mainPhoto", function(){
    test.assertTruthy(clientFindOnePhoto(photoAlbumId), "photo A dans la base");
    test.assertFalsy(clientFindOnePhoto(photoId), "photo B non présente dans la base");
  });

  logout();

  login();
  gotoAlbum(true);

  casper.waitForSelector("#tagRemove",function(){
    test.assertDoesntExist('a[data-activates="friendsDrop"]', "Bouton selection amis plus présent");
    test.assertSelectorHasText('a.tag', "Utilisateur B", "Utilisateur B est dans la liste de partage");
  });
  casper.thenClick('#tagRemove');
    /*
     *     :   [share] [acl]
     * user:  []       []
     * album: []       []
     * photo: []       []
     */
  casper.waitForSelector('a#add',function(){
    test.assertExists('a[data-activates="friendsDrop"]', "Bouton selection amis présent");
    test.assertSelectorHasText('a#add', "Utilisateur B", "Utilisateur B est dans la liste d'amis");

    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoAlbumId+'", key:"share.friends"})', 'photo friends empty' ,function(value){return value && value.value.length === 0; });
  });

  logout();
  login(1);
  gotoPhoto();
  casper.waitForSelector(".photo");
  casper.waitForText("Photo non trouvée ou autorisation insuffisante",function(){
    test.assertFalsy(clientFindOnePhoto(photoId), "photo B non présente sur la homepage client");
    test.assertFalsy(clientFindOnePhoto(photoAlbumId), "photo A non présente sur la homepage client");

    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoAlbumId+'", key:"share.friends"})', 'photo friends empty' ,function(value){return value && value.value.length === 0; });
    assertMongo.call(test, 'db.acl.findOne({collection:"albums", id:"'+albumId+'", key:"share.friends"})', 'album friends empty' ,function(value){return value && value.value.length === 0; });
    assertMongo.call(test, 'db.photos.findOne({_id:"'+photoAlbumId+'"})', 'photo.share === undef' ,function(value){return value.share === undefined; });
    assertMongo.call(test, 'db.albums.findOne({_id:"'+albumId+'"})', 'albums.share === undef' ,function(value){return value && value.share.friends.length === 0; });
  });

  casper.run(function() {
//    sc_("text_edit_fin");
    test.done();
  });
});
