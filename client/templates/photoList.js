var width=512;
var height=512;

Template.photoCard.helpers({
  image: function() {
    var img = Images.findOne({_id: this.image});
    if (img) {
      _.debounce(function() {Masonry.data($('.photos-list .masonry-container')[0]).layout();}, 150) ();
    }
    return img;
  },
  double: function() {
    var img = Images.findOne({_id: this.image});
    if (img && img.metadata) {
      if (img.metadata.size.width / img.metadata.size.height >= 16/9) { // si on a une image très large, on cale la hauteur
        return "double";
      }
    }
    return null;
  },
  width: function(){
    if (! this.metadata || this.metadata.size.width >= this.metadata.size.height)
      return width;
    else
      return height* this.metadata.size.width / this.metadata.size.height;
  },
  height: function(){
    _.debounce(function() {Masonry.data($('.photos-list .masonry-container')[0]).layout();}, 150) ();
    if (! this.metadata || this.metadata.size.width < this.metadata.size.height)
      return height;
    else
      return width * this.metadata.size.height / this.metadata.size.width;
  },
  author: function() {
    var user = Meteor.users.findOne({_id: this.owner});
    if (user && user.profile && user.profile.name && user.profile.name.value)
      return user.profile.name.value;
    else
      return null;
  },
  authorPicture: function() {
    var user = Meteor.users.findOne({_id: this.owner});
    if (user && user.profile && user.profile.picture)
      return Images.findOne({_id:user.profile.picture});
    else
      return null;
  },
//   haveAlbum: function(){
//     console.log(this);
//     return Albums.find().count()>0;
//   },
  routeToPhoto: function(){
    var listData = Template.parentData();
    if (listData.album)
      return 'viewPhotoInAlbum';
    return 'editPhoto';
  }
});

Template.photoCard.events({
  'dragstart .card': function(evt,tpl) {
    evt.originalEvent.dataTransfer.setData('photoId', this._id);
    $('.album').addClass('dropzone');
  },
  'dragend .card': function(evt,tpl) {
    $('.album').removeClass('dropzone');
  },
  'mouseenter .card': function(evt, tpl){
    tpl.$('.card-title').addClass('visible');
  },
  'mouseleave .card': function(evt, tpl){
    tpl.$('.card-title').removeClass('visible');
  }
});

var moreOffset = -200;
var moreIncrement = 10;

moreCallback = function () {
  Meteor.setTimeout(function () {
  console.log(Session.get('mainstream_limit'));
    Session.set('mainstream_limit', Session.get('mainstream_limit') + moreIncrement);
    Materialize.scrollFire([{
      selector: '.more' + Session.get('mainstream_limit'),
      offset: moreOffset,
      callback: "moreCallback()"
    }]);
  }, 500);
};

Template.photoList.rendered = function () {
  Session.set('mainstream_limit', moreIncrement);
  Materialize.scrollFire([{
    selector: '.more' + Session.get('mainstream_limit'),
    offset: moreOffset,
    callback: "moreCallback()"
}]);
};

Template.photoList.helpers({
  'limit': function(){
    return Session.get('mainstream_limit');
  }
});