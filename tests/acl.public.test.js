// -*-  mode:js2;coding:utf-8 -*-
//var mouse = require('mouse').create(casper);

var url=baseURL+'/';
testId="acl_public";

var idPool = [];

casper.test.begin("Test acl public", function suite(test) {

  casper.start(url, function() {
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


  casper.thenClick('input[data-key="isPublic"]', function(){
    /*
     * PUBLIC:
     * user: false  undef
     * album: false undef
     * photo: true  true
     *
     * HOMEPAGE:
     * user: false  undef
     * album: false undef
     * photo: false  undef
     */
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoId+'", key:"share.isPublic"}).value', 'photo isPublic === true' ,function(value){ return value === true; });
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoId+'", key:"share.inHomepage"}).value', 'photo inHomepage === false' ,function(value){ return value === false; });
    assertMongo.call(test, 'db.photos.findOne({_id:"'+photoId+'"})', 'photo.share === true' ,function(value){return value.share.inHomepage===undefined && value.share.isPublic===true; });
    assertMongo.call(test, 'db.albums.findOne({_id:"'+albumId+'"})', 'albums.share === undef' ,function(value){return value.share === undefined; });
    assertMongo.call(test, 'db.users.findOne({_id:"'+userId+'"})', 'users.share === undef' ,function(value){return value.share === undefined; });
  });


  logout();
  casper.wait(100,function(){
    /*
     * Public: invisible sur la home si loggé
     */
    sc_("home");
    test.assertFalsy(clientFindOnePhoto(photoId), "photo absente sur la homepage client");
  });
  login(1);
  casper.wait(100,function(){
    /*
     * Public: visible sur la home si loggé
     */
    sc_("home2");
    test.assertTruthy(clientFindOnePhoto(photoId), "photo présente sur la homepage client");
  });
  gotoPhoto();
  casper.wait(100,function(){
    /*
     * Public: visible directement
     */
    sc_("photo");
    test.assertTruthy(clientFindOnePhoto(photoId), "photo présente sur la page photo client");
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
    test.assertFalse(clientFindOnePhoto(photoId), "photo absente sur la homepage client");
  });
  logout();


  casper.run(function() {
//    sc_("text_edit_fin");
    test.done();
  });
});
