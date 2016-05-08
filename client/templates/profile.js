Template.profile.helpers({
  picture: function(){
    if (this.profile)
      return Images.findOne({_id:this.profile.picture});
    return null;
  },
  invitable: function() {
    return (Meteor.userId() && Meteor.userId() !== this._id &&
      ! (_.contains(_.pluck(Meteor.user().invitationSent,'user'), this._id) ||
          _.contains(_.pluck(Meteor.user().friends,'user'), this._id)));
  }
});

Template.profile.events({
  "click #userInvite": function(evt){
    Meteor.users.update({_id:this._id}, {$addToSet: {invitation: {user: Meteor.userId(), date: new Date()}}});
    Meteor.users.update({_id:Meteor.userId()}, {$addToSet: {invitationSent: {user: this._id, date: new Date()}}});
  }
});
