Meteor.publishComposite('allMyPhotos', function (limit) {
  return {
    find: function () {
      check(limit,Number)
      if (this.userId) {
        // loggé:
        // les photos publiques et les homepages: explicitement ou via les albums (perm dans album mais rien dans images)
        var photoIds = Acl.find({
          $or: [{
            collection: "photos",
            key: "share.isPublic",
            value: true
          }, {
            collection: "photos",
            key: "share.friends",
            value: this.userId
          }]
        }, {
          sort: {
            modified: -1
          },
          limit: limit
        }).map(function (o) {
          return o.id;
        });
        return Photos.find({
          $or: [{
            _id: {
              $in: photoIds
            }
          }, {
            owner: this.userId
          }]
        },{limit:limit});
      }
      else {
        // pas loggé:
        // les photos sur la home: explicitement ou via les albums (perm dans album mais rien dans images)
        photoIds = Acl.find({
          collection: "photos",
          key: "share.inHomepage",
          value: true
        }, {
          sort: {
            modified: -1
          },
          limit: limit
        }).map(function (o) {
          return o.id;
        });
        return Photos.find({
          _id: {
            $in: photoIds
          }
        }, {
          fields: {
            'share.friends': 0},
          limit:limit
        });
      }
    },
    children: [{
      find: function (photo) {
        return Images.find({
          _id: photo.image
        });
      }
    }, {
      find: function (photo) {
        return Meteor.users.find({
          _id: photo.owner
        }, {
          fields: {
            'profile.name': 1,
            'profile.picture': 1
          }
        });
      },
      children: [{
        find: function (user) {
          if (user.profile)
            return Images.find({
              _id: user.profile.picture
            });
          return null;
        }
      }]
    }]
  }
});
