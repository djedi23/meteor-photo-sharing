// -*-  mode:js2;coding:utf-8 -*-
//var mouse = require('mouse').create(casper);

var url=baseURL+'/';
testId="search";


casper.test.begin("Test search", function suite(test) {

  casper.start(url, function() {
    clearStorage();
    this.viewport(1024, 768);
  });

  casper.then(function(){
    this.sendKeys("#search", "Utilisate");
  });

  casper.waitForSelector("#searchDrop .collection-item", function(){
    test.assertSelectorHasText("#searchDrop > li > a > span", "Utilisateur A");
    test.assertSelectorHasText("#searchDrop > li > a > span", "Utilisateur B");
  });


  casper.then(function(){
    this.sendKeys("#search", "Gorille", {reset:true});
  });

  casper.waitForSelector("#searchDrop .collection-item", function(){
    test.assertSelectorHasText("#searchDrop > li > a > span", "Gorille");
  },
    function(){
      test.fail("Photo Gorille non trouvé");
    }, 500);


  casper.then(function(){
    this.sendKeys("#search", "Bar", {reset:true});
  });

  casper.waitWhileSelector("#searchDrop .collection-item", function(){
    test.assertDoesntExist("#searchDrop > li > a > span");
  },
    function(){
      test.fail("Photo bar trouvée");
    }, 500);



  casper.run(function() {
//    sc_("text_edit_fin");
    test.done();
  });
});
