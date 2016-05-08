// -*-  mode:js3;coding:utf-8 -*-
//var mouse = require('mouse').create(casper);

var url=baseURL+'/';
testId="acl_homepage_album";


casper.test.begin("Test acl album homepage", function suite(test) {

  casper.start(url, function() {
    clearStorage();
    this.viewport(1024, 768);
  });

  casper.then(function(){
    test.assertFalsy(clientFindOnePhoto(photoId), "photo absente sur la homepage client");
  });

  login();
  gotoAlbum(true);

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

  casper.waitForText("photo", function() {
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoId+'", key:"share.isPublic"}).value', 'photo isShare === false' ,function(value){ return value === false; });
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoId+'", key:"share.inHomepage"}).value', 'photo inHomepage === false' ,function(value){ return value === false; });
    assertMongo.call(test, 'db.acl.findOne({collection:"albums", id:"'+albumId+'", key:"share.isPublic"}).value', 'album isShare === false' ,function(value){ return value === false; });
    assertMongo.call(test, 'db.acl.findOne({collection:"albums", id:"'+albumId+'", key:"share.inHomepage"}).value', 'album inHomepage === false' ,function(value){ return value === false; });
    assertMongo.call(test, 'db.photos.findOne({_id:"'+photoId+'"})', 'photo.share === undef' ,function(value){return value.share === undefined; });
    assertMongo.call(test, 'db.albums.findOne({_id:"'+albumId+'"})', 'albums.share === undef' ,function(value){return value.share === undefined; });
    assertMongo.call(test, 'db.users.findOne({_id:"'+userId+'"})', 'users.share === undef' ,function(value){return value.share === undefined; });
  });


  casper.thenClick('input[data-key="inHomepage"]', function(){
    /*
     * PUBLIC:
     * user: false  undef
     * album: true  true
     * photo: false undef
     *
     * HOMEPAGE:
     * user: false  undef
     * album: true  true
     * photo: false undef
     */
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoAlbumId+'", key:"share.isPublic"}).value', 'photo A isShare === true' ,function(value){console.log(JSON.stringify(value)); return value === true; });
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoAlbumId+'", key:"share.inHomepage"}).value', 'photo A inHomepage === true' ,function(value){ return value === true; });
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoId+'", key:"share.isPublic"}).value', 'photo B isShare === false' ,function(value){return value === false; });
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoId+'", key:"share.inHomepage"}).value', 'photo B inHomepage === false' ,function(value){ return value === false; });
    assertMongo.call(test, 'db.acl.findOne({collection:"albums", id:"'+albumId+'", key:"share.isPublic"}).value', 'album isShare === true' ,function(value){ return value === true; });
    assertMongo.call(test, 'db.acl.findOne({collection:"albums", id:"'+albumId+'", key:"share.inHomepage"}).value', 'album inHomepage === true' ,function(value){ return value === true; });
    assertMongo.call(test, 'db.acl.findOne({collection:"albums", id:"'+albumId+'", key:"share.isPublic"}).photos', 'album isShare contient photo' ,function(value){return value.indexOf(photoAlbumId) !== -1; });
    assertMongo.call(test, 'db.acl.findOne({collection:"albums", id:"'+albumId+'", key:"share.inHomepage"}).photos', 'album inHomepage contient photo' ,function(value){ return value.indexOf(photoAlbumId) !== -1; });
    assertMongo.call(test, 'db.photos.findOne({_id:"'+photoId+'"})', 'B photo.share === undef' ,function(value){return value.share === undefined; });
    assertMongo.call(test, 'db.photos.findOne({_id:"'+photoAlbumId+'"})', 'A photo.share === undef' ,function(value){return value.share === undefined; });
    assertMongo.call(test, 'db.albums.findOne({_id:"'+albumId+'"})', 'albums.share === true' ,function(value){return value.share.inHomepage===true && value.share.isPublic===true; });
    assertMongo.call(test, 'db.users.findOne({_id:"'+userId+'"})', 'users.share === undef' ,function(value){return value.share === undefined; });
  });


  logout();
  casper.wait(100,function(){
    /*
     * homepage: visible sur la home si pas loggé
     */
    test.assertTruthy(clientFindOnePhoto(photoAlbumId), "photo présente sur la homepage client");
    test.assertFalsy(clientFindOnePhoto(photoId), "photo présente sur la homepage client");
  });
  login(1);
  casper.wait(100,function(){
    /*
     * homepage: visible sur la home si loggé
     */
    test.assertTruthy(clientFindOnePhoto(photoAlbumId), "photo présente sur la homepage client");
    test.assertFalsy(clientFindOnePhoto(photoId), "photo présente sur la homepage client");
  });
  gotoPhotoAlbum();
  casper.wait(100,function(){
    /*
     * homepage: visible directement si loggé
     */
    test.assertTruthy(clientFindOnePhoto(photoAlbumId), "photo présente sur la page photo client");
  });
  logout();


  
  login();
  gotoAlbum(true);
  casper.thenClick('input[data-key="isPublic"]', function(){
    /*
     * PUBLIC:
     * user: false  undef
     * album: false false
     * photo: false undef
     *
     * HOMEPAGE:
     * user: false  undef
     * album: false false
     * photo: false undef
     */
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoAlbumId+'", key:"share.isPublic"}).value', 'photo A isShare === false' ,function(value){return value === false; });
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoAlbumId+'", key:"share.inHomepage"}).value', 'photo A inHomepage === false' ,function(value){ return value === false; });
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoId+'", key:"share.isPublic"}).value', 'photo B isShare === false' ,function(value){return value === false; });
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoId+'", key:"share.inHomepage"}).value', 'photo B inHomepage === false' ,function(value){ return value === false; });
    assertMongo.call(test, 'db.acl.findOne({collection:"albums", id:"'+albumId+'", key:"share.isPublic"}).value', 'album isShare === false' ,function(value){ return value === false; });
    assertMongo.call(test, 'db.acl.findOne({collection:"albums", id:"'+albumId+'", key:"share.inHomepage"}).value', 'album inHomepage === false' ,function(value){ return value === false; });
    assertMongo.call(test, 'db.acl.findOne({collection:"albums", id:"'+albumId+'", key:"share.isPublic"}).photos', 'album isShare contient photo' ,function(value){return value.indexOf(photoAlbumId) === -1; });
    assertMongo.call(test, 'db.acl.findOne({collection:"albums", id:"'+albumId+'", key:"share.inHomepage"}).photos', 'album inHomepage contient photo' ,function(value){ return value.indexOf(photoAlbumId) === -1; });
    assertMongo.call(test, 'db.photos.findOne({_id:"'+photoId+'"})', 'B photo.share === undef' ,function(value){return value.share === undefined; });
    assertMongo.call(test, 'db.photos.findOne({_id:"'+photoAlbumId+'"})', 'A photo.share === undef' ,function(value){return value.share === undefined; });
    assertMongo.call(test, 'db.albums.findOne({_id:"'+albumId+'"})', 'albums.share === undef' ,function(value){return value.share.inHomepage===false && value.share.isPublic===false; });
    assertMongo.call(test, 'db.users.findOne({_id:"'+userId+'"})', 'users.share === undef' ,function(value){return value.share === undefined; });


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
