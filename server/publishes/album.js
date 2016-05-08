Meteor.publishComposite('album', function (id, limit) {
  return {
    find: function () {
      check(id, checkMeteorId);
      check(limit, Number);
      var acl = Acl.findOne({
        collection: "albums",
        id: id,
        key: "share.isPublic",
        value: true
      });
      if (acl)
        return Albums.find({
          _id: id
        }, {
          fields: {
            'share.friends': 0
          },
          limit: 1
        });
      else
        return Albums.find({
          $and: [{
              _id: id
            },
            {
              owner: this.userId
            }
        ]
        }, {
          limit: limit
        });
    },
    children: [
      {
        find: function (album) {
          var self = this;
          var photos = Photos.find({
            _id: {
              $in: album.photos
            }
          }, {
            sort: {
              createdAt: -1
            },
            fields: {
              'share.friends': 0
            },
            limit: limit
          }).map(function (p) {
            if (self.userId) {
              if (p.owner !== self.userId) {
                var acl = Acl.find({
                  $or: [{
                      collection: "photos",
                      key: "share.isPublic",
                      value: true
                    },
                    {
                      collection: "photos",
                      key: "share.friends",
                      value: this.selfId
                    }]
                });
                if (acl.count() === 0)
                  return null;
              }
            }
            else {
              acl = Acl.find({
                collection: "photos",
                key: "share.isPublic",
                value: true
              });
              if (acl.count() === 0)
                return null;
            }
            return p._id;
          });
          return Photos.find({
            _id: {
              $in: photos
            }
          }, {
            sort: {
              createdAt: -1
            },
            fields: {
              'share.friends': 0
            },
            limit: limit
          });
        },
        children: [
          {
            find: function (photo) {
              return Images.find({
                _id: photo.image
              }, {
                limit: limit
              });
            }
          }
        ]
      }
    ]
  }
});
