Template.album.helpers({
  photos: function(){
    if (this.photos)
      return {photos: Photos.find({_id: {$in: this.photos}}, {sort: {createdAt: -1}}), album:this};
  },
  isOwner: function(){
    return Meteor.userId() && Meteor.userId() === this.owner;
  },
  editShareMode: function() {
    return Session.equals('editMode', 2);
  },
  editModeCss: function(){
    return  (Session.get("editMode") !== undefined);
  }
});

Template.album.events({
  'click #toggleEditShareMode': function(){
    if (Session.equals("editMode", 2))
      Session.set('editMode', undefined);
    else
      Session.set('editMode', 2);
  },
  'click #actionDeleteAlbum': function() {
    var self= this;
    Photos.find({albums: this._id}).forEach(function(photo){
      Photos.update({_id: photo._id}, {$pull: {albums: self._id}});
    });
    Albums.remove({_id:this._id});
    Router.go('/');
  }
});

Template.album.rendered = function(){
  Session.set('mainstream_limit', 10);
  var data = this.data;
  this.autorun(function () {
    Meteor.subscribe('album', data._id, Session.get('mainstream_limit'));
  });

  if (this.data){
    if (Meteor.userId() && this.data.owner === Meteor.userId())
      $(this)[0].pen = new Pen({editor: $('.editable')[0], stay:false});
  }
};

Template.album.destroyed = function () {
  if (this.pen)
    $(this)[0].pen.destroy();
};


Template.album.events({
  'focusout .editable': function(evt, tpl) {
    var self=this;
    Meteor.setTimeout(function(){
      //if (validate(evt.target,$(evt.target).html().trim())) {
      var update = {};
      update[evt.target.dataset.key] = $(evt.target).html().trim();
 //     console.log(update, self._id, evt);
      Albums.update({_id:self._id}, {$set: update}, function(err,result){
	//Meteor.setTimeout(function(){$(evt.target).html();}, 1);
      });
      //$(evt.target).html('&nbsp;');
      //}
    }, 500);
  }
});
