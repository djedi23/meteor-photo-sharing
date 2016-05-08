var subs = new SubsManager();

AccountsTemplates.configure({
  defaultLayout:'layout',
  enablePasswordChange: true,
  onLogoutHook: function() {
    var homeRoutePath = AccountsTemplates.options.homeRoutePath;
    subs.clear();
    Router.go(homeRoutePath);
  }});

AccountsTemplates.configureRoute('signIn');
AccountsTemplates.configureRoute('changePwd');

Router.configure({
  layoutTemplate: 'layout',
  fastRender: true
});

Router.plugin('ensureSignedIn', {
  only: ['myProfile']
});



Router.route('/', function () {
  this.render('mainstream', {
    data: function () { return Photos.find({}, {sort: {modified:-1}}); }
  });
}, {
  loadingTemplate: 'loading',
  name: 'mystream',
  fastRender: true,
  waitOn: function() {
    var self = this;
    return [ subs.subscribe('allMyPhotos', 10),
             subs.subscribe('allMyAlbums')];
  }
});


Router.route('/photo/:id', function () {
  this.render('editPhoto');
}, {
  loadingTemplate: 'loading',
  name:'editPhoto',
  share: function() {return [{parent:'owner', collection:Meteor.users, queryInController:false}];},
  data: function () { return Photos.findOne({_id:this.params.id}); },
  subscriptions: function() {
    var self = this;
    return [ subs.subscribe('photo', this.params.id) ];
  }
});

Router.route('/album/:album/photo/:id', function () {
  this.render('editPhoto');
}, {
  loadingTemplate: 'loading',
  name:'viewPhotoInAlbum',
  share: function() {return [{parent:'album', collection:Albums},
			     {parent:'owner', collection:Meteor.users, queryInController:false}];},
  data: function () { return Photos.findOne({_id:this.params.id}); },
  subscriptions: function() {
    var self = this;
    return [ subs.subscribe('photo', this.params.id),
    subs.subscribe('album', this.params.album, 10) ];
  }
});




Router.route('/profile', function () {
  this.render('myProfile', {
    data: function () { return Meteor.user(); }
  });
}, {
  loadingTemplate: 'loading',
  name:'myProfile',
  waitOn: function() {
    var self = this;
    return [ Meteor.subscribe('myProfile') ];
  }
});

Router.route('/profile/:id', function () {
  this.render('profile', {
    data: function () { return Meteor.users.findOne({_id:this.params.id}); }
  });
}, {
  loadingTemplate: 'loading',
  name:'profile',
  waitOn: function() {
    var self = this;
    return [ Meteor.subscribe('profile', this.params.id) ];
  }
});


Router.route('/album/:id', function () {
  this.render('album', {
    data: function () { return Albums.findOne({_id: this.params.id}); }
  });
}, {
  loadingTemplate: 'loading',
  name: 'album',
  share: function() {return [{parent:'owner', collection:Meteor.users, queryInController:false}];},
  waitOn: function() {
    var self = this;
    return [ subs.subscribe('album', this.params.id, 10)];
  }
});
