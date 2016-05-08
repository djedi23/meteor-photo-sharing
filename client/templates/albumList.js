var width = 96;

Template.albumList.helpers({
  albums: function() {
    return Albums.find();
  },
  showExpandButton: function() {
    return Albums.find().count() > 0;
  },
  haveAlbum: function() {
    return Albums.find().count() > 0 && Session.equals('showAlbum', true);
  },
  width: function() {
    return width;
  },
  height: function() {
    if (this.metadata) {
      var self = this;
      return (this.metadata.size.height * width) / this.metadata.size.width;
    }
    //  else
    //       return width;
    return null;
  },
  photos: function() {
    if (this.photos) {
      var p = Photos.find({
        _id: {
          $in: this.photos
        }
      }, {
        sort: {
          createdAt: -1
        },
        limit: _prefs.album.numberOfThumbs
      });
      var phids = p.map(function(photo) {
        return photo.image;
      });
      return Images.find({
        _id: {
          $in: phids
        }
      });
    }
  }
});


Template.albumList.events({
  'click #addAlbum': function() {
    Albums.insert({
      name: TAPi18n.__('New Album')
    });
    Session.set('showAlbum', true);
  },
  'click #expandAlbumBar': function() {
    if (Session.equals('showAlbum', true))
      Session.set('showAlbum', undefined);
    else
      Session.set('showAlbum', true);
  },
  'drop .album': function(evt, tpl) {
    evt.preventDefault();
    var photoId = evt.originalEvent.dataTransfer.getData('photoId');
    if (this.owner === Meteor.userId() && !_.contains(this.photos, photoId)) {
      Albums.update({
        _id: this._id
      }, {
        $addToSet: {
          photos: photoId
        }
      });
      Photos.update({
        _id: photoId
      }, {
        $addToSet: {
          albums: this._id
        }
      });
    }
  },
  'dragenter .album': function(evt, tpl) {
    $(evt.currentTarget).addClass('draghover');
  },
  'dragleave .album': function(evt, tpl) {
    $(evt.currentTarget).removeClass('draghover');
  },
  'dragover .album': function(evt, tpl) {
    evt.preventDefault();
  }
});


Template.albumList.rendered = function() {
  //  $('.albumPanel').pushpin({offset:64, bottom:$('.photos-list').height()-200});
  $('.albumPanel').pushpin({
    offset: 64
  });
  var totalWidth = $(".albumPanel .row .col").length * 350; // $(".albumPanel .row col").outerWidth();
  console.log("www",totalWidth, $(".albumPanel .row .col").length, $(".albumPanel .row col").outerWidth());
  $('.albumPanel .row').css('width', totalWidth + 'px');
};
