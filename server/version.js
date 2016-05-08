
Meteor.methods({
  'appVersion': function appVersion(){
    var version = JSON.parse(Assets.getText('version.json'));
    return 'version:'+version.version+' date:'+version.date+(version.build?(' build:'+version.build):'');
  }
});
