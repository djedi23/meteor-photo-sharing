var searchValue = new ReactiveVar();


Template.searchUser.helpers({
  picture: function(){
    if (this.profile && this.profile.picture)
      return Images.findOne({_id:this.profile.picture});
    return null;
  }
});
Template.searchUser.onRendered(function() {
  var pid = this.data.profile.picture;
  this.autorun(function(){
    Meteor.subscribe('searchResult', pid);
  });
});

Template.searchPhoto.helpers({
  picture: function(){
    if (this.image)
      return Images.findOne({_id:this.image});
    return null;
  }
});
Template.searchPhoto.onCreated(function() {
  var pid = this.data.image;
  this.autorun(function(){
    Meteor.subscribe('searchResult', pid);
  });
});



Template.layout.helpers({
  profilePicture: function(){
    if (Meteor.user() && Meteor.user().profile && Meteor.user().profile.picture)
      return Images.findOne({_id:Meteor.user().profile.picture});
    return null;
  },
  searchResults: function() {
    return searchValue.get();
  }
});

Template.layout.events({
  "click #logoutButton": function(evt) {
    evt.preventDefault();
    if (Meteor.userId())
      AccountsTemplates.logout();
  },
  "keyup #search": function(evt){
    var val = $("#search").val().trim();
    if (_.isEmpty(val))
      searchValue.set(undefined);
    else
      Meteor.call('search',val,
        function(err,result){
          if (_.isEmpty(result))
            searchValue.set(undefined);
          else
            searchValue.set(result);
        });
  },
  "click #searchReset": function(){
    searchValue.set(undefined);
    $("#search").val("");
    console.log("*****",$("#search").val());
  }
});

Template.layout.onCreated(function() {
  this.subscribe('myProfile');
});

Template.layout.rendered = function() {
  this.autorun(function(){
    $('.button-collapse').sideNav({ closeOnClick: true});
    $('#search').dropdown({belowOrigin:true});

    if (Meteor.user()) {
      Meteor.setTimeout(function(){
        $('.dropdown-button').dropdown({belowOrigin:true});
      }, 100);
    }
  });
};