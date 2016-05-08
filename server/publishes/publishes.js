
Meteor.publishComposite('photo', function(id) {
  return {
    find: function() {
      check(id, checkMeteorId);
      var acl = Acl.findOne({collection:"photos", id:id, key:"share.friends", value:this.userId})
       || Acl.findOne({collection:"photos", id:id, key:"share.isPublic", value:true});
      if (acl)
        return Photos.find({_id:id}, {fields: {'share.friends':0}});
      else
        return Photos.find({_id:id, owner:this.userId});
    },
    children: [
      {
        find: function(photo) {
          return Images.find({_id: photo.image});
        }
      },
      {
        find: function(photo) {
          return Meteor.users.find({_id: photo.owner}, {fields: {'profile.name': 1, 'profile.picture':1}});
        },
        children: [
          {
            find: function(user) {
              if (user.profile)
                return Images.find({_id: user.profile.picture});
              return null;
            }
          }
        ]
      },
      {
        collectionName: 'previousPhoto',
        find: function(photo){
          if (this.userId){
            // loggé:
            // les photos publiques et les homepages: explicitement ou via les albums (perm dans album mais rien dans images)
            var photoIds = Acl.find({$or: [{collection:"photos", key:"share.isPublic", value:true},
              {collection:"photos", key:"share.friends", value:this.userId}]},
              {sort:{modified:-1},limit:10}).map(function(o){return o.id;});
            return Photos.find({$and: [{ 'createdAt': {'$lt': photo.createdAt}},
              {$or: [{_id: {$in: photoIds}},
                {owner: this.userId}]}]},
              {sort: {'createdAt': -1},
                limit:1});
          } else {
            // pas loggé:
            // les photos sur la home: explicitement ou via les albums (perm dans album mais rien dans images)
            photoIds = Acl.find({collection:"photos", key:"share.inHomepage", value:true}, {sort:{modified:-1},limit:10}).map(function(o){return o.id;});
            return Photos.find({$and: [{ 'createdAt': {'$lt': photo.createdAt}},{_id: {$in: photoIds}}]},
              {fields: {'share.friends':0},
                sort: {'createdAt': -1},
                limit:1});
          }
        }
      },
      {
        collectionName: 'nextPhoto',
        find: function(photo){
          if (this.userId){
            // loggé:
            // les photos publiques et les homepages: explicitement ou via les albums (perm dans album mais rien dans images)
            var photoIds = Acl.find({$or: [{collection:"photos", key:"share.isPublic", value:true},
              {collection:"photos", key:"share.friends", value:this.userId}]},
              {sort:{modified:-1},limit:10}).map(function(o){return o.id;});
            return Photos.find({$and: [{ 'createdAt': {'$gt': photo.createdAt}},
              {$or: [{_id: {$in: photoIds}},
                {owner: this.userId}]}]},
              {sort: {'createdAt': 1},
                limit:1});
          } else {
            // pas loggé:
            // les photos sur la home: explicitement ou via les albums (perm dans album mais rien dans images)
            photoIds = Acl.find({collection:"photos", key:"share.inHomepage", value:true}, {sort:{modified:-1},limit:10}).map(function(o){return o.id;});
            return Photos.find({$and: [{ 'createdAt': {'$gt': photo.createdAt}},
              {_id: {$in: photoIds}}]},
              {fields: {'share.friends':0},
                sort: {'createdAt': 1},
                limit:1});
          }
        }
      },
      {
        find: function() {
          if (this.userId){
            var friends = Meteor.users.findOne(this.userId).friends;
            return Meteor.users.find({_id: {$in: _.pluck(friends,'user')}}, {fields: {'profile.name':1, 'profile.picture':1}});
          }
          return null;
        },
        children: [
          {
            find: function(user) {
              if (user.profile)
                return Images.find({_id: user.profile.picture});
              return null;
            }
          }
        ]}
    ]};
});


Meteor.publishComposite('myProfile', {
  find: function() {
    if (this.userId)
      return Meteor.users.find(this.userId);
    return null;
  },
  children: [
    {
      find: function(user) {
        if (user.profile)
          return Images.find({_id: user.profile.picture});
        return null;
      }
    },
    {
      find: function(user) {
        if (user.friends)
          return Meteor.users.find({_id: {$in: _.pluck(user.friends,'user')}}, {fields: {'profile.name':1, 'profile.picture':1}});
        return null;
      },
      children: [
        {
          find: function(user) {
            if (user.profile)
              return Images.find({_id: user.profile.picture});
            return null;
          }
        }
      ]},
    {
      find: function(user) {
        if (user.invitationSent)
          return Meteor.users.find({_id: {$in: _.pluck(user.invitationSent,'user')}}, {fields: {'profile.name':1, 'profile.picture':1}});
        return null;
      },
      children: [
        {
          find: function(user) {
            if (user.profile)
              return Images.find({_id: user.profile.picture});
            return null;
          }
        }
      ]},
    {
      find: function(user) {
        if (user.invitation)
          return Meteor.users.find({_id: {$in: _.pluck(user.invitation,'user')}}, {fields: {'profile.name':1, 'profile.picture':1}});
        return null;
      },
      children: [
        {
          find: function(user) {
            if (user.profile)
              return Images.find({_id: user.profile.picture});
            return null;
          }
        }
      ]}
  ]});


Meteor.publishComposite('allMyAlbums', {
  find: function() {
    return Albums.find({owner:this.userId});
  },
  children: [
    {
      find: function(album) {
        if (album.photos)
          return Photos.find({_id: {$in: album.photos}}, {sort: {createdAt:-1}, limit: _prefs.album.numberOfThumbs, fields: {'share.friends':0}});
      },
      children: [
        {
          find: function(photo){
            return Images.find({_id: photo.image});
          }
        }
      ]
    }
  ]
});



Meteor.publishComposite('searchResult', function(id) {
  return {
    find: function() {
      check(id, Match.OneOf(checkMeteorId, null));
      if (id===null) return null;
      return Images.find({_id: id});
    }
  };
});
