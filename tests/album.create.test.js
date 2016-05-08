// -*-  mode:js2;coding:utf-8 -*-
//var mouse = require('mouse').create(casper);

var url=baseURL+'/';
testId="create_album";


casper.test.begin("Test create album", function suite(test) {

  casper.start(url, function() {
    this.viewport(1024, 768);
  });

  login();

  casper.waitForText('Nouvel Album');
  casper.thenClick('.album a');

  casper.waitForSelector('#actionDeleteAlbum', function (){
    test.assertExists('.dropzone', "Dropzone existe");    
  });
  casper.thenClick('#actionDeleteAlbum');

  casper.waitForSelector('#addAlbum', function() {
    test.assertDoesntExist('.album', "Aucun album n'existe");
  });
  casper.thenClick('#addAlbum');

  casper.waitForText('Nouvel Album', function(){
    test.assertExists('.album', "Album existe");    
  });
  casper.thenClick('.album a');
  casper.waitForSelector('#actionDeleteAlbum', function (){
    test.assertExists('.dropzone', "Dropzone existe");    
  });

  casper.run(function() {
//    sc_("text_edit_fin");
    test.done();
  });
});
