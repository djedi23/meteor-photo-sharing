
appVersion = new ReactiveVar();
Template.registerHelper('appVersion', function() {
    return appVersion.get();
});


Meteor.startup(function () {
    Meteor.call('appVersion', function(err, result){
        if (!err)
            appVersion.set(result);
    });
});
