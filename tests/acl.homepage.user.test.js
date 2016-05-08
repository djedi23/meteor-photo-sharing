// -*-  mode:js3;coding:utf-8 -*-
//var mouse = require('mouse').create(casper);

var url=baseURL+'/';
testId="acl_homepage_user";


casper.test.begin("Test acl user homepage", function suite(test) {

  casper.start(url, function() {
    clearStorage();
    this.viewport(1024, 768);
  });

  casper.then(function(){
    test.assertFalsy(clientFindOnePhoto(photoId), "photo absente sur la homepage client");
  });

  login();
  gotoMyProfile();

  /*
   * PUBLIC: acl share 
   * user: false  undef
   * album: false undef
   * photo: false undef
   *
   * HOMEPAGE:
   * user: false  undef
   * album: false undef
   * photo: false undef
   */

  casper.waitForSelector(".myprofile", function() {
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoId+'", key:"share.isPublic"}).value', 'photo isShare === false' ,function(value){ return value === false; });
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoId+'", key:"share.inHomepage"}).value', 'photo inHomepage === false' ,function(value){ return value === false; });
    assertMongo.call(test, 'db.acl.findOne({collection:"albums", id:"'+albumId+'", key:"share.isPublic"}).value', 'album isShare === false' ,function(value){ return value === false; });
    assertMongo.call(test, 'db.acl.findOne({collection:"albums", id:"'+albumId+'", key:"share.inHomepage"}).value', 'album inHomepage === false' ,function(value){ return value === false; });
    assertMongo.call(test, 'db.acl.findOne({collection:"users", id:"'+userId+'", key:"share.isPublic"}).value', 'user isShare === false' ,function(value){ return value === false; });
    assertMongo.call(test, 'db.acl.findOne({collection:"users", id:"'+userId+'", key:"share.inHomepage"}).value', 'user inHomepage === false' ,function(value){ return value === false; });
    assertMongo.call(test, 'db.photos.findOne({_id:"'+photoId+'"})', 'photo.share === undef' ,function(value){return value.share === undefined; });
    assertMongo.call(test, 'db.albums.findOne({_id:"'+albumId+'"})', 'albums.share === undef' ,function(value){return value.share === undefined; });
    assertMongo.call(test, 'db.users.findOne({_id:"'+userId+'"})', 'users.share === undef' ,function(value){return value.share === undefined; });
  });


  casper.thenClick('input[data-key="inHomepage"]');

  casper.waitForSelector('input[data-key="inHomepage"]:checked', function(){
    /*
     * PUBLIC: acl share
     * user: true true
     * album: true undef
     * photo: true undef
     *
     * HOMEPAGE:
     * user: true  true
     * album: true undef
     * photo: true undef
     */
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoAlbumId+'", key:"share.isPublic"}).value', 'photo A isShare === true (1)' ,function(value){console.log(JSON.stringify(value)); return value === true; });
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoAlbumId+'", key:"share.inHomepage"}).value', 'photo A inHomepage === true' ,function(value){ return value === true; });
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoId+'", key:"share.isPublic"}).value', 'photo B isShare === true (1)' ,function(value){return value === true; });
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoId+'", key:"share.inHomepage"}).value', 'photo B inHomepage === true' ,function(value){ return value === true; });
    assertMongo.call(test, 'db.acl.findOne({collection:"albums", id:"'+albumId+'", key:"share.isPublic"}).value', 'album isShare === true' ,function(value){ return value === true; });
    assertMongo.call(test, 'db.acl.findOne({collection:"albums", id:"'+albumId+'", key:"share.inHomepage"}).value', 'album inHomepage === true' ,function(value){ return value === true; });
    assertMongo.call(test, 'db.acl.findOne({collection:"albums", id:"'+albumId+'", key:"share.isPublic"}).photos', 'album isShare contient photo' ,function(value){return value.indexOf(photoAlbumId) !== -1; });
    assertMongo.call(test, 'db.acl.findOne({collection:"albums", id:"'+albumId+'", key:"share.inHomepage"}).photos', 'album inHomepage contient photo' ,function(value){ return value.indexOf(photoAlbumId) !== -1; });
    assertMongo.call(test, 'db.acl.findOne({collection:"users", id:"'+userId+'", key:"share.isPublic"}).value', 'user isShare === true' ,function(value){ return value === true; });
    assertMongo.call(test, 'db.acl.findOne({collection:"users", id:"'+userId+'", key:"share.inHomepage"}).value', 'user inHomepage === true' ,function(value){ return value === true; });
    assertMongo.call(test, 'db.acl.findOne({collection:"users", id:"'+userId+'", key:"share.isPublic"}).photos', 'user isShare contient 3 photos' ,function(value){return value.length === 3; });
    assertMongo.call(test, 'db.acl.findOne({collection:"users", id:"'+userId+'", key:"share.inHomepage"}).photos', 'user inHomepage contient 3 photos' ,function(value){ return value.length === 3; });
    assertMongo.call(test, 'db.acl.findOne({collection:"users", id:"'+userId+'", key:"share.isPublic"}).albums', 'user isShare contient 1 album' ,function(value){return value.indexOf(albumId) !== -1; });
    assertMongo.call(test, 'db.acl.findOne({collection:"users", id:"'+userId+'", key:"share.inHomepage"}).albums', 'user inHomepage contient 1 album' ,function(value){ return value.indexOf(albumId) !== -1; });
    assertMongo.call(test, 'db.photos.findOne({_id:"'+photoId+'"})', 'B photo.share === undef' ,function(value){return value.share === undefined; });
    assertMongo.call(test, 'db.photos.findOne({_id:"'+photoAlbumId+'"})', 'A photo.share === undef' ,function(value){return value.share === undefined; });
    assertMongo.call(test, 'db.albums.findOne({_id:"'+albumId+'"})', 'albums.share === true' ,function(value){return value.share === undefined; });
    assertMongo.call(test, 'db.users.findOne({_id:"'+userId+'"})', 'users.share === true' ,function(value){return value.share.inHomepage===true && value.share.isPublic===true; });
  });


  logout();
  casper.wait(100,function(){
    /*
     * homepage: visible sur la home si pas loggé
     */
    test.assertTruthy(clientFindOnePhoto(photoAlbumId), "photo A présente sur la homepage client");
    test.assertTruthy(clientFindOnePhoto(photoId), "photo B présente sur la homepage client");
  });
  login(1);
  casper.wait(100,function(){
    /*
     * homepage: visible sur la home si loggé
     */
    test.assertTruthy(clientFindOnePhoto(photoAlbumId), "photo A présente sur la homepage client");
    test.assertTruthy(clientFindOnePhoto(photoId), "photo B présente sur la homepage client");
  });
  gotoPhotoAlbum();
  casper.wait(100,function(){
    /*
     * homepage: visible directement si loggé
     */
    test.assertTruthy(clientFindOnePhoto(photoAlbumId), "photo A présente sur la page photo client");
  });
  logout();


  
  login();
  gotoMyProfile();
  casper.thenClick('input[data-key="isPublic"]');

  casper.waitForSelector('input[data-key="isPublic"]:not(:checked)', function(){
    /*
     * PUBLIC:
     * user: false  false
     * album: false undef
     * photo: false undef
     *
     * HOMEPAGE:
     * user: false  false
     * album: false undef
     * photo: false undef
     */
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoAlbumId+'", key:"share.isPublic"}).value', 'photo A isShare === false (2)' ,function(value){return value === false; });
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoAlbumId+'", key:"share.inHomepage"}).value', 'photo A inHomepage === false' ,function(value){ return value === false; });
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoId+'", key:"share.isPublic"}).value', 'photo B isShare === false' ,function(value){return value === false; });
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoId+'", key:"share.inHomepage"}).value', 'photo B inHomepage === false (2)' ,function(value){ return value === false; });
    assertMongo.call(test, 'db.acl.findOne({collection:"albums", id:"'+albumId+'", key:"share.isPublic"}).value', 'album isShare === false' ,function(value){ return value === false; });
    assertMongo.call(test, 'db.acl.findOne({collection:"albums", id:"'+albumId+'", key:"share.inHomepage"}).value', 'album inHomepage === false' ,function(value){ return value === false; });
    assertMongo.call(test, 'db.acl.findOne({collection:"albums", id:"'+albumId+'", key:"share.isPublic"}).photos', 'album isShare ne contient pas photo A' ,function(value){return value.indexOf(photoAlbumId) === -1; });
    assertMongo.call(test, 'db.acl.findOne({collection:"albums", id:"'+albumId+'", key:"share.inHomepage"}).photos', 'album inHomepage ne contient pas photo A' ,function(value){ return value.indexOf(photoAlbumId) === -1; });
    assertMongo.call(test, 'db.acl.findOne({collection:"users", id:"'+userId+'", key:"share.isPublic"}).value', 'user isShare === false' ,function(value){ return value === false; });
    assertMongo.call(test, 'db.acl.findOne({collection:"users", id:"'+userId+'", key:"share.inHomepage"}).value', 'user inHomepage === false' ,function(value){ return value === false; });
    assertMongo.call(test, 'db.acl.findOne({collection:"users", id:"'+userId+'", key:"share.isPublic"}).photos', 'user isShare ne contient pas de photos' ,function(value){return value.length === 0; });
    assertMongo.call(test, 'db.acl.findOne({collection:"users", id:"'+userId+'", key:"share.inHomepage"}).photos', 'user inHomepage pas contient pas de photos' ,function(value){ return value.length === 0; });
    assertMongo.call(test, 'db.acl.findOne({collection:"users", id:"'+userId+'", key:"share.isPublic"}).albums', 'user isShare ne contient pas d album' ,function(value){return value.indexOf(albumId) === -1; });
    assertMongo.call(test, 'db.acl.findOne({collection:"users", id:"'+userId+'", key:"share.inHomepage"}).albums', 'user inHomepage ne contient pas d album' ,function(value){ return value.indexOf(albumId) === -1; });
    assertMongo.call(test, 'db.photos.findOne({_id:"'+photoId+'"})', 'B photo.share === undef' ,function(value){return value.share === undefined; });
    assertMongo.call(test, 'db.photos.findOne({_id:"'+photoAlbumId+'"})', 'A photo.share === undef' ,function(value){return value.share === undefined; });
    assertMongo.call(test, 'db.albums.findOne({_id:"'+albumId+'"})', 'albums.share === undef' ,function(value){return value.share === undefined; });
    assertMongo.call(test, 'db.users.findOne({_id:"'+userId+'"})', 'users.share === false' ,function(value){return value.share.inHomepage===false && value.share.isPublic===false; });
  });
  logout();
  casper.then(function(){
    test.assertFalsy(clientFindOnePhoto(photoAlbumId), "photo A absente sur la homepage client ");
    test.assertFalsy(clientFindOnePhoto(photoId), "photo B absente sur la homepage client ");
  });
  login(1);
  casper.wait(100,function(){
    test.assertFalsy(clientFindOnePhoto(photoAlbumId), "photo A absente sur la homepage client ");
    test.assertFalsy(clientFindOnePhoto(photoId), "photo B absente sur la homepage client");
  });
  gotoPhoto();
  casper.wait(100,function(){
//    sc_("photo");
    test.assertFalsy(clientFindOnePhoto(photoAlbumId), "photo A absente sur la homepage client ");
    test.assertFalsy(clientFindOnePhoto(photoId), "photo B absente sur la page photo client");
  });
  logout();


  casper.run(function() {
//    sc_("text_edit_fin");
    test.done();
  });
});
