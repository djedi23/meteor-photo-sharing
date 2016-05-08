var parent = function(self, field){
  var controller = Iron.controller();
  if (controller.route.options.share){
    var parent;
    var shares = controller.route.options.share();
    for (var i=0; i< shares.length; i++){
      var share = shares[i];
      var inController = share.queryInController === undefined? true:share.queryInController;
      if (inController)
        parent = share.collection.findOne({_id: controller.params[share.parent]});
      else
        parent = share.collection.findOne({_id: self[share.parent]});
      if (parent && parent.share && parent.share[field]!==undefined)
        return parent.share[field];
    }
  }
};


Template.editShareForm.events({
  'click #closeb': function(evt){
    Session.set('editMode', undefined);
  }
});

Template.editSharePermissions.helpers({
  context: function(kw) {
    if (kw === undefined || _.isEmpty(this) || this ===undefined)
      return {};
    var hash = kw.hash;
    var self = this;
    var share = {
      object: self,
      field: self.share?self.share[hash.key]:undefined,
      parent: parent(self, hash.key),
      key: hash.key,
      label: hash.label
    };
    return share;
  }

});



var parentHelpers = {
  haveParent: function(){
    if (this.object)
      return parent(this.object, this.key)!==undefined;
  },
  isEmpty: function(value){
    return value === undefined || value === null || (_.isArray(value) && _.isEmpty(value));
  }
}
Template.permission.helpers(parentHelpers);

var depends = {
  inHomepage: {on:{isPublic:true}},
  isPublic: {off: {inHomepage:false}}
};

var parentPermissionEvent = {
  'change .parentPermission': function(evt) {
    var target = evt.target;
    var remove = {};
    remove['share.'+ target.dataset.key]=true;
    var collection = {album: Albums, photo:Photos, user:Meteor.users}[this.object.type];
    collection.update({_id: this.object._id}, {$unset: remove});
  }
};

Template.permission.events(_.extend({
  'change input.permission': function(evt) {
    var target = evt.target;
    var update = {};
    update['share.'+target.dataset.key] = target.checked;
    if (depends[target.dataset.key] && depends[target.dataset.key][target.checked?'on':'off']) {
      _.each(_.pairs(depends[target.dataset.key][target.checked?'on':'off']),
             function(field){
               update['share.'+ field[0]] = field[1];
             });
    }
    var collection = {album: Albums, photo:Photos, user:Meteor.users}[this.object.type];
    collection.update({_id: this.object._id}, {$set: update});
  }
}, parentPermissionEvent));



var friendsHelper = {
  friends: function(){
    var friendsList = Meteor.user()?_.difference(_.pluck(Meteor.user().friends,'user'), this.field):[];
    return _.isEmpty(friendsList)?null:Meteor.users.find({_id: {$in: friendsList}});
  }
};

Template.permissionFriend.helpers(_.extend({
  parentTags:function() {
    return Meteor.users.find({_id: {$in: this.parent || [] }});
  },
  tags:function() {
    return Meteor.users.find({_id: {$in: this.field || [] }});
  }
}, parentHelpers, friendsHelper));

Template.permissionFriend.events(_.extend({
  'click #tagRemove': function(evt,tpl){
    var context = Template.parentData(1);
    var invisible = {};
    invisible['share.'+tpl.data.key] = this._id;
    var collection = {album: Albums, photo:Photos, user:Meteor.users}[context.type];
    collection.update({_id: context._id}, {$pull: invisible});
  }
}, parentPermissionEvent));


Template.friendDropdown.onRendered(function(){
  $('.dropdown-button').dropdown();
});

Template.friendDropdown.helpers(friendsHelper);

Template.friendDropdown.events({
  'click #add': function(evt,tpl) {
    var target = tpl.data.object;
    var visible = {};
    visible['share.'+tpl.data.key] = this._id;
    var collection = {album: Albums, photo:Photos, user:Meteor.users}[target.type];
    collection.update({_id: target._id}, {$addToSet: visible});
  }
});
