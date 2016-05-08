// -*-  mode:js2;coding:utf-8 -*-
//var mouse = require('mouse').create(casper);

var url=baseURL+'/';
testId="my_profile";


casper.test.begin("Test myprofile", function suite(test) {

  casper.start(url, function() {
    this.viewport(1024, 768);
  });


  login();
  gotoMyProfile();

  casper.then(function() {
        sc_("myprofile");
        test.assertExists('.dropzone');
        test.assertExists('.uploadImages');

    /*
        casper.evaluate(function(file) {
            return $('.uploadImages').val(file);
        }, 'tests/logo.jpg');
        */


         this.evaluate(function(fileName) {__utils__.findOne('input[type="file"]').setAttribute('value',fileName)},{fileName:'tests/logo.jpg'});

        test.assertField('.uploadImages','tests/logo.jpg');
  });

  casper.wait(2000,function() {
        sc_("myprofilelo");
        test.assertField('.uploadImages','tests/logo.jpg');
        test.assertDoesntExist('.dropzone');
    });

  casper.run(function() {
//    sc_("text_edit_fin");
    test.done();
  });
});
