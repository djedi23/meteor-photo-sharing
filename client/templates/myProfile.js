Template.myProfile.helpers({
  "default": function(val, defaut) {
    return val || TAPi18n.__(defaut);
  },
  "defaultb": function(val, defaut) {
    if (val === undefined)
      return defaut;
    return val;
  },
  picture: function(){
    if (Meteor.user().profile)
      return Images.findOne({_id:Meteor.user().profile.picture});
    return null;
  },
  picture2: function(){
    if (this.user && this.user.profile)
      return Images.findOne({_id:this.user.profile.picture});
    return null;
  },
  haveInvitationSent: function() {
    return Meteor.user() && ! _.isEmpty(Meteor.user().invitationSent);
  },
  invitationSent: function() {
    return _.map(Meteor.user().invitationSent,
      function(invit) {
        invit.date = moment(invit.date).fromNow();
        invit.user = Meteor.users.findOne({_id: invit.user});
        return invit;
      });
  },
  haveFriends: function() {
    return Meteor.user() && ! _.isEmpty(Meteor.user().friends);
  },
  friends: function() {
    return _.map(Meteor.user().friends,
      function(friend) {
        friend.date = moment(friend.date).fromNow();
        friend.user = Meteor.users.findOne({_id: friend.user});
        return friend;
      });
  },
  haveInvitations: function() {
    return Meteor.user() && ! _.isEmpty(Meteor.user().invitation);
  },
  invitation: function() {
    return _.map(Meteor.user().invitation,
      function(invit) {
        invit.date = moment(invit.date).fromNow();
        invit.user = Meteor.users.findOne({_id: invit.user});
        return invit;
      });
  }
});

Template.myProfile.rendered = function(){
  var self = this;
  $('.editable.light').each(function(index){
    $(this)[0].pen = new Pen({editor: $(this)[0], stay:false, list: ['bold', 'italic', 'underline']});
  });
  $('.editable.full').each(function(index){
    $(this)[0].pen = new Pen({editor: $(this)[0], stay:false});
  });
};

Template.myProfile.destroyed = function () {
  $('.editable').each(function(index){
    if ($(this)[0].pen)
      $(this)[0].pen.destroy();
  });
};


var validation = {email: function(value){
  return /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i.test(value)?true:TAPi18n.__("InvalidEmailAddress", value);
}};

var validate = function(field, value){
  var valid = validation[field.dataset.key]===undefined?true:validation[field.dataset.key](value);
  if (valid !== true) {
    $(field).addClass('hasError');
    Materialize.toast(valid, 4000);
    return false;
  }
  else
  {
    $(field).removeClass('hasError');
    return true;
  }
};


Template.myProfile.events({
  'focusout .editable': function(evt, tpl) {
    Meteor.setTimeout(function(){
      if (validate(evt.target,$(evt.target).html().trim())){
        var update = {};
        update['profile.'+evt.target.dataset.key+'.value'] = $(evt.target).html().trim();
        Meteor.users.update({_id:Meteor.userId()}, {$set: update}, function(err,result){
          Meteor.setTimeout(function(){$(evt.target).html(Meteor.user().profile[evt.target.dataset.key].value);}, 1);
        });
        $(evt.target).html('&nbsp;');
      }
    }, 500);
  },
  'change input[type=checkbox][data-acl]': function(evt) {
    var target = evt.target;
    var update = {};
    update['profile.'+target.dataset.acl+'.hidden'] = target.checked;
    Meteor.users.update({_id:Meteor.userId()}, {$set: update});
  },
  'click .pdropzone': function(e, tpl){
    e.stopPropagation();
    $('.uploadImages').click();
  },
  'change .uploadImages': function(event, template) {
    FS.Utility.eachFile(event, function(file) {
      Images.insert(file, function (err, fileObj) {
        if (Meteor.user() && Meteor.user().profile && Meteor.user().profile.picture)
          Images.remove({_id:Meteor.user().profile.picture});

        Meteor.users.update({_id:Meteor.userId()},{$set: {'profile.picture': fileObj._id}});
      });
    });
  },
  'dropped #dropzone': function(event, template) {
    FS.Utility.eachFile(event, function(file) {
      Images.insert(file, function (err, fileObj) {
        if (Meteor.user() && Meteor.user().profile && Meteor.user().profile.picture)
          Images.remove({_id:Meteor.user().profile.picture});

        Meteor.users.update({_id:Meteor.userId()},{$set: {'profile.picture': fileObj._id}});
      });
    });
  },
  'click #confirmInvitation': function(event){
    if (this.user){
      console.log( this);
      Meteor.users.update({_id:Meteor.userId()}, {$addToSet: {friends: {user: this.user._id, date: new Date()}},
						  $pull: {invitation: {user: this.user._id}}});
      Meteor.users.update({_id:this.user._id}, {$addToSet: {friends: {user: Meteor.userId(), date: new Date()}},
						$pull: {invitationSent: {user: Meteor.userId()}}});
    }
  }
});



Template.uploadProfile.events({
  'change .uploadImages': function(event, template) {
    FS.Utility.eachFile(event, function(file) {
      Images.insert(file, function (err, fileObj) {
        if (Meteor.user() && Meteor.user().profile && Meteor.user().profile.picture)
          Images.remove({_id:Meteor.user().profile.picture});
        Meteor.users.update({_id:Meteor.userId()},{$set: {'profile.picture': fileObj._id}});
      });
    });
  }
});
