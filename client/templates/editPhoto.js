NextPhoto = new Meteor.Collection("nextPhoto");
PreviousPhoto = new Meteor.Collection("previousPhoto");



var actionDelete = function() {
  Images.remove({_id:this.image});
  Photos.remove({_id:this._id});
  Router.go('/');
};

var commonHelpers = {
    isOwner: function(){
    return Meteor.userId() && Meteor.userId() === this.owner;
    }
};

var toggleEditShareMode = function(){
  if (Session.equals("editMode", 2))
    Session.set('editMode', undefined);
  else
    Session.set('editMode', 2);
};

Template.editPhoto.rendered = function(){
  if (this.data){
    if (Meteor.userId() && this.data.owner === Meteor.userId())
      $('.editable').each(function(index){
	$(this)[0].pen = new Pen({editor: $(this)[0], stay:false});
      });

      modules.calls('template.editphoto.rendered', this);
  }
  $('html,body').scrollTop(0);
};

Template.editPhoto.destroyed = function () {
  $('.editable').each(function(index){
    if ($(this)[0].pen)
      $(this)[0].pen.destroy();
  });
};

Template.editPhoto.helpers(_.extend({
  image: function(){
    return Images.findOne({_id: this.image});
  },
  "default_": function(val, defaut) {
    return val || (Meteor.userId() === this.owner && TAPi18n.__(defaut));
  },
  editShareMode: function() {
    return Session.equals('editMode', 2);
  },
  editModeCss: function(){
    return  (Session.get("editMode") !== undefined);
  },
  previousPhoto: function() {
    return PreviousPhoto.findOne({ 'createdAt': {'$lt': this.createdAt}},
      {sort: {'createdAt': -1}, limit:1});
  },
  nextPhoto: function() {
    return NextPhoto.findOne({ 'createdAt': {'$gt': this.createdAt}},
      {sort: {'createdAt':1}, limit:1});
  },
  tags: function(){
    var image = Images.findOne({_id:this.image});
    if (image && image.exiv2 && image.exiv2.Xmp && image.exiv2.Xmp.dc && image.exiv2.Xmp.dc.subject){
    return image.exiv2.Xmp.dc.subject.split(/, */);
    }
  }
}, commonHelpers));

Template.editPhoto.events({
  // 'focusout .title.editable': function(evt, tpl) {
  //   Photos.update({_id:this._id}, {$set: {'title': $(evt.target).html().trim()}});
  // },
  'focusout .editable': function(evt, tpl) {
    var self = this;
    Meteor.setTimeout(function(){
      // if (validate(evt.target,$(evt.target).html().trim())){
      var update = {};
      update[evt.target.dataset.key] = $(evt.target).html().trim();
      console.log(self,update);
      Photos.update({_id:self._id}, {$set: update});
      // , function(err,result){
      // 	  Meteor.setTimeout(function(){$(evt.target).html(Meteor.user().profile[evt.target.dataset.key].value);}, 1);
      // 	});
      //$(evt.target).html('&nbsp;');
      //      }
    }, 500);
  },
  'click #toggleEditShareMode': toggleEditShareMode,
  'click #actionDelete': actionDelete,
});

