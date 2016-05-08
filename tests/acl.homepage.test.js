// -*-  mode:js2;coding:utf-8 -*-
//var mouse = require('mouse').create(casper);

var url=baseURL+'/';
testId="acl_homepage";


casper.test.begin("Test acl homepage", function suite(test) {

  casper.start(url, function() {
    clearStorage();
    this.viewport(1024, 768);
  });

  casper.then(function(){
    test.assertFalsy(clientFindOnePhoto(photoId), "photo absente sur la homepage client");
  });

  login();
  gotoPhoto(true);

  /*
   * PUBLIC:
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
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoId+'", key:"share.isPublic"}).value', 'isShare === false' ,function(value){ return value === false; });
    assertMongo.call(test, 'db.photos.findOne({_id:"'+photoId+'"})', 'photo.share === undef' ,function(value){return value.share === undefined; });
    assertMongo.call(test, 'db.albums.findOne({_id:"'+albumId+'"})', 'albums.share === undef' ,function(value){return value.share === undefined; });
    assertMongo.call(test, 'db.users.findOne({_id:"'+userId+'"})', 'users.share === undef' ,function(value){return value.share === undefined; });
  });


  casper.thenClick('input[data-key="inHomepage"]', function(){
    /*
     * PUBLIC:
     * user: false  undef
     * album: false undef
     * photo: true  true
     *
     * HOMEPAGE:
     * user: false  undef
     * album: false undef
     * photo: true  true
     */
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoId+'", key:"share.isPublic"}).value', 'photo isPublic === true' ,function(value){ return value === true; });
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoId+'", key:"share.inHomepage"}).value', 'photo inHomepage === true' ,function(value){ return value === true; });
    assertMongo.call(test, 'db.photos.findOne({_id:"'+photoId+'"})', 'photo.share === true' ,function(value){return value.share.inHomepage===true && value.share.isPublic===true; });
    assertMongo.call(test, 'db.albums.findOne({_id:"'+albumId+'"})', 'albums.share === undef' ,function(value){return value.share === undefined; });
    assertMongo.call(test, 'db.users.findOne({_id:"'+userId+'"})', 'users.share === undef' ,function(value){return value.share === undefined; });
  });


  logout();
  casper.wait(100,function(){
    /*
     * homepage: visible sur la home si pas loggé
     */
    var photo = clientFindOnePhoto(photoId);
    test.assertTruthy(photo, "photo présente sur la homepage client");
    test.assertTruthy(photo.share.friends === undefined , "amis photo non publiés");
  });
  login(1);
  casper.wait(100,function(){
    /*
     * homepage: visible sur la home si loggé
     */
    var photo = clientFindOnePhoto(photoId);
    test.assertTruthy(photo, "photo présente sur la homepage client");
    test.assertTruthy(photo.share.friends === undefined , "amis photo non publiés");
  });
  gotoPhoto();
  casper.wait(100,function(){
    /*
     * homepage: visible directement si loggé
     */
    var photo = clientFindOnePhoto(photoId);
    test.assertTruthy(photo, "photo présente sur la page photo client");
    test.assertTruthy(photo.share.friends === undefined , "amis photo non publiés");
  });
  logout();


  
  login();
  gotoPhoto(true);
  casper.thenClick('input[data-key="isPublic"]', function(){
    /*
     * PUBLIC:
     * user: false  undef
     * album: false undef
     * photo: false false
     *
     * HOMEPAGE:
     * user: false  undef
     * album: false undef
     * photo: false false
     */
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoId+'", key:"share.isPublic"}).value', 'photo isPublic === false' ,function(value){ return value === false; });
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoId+'", key:"share.inHomepage"}).value', 'photo inHomepage === false' ,function(value){ return value === false; });
    assertMongo.call(test, 'db.photos.findOne({_id:"'+photoId+'"})', 'photo.share === true' ,function(value){return value.share.inHomepage===false && value.share.isPublic===false; });
    assertMongo.call(test, 'db.albums.findOne({_id:"'+albumId+'"})', 'albums.share === undef' ,function(value){return value.share === undefined; });
    assertMongo.call(test, 'db.users.findOne({_id:"'+userId+'"})', 'users.share === undef' ,function(value){return value.share === undefined; });
  });


  logout();
  casper.then(function(){
    test.assertFalsy(clientFindOnePhoto(photoId), "photo absente sur la homepage client ");
  });
  login(1);
  casper.wait(100,function(){
    test.assertFalsy(clientFindOnePhoto(photoId), "photo absente sur la homepage client");
  });
  gotoPhoto();
  casper.wait(100,function(){
    sc_("photo");
    test.assertFalsy(clientFindOnePhoto(photoId), "photo absente sur la page photo client");
  });
  logout();


  casper.run(function() {
//    sc_("text_edit_fin");
    test.done();
  });
});
