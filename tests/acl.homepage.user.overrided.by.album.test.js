// -*-  mode:js3;coding:utf-8 -*-
//var mouse = require('mouse').create(casper);

var url=baseURL+'/';
testId="acl_homepage_user_overrided_by_album";


casper.test.begin("Test acl user homepage overrided by a album", function suite(test) {

  casper.start(url, function() {
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


  casper.thenClick('input[data-key="inHomepage"]', function(){
    casper.echo("photo partagée via profil","INFO");
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
    assertMongo.call(test, 'db.users.findOne({_id:"'+userId+'"})', 'users.share === true' ,function(value){return value.share.inHomepage===true && value.share.isPublic===true; });
  });
  gotoAlbum(true);
  casper.thenClick('input[data-key="inHomepage"].permission', function(){
    casper.echo("album explicitement partagée","INFO");
    /*
     * PUBLIC: acl share
     * user:  true  true
     * album: true  true
     * photo: true  undef
     *
     * HOMEPAGE:
     * user:  true  true
     * album: true  true
     * photo: true  undef
     */
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoAlbumId+'", key:"share.isPublic"}).value', 'photo A isShare === true' ,function(value){return value === true; });
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoAlbumId+'", key:"share.inHomepage"}).value', 'photo A inHomepage === true' ,function(value){ return value === true; });
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoId+'", key:"share.isPublic"}).value', 'photo B isShare === true' ,function(value){return value === true; });
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
    assertMongo.call(test, 'db.albums.findOne({_id:"'+albumId+'"})', 'albums.share === true' ,function(value){return value.share.inHomepage===true && value.share.isPublic===true; });
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
  gotoAlbum(true);
  casper.waitForSelector('#aminHomepage',function(){
    test.assertFalsy(casper.evaluate(function(){return $('#aminHomepage').prop('checked');}), "photo A: default homepage unchecked");
    test.assertFalsy(casper.evaluate(function(){return $('#amisPublic').prop('checked');}), "photo A: default public unchecked");
  });

  casper.thenClick('input[data-key="isPublic"].permission', function(){
    casper.echo("album explicitement non partagée","INFO");
    /*
     * PUBLIC: acl share
     * user:  true  true
     * album: false false
     * photo: true  undef
     *
     * HOMEPAGE:
     * user:  true  true
     * album: false false
     * photo: true  undef
     */
    casper.wait(100,function(){
      assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoAlbumId+'", key:"share.isPublic"}).value', 'photo A isShare === false' ,function(value){return value === false; });
      assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoAlbumId+'", key:"share.inHomepage"}).value', 'photo A inHomepage === false' ,function(value){ return value === false; });
      assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoId+'", key:"share.isPublic"}).value', 'photo B isShare === true' ,function(value){return value === true; });
      assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoId+'", key:"share.inHomepage"}).value', 'photo B inHomepage === true' ,function(value){ return value === true; });
      assertMongo.call(test, 'db.acl.findOne({collection:"albums", id:"'+albumId+'", key:"share.isPublic"}).value', 'album isShare === false' ,function(value){ return value === false; });
      assertMongo.call(test, 'db.acl.findOne({collection:"albums", id:"'+albumId+'", key:"share.inHomepage"}).value', 'album inHomepage === false' ,function(value){ return value === false; });
      assertMongo.call(test, 'db.acl.findOne({collection:"albums", id:"'+albumId+'", key:"share.isPublic"}).photos', 'album isShare contient pas photo A' ,function(value){return value.indexOf(photoAlbumId) === -1; });
      assertMongo.call(test, 'db.acl.findOne({collection:"albums", id:"'+albumId+'", key:"share.inHomepage"}).photos', 'album inHomepage contient pas photo A' ,function(value){ return value.indexOf(photoAlbumId) === -1; });
      assertMongo.call(test, 'db.acl.findOne({collection:"users", id:"'+userId+'", key:"share.isPublic"}).value', 'user isShare === true' ,function(value){ return value === true; });
      assertMongo.call(test, 'db.acl.findOne({collection:"users", id:"'+userId+'", key:"share.inHomepage"}).value', 'user inHomepage === true' ,function(value){ return value === true; });
      assertMongo.call(test, 'db.acl.findOne({collection:"users", id:"'+userId+'", key:"share.isPublic"}).photos', 'user isShare contient 2 photos' ,function(value){return value.length === 2; });
      assertMongo.call(test, 'db.acl.findOne({collection:"users", id:"'+userId+'", key:"share.inHomepage"}).photos', 'user inHomepage contient 2 photos' ,function(value){ return value.length === 2; });
      assertMongo.call(test, 'db.acl.findOne({collection:"users", id:"'+userId+'", key:"share.isPublic"}).albums', 'user isShare contient pas album' ,function(value){return value.indexOf(albumId) === -1; });
      assertMongo.call(test, 'db.acl.findOne({collection:"users", id:"'+userId+'", key:"share.inHomepage"}).albums', 'user inHomepage contient pas album' ,function(value){ return value.indexOf(albumId) === -1; });
      assertMongo.call(test, 'db.photos.findOne({_id:"'+photoId+'"})', 'B photo.share === undef' ,function(value){return value.share === undefined; });
      assertMongo.call(test, 'db.photos.findOne({_id:"'+photoAlbumId+'"})', 'A photo.share === undef' ,function(value){return value.share === undefined; });
      assertMongo.call(test, 'db.albums.findOne({_id:"'+albumId+'"})', 'albums.share === true' ,function(value){return value.share.inHomepage===false && value.share.isPublic===false; });
      assertMongo.call(test, 'db.users.findOne({_id:"'+userId+'"})', 'users.share === true' ,function(value){return value.share.inHomepage===true && value.share.isPublic===true; });
    });
  });
  logout();
  casper.wait(100,function(){
    /*
     * homepage: visible sur la home si pas loggé
     */
    test.assertFalsy(clientFindOnePhoto(photoAlbumId), "photo A non présente sur la homepage client");
    test.assertTruthy(clientFindOnePhoto(photoId), "photo B présente sur la homepage client");
  });
  login(1);
  casper.wait(100,function(){
    /*
     * homepage: visible sur la home si loggé
     */
    test.assertFalsy(clientFindOnePhoto(photoAlbumId), "photo A non présente sur la homepage client");
    test.assertTruthy(clientFindOnePhoto(photoId), "photo B présente sur la homepage client");
  });
  gotoPhotoAlbum();
  casper.wait(100,function(){
    /*
     * homepage: visible directement si loggé
     */
    test.assertFalsy(clientFindOnePhoto(photoAlbumId), "photo A non présente sur la page photo client");
  });
  logout();



  
  login();
  gotoAlbum(true);
  casper.waitForSelector('#aminHomepage',function(){
    test.assertFalsy(casper.evaluate(function(){return $('#aminHomepage').prop('checked');}), "photo A: default homepage unchecked");
    test.assertFalsy(casper.evaluate(function(){return $('#amisPublic').prop('checked');}), "photo A: default public unchecked");
  });
  casper.thenClick('#aminHomepage');
  casper.thenClick('#amisPublic', function(){
    casper.echo("photo dans album revient sur la config user","INFO");
    /*
     * PUBLIC: acl share
     * user:  true  true
     * album: true  undef
     * photo: true  undef
     *
     * HOMEPAGE:
     * user:  true  true
     * album: true  undef
     * photo: true  undef
     */
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoAlbumId+'", key:"share.isPublic"}).value', 'photo A isShare === true' ,function(value){return value === true; });
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoAlbumId+'", key:"share.inHomepage"}).value', 'photo A inHomepage === true' ,function(value){ return value === true; });
    assertMongo.call(test, 'db.acl.findOne({collection:"photos", id:"'+photoId+'", key:"share.isPublic"}).value', 'photo B isShare === true' ,function(value){return value === true; });
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
    assertMongo.call(test, 'db.albums.findOne({_id:"'+albumId+'"})', 'albums.share === undef' ,function(value){return Object.keys(value.share).length===0; });
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


  

  casper.run(function() {
    //    sc_("text_edit_fin");
    test.done();
  });
});
