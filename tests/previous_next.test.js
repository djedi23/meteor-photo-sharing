// -*-  mode:js2;coding:utf-8 -*-
//var mouse = require('mouse').create(casper);

var url=baseURL+'/';
testId="previous_next_homepage";


casper.test.begin("Test previous_next homepage", function suite(test) {

  casper.start(url, function() {
    clearStorage();
    this.viewport(1024, 768);
  });

  casper.then(function(){
    test.assertFalsy(clientFindOnePhoto(photoId), "photo absente sur la homepage client");
  });

  login();
  gotoPhoto();
  casper.waitForSelector("#mainPhoto",function(){
    test.assertExists('#previous');
    test.assertDoesntExist('#next');
    
    test.assertTruthy(clientFindOnePhoto(photoId), "photo B présente sur la homepage client");
  //  sc_("photo");
    var next = casper.evaluate(function(){
        return NextPhoto.findOne();
    });
    test.assertFalsy(next, "photo next absente");

    var previous = casper.evaluate(function(){
        return PreviousPhoto.findOne();
    });
    test.assertTruthy(previous, "photo previous présente");
  });

  casper.thenClick("#previous",function(){
  });
  casper.waitForSelector("#mainPhoto",function(){
    test.assertExists('#previous');
    test.assertExists('#next');
    
    test.assertTruthy(clientFindOnePhoto(photoId), "photo présente sur la homepage client");
    var next = casper.evaluate(function(){
        return NextPhoto.findOne();
    });
    test.assertTruthy(next, "photo next présente");

    var previous = casper.evaluate(function(){
        return PreviousPhoto.findOne();
    });
    test.assertTruthy(previous, "photo previous présente");
  });

  casper.thenClick("#previous",function(){
  });
  casper.waitForSelector("#mainPhoto",function(){
    test.assertDoesntExist('#previous');
    test.assertExists('#next');
    
    test.assertTruthy(clientFindOnePhoto(photoId), "photo présente sur la homepage client");
    var next = casper.evaluate(function(){
        return NextPhoto.findOne();
    });
    test.assertTruthy(next, "photo next présente");
    var previous = casper.evaluate(function(){
                     return PreviousPhoto.findOne();
                   });
    test.assertTruthy(previous, "photo previous présente"); // Les photos restent dans le cache
  });
  casper.thenClick("#next",function(){
  });
  casper.waitForSelector("#mainPhoto",function(){
    test.assertExists('#previous');
    test.assertExists('#next');
    
    test.assertTruthy(clientFindOnePhoto(photoId), "photo présente sur la homepage client");
    var next = casper.evaluate(function(){
        return NextPhoto.findOne();
    });
    test.assertTruthy(next, "photo next présente");

    var previous = casper.evaluate(function(){
        return PreviousPhoto.findOne();
    });
    test.assertTruthy(previous, "photo previous présente");
  });



  logout();
  login(1);
  gotoPhoto();
  casper.waitForSelector("#mainPhoto",function(){
    test.assertExists('#previous');
    test.assertDoesntExist('#next');
    
    test.assertTruthy(clientFindOnePhoto(photoId), "photo B présente sur la homepage client");
  //  sc_("photo");
    var next = casper.evaluate(function(){
        return NextPhoto.findOne();
    });
    test.assertFalsy(next, "photo next absente");

    var previous = casper.evaluate(function(){
        return PreviousPhoto.findOne();
    });
    test.assertTruthy(previous, "photo previous présente");
  });
  casper.thenClick("#previous",function(){
  });
  casper.waitForSelector("#mainPhoto",function(){
    test.assertDoesntExist('#previous');
    test.assertExists('#next');
    
    test.assertTruthy(clientFindOnePhoto(photoId), "photo présente sur la homepage client");
    var next = casper.evaluate(function(){
        return NextPhoto.findOne();
    });
    test.assertTruthy(next, "photo next présente");
    var previous = casper.evaluate(function(){
                     return PreviousPhoto.findOne();
                   });
    test.assertTruthy(previous, "photo previous présente"); // Les photos restent dans le cache
  });
  

  casper.run(function() {
//    sc_("text_edit_fin");
    test.done();
  });
});
