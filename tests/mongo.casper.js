// -*-  mode:js2;coding:utf-8 -*-

var colorizer = require('colorizer').create('Colorizer');

var childProcess;
try {
  childProcess = require("child_process");
} catch (e) {
  console.log(e, "error");
}


var mongo = function(query, handler) {
  if (childProcess) { // printjsononeline
    childProcess.execFile("/usr/bin/mongo", ["--quiet", "--eval", 'JSON.stringify('+query+')', "127.0.0.1:3001/meteor"], null, handler);
  } else {
    casper.test.fail("Mongo: Unable to require child process");
  }
};

var assertMongo = function assertMongo (query, message ,testp){
  var self = this;
  var returnFlag = false;

  mongo(query, function (err, stdout, stderr) {
    if (err)
      console.log("error:", error);
    else {
      var obj = JSON.parse(stdout);
      casper.test.assert(testp(obj), colorizer.colorize('[mongo] ', 'PARAMETER')+message);
    }
    returnFlag = true;
  });

  casper.waitFor(function(){return returnFlag;});
};



clientFindOnePhoto = function(phid){
    return casper.evaluate(function(phid){
        return Photos.findOne({_id:phid});
    }, phid);
};


// mongo('db.acl.findOne()', function (err, stdout, stderr) {
//   try{
//     console.log(stdout);
//     var obj = JSON.parse(stdout);
//     console.log("execFileSTDOUT:", obj._id, 'debug');
//     //console.log("execFileSTDERR:", JSON.stringify(stderr), 'debug');
//   } catch (e) {
//     console.log(e, "error");
//   }
// });

// assertMongo('db.acl.findOne()._id', function(value){
//   return value._id === 'aTzXgCouLBWhoQthN\n';
// });
