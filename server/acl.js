/* global Acl ACL */
// ACL est un cache pour les permissions
Acl = new Mongo.Collection('acl');
Acl._ensureIndex({collection:1, id:1, key:1}, { background: true });
Acl._ensureIndex({collection:1, key:1, value:1}, { background: true });
Acl._ensureIndex({collection:1,id:1, key:1, value:1}, { background: true });



Acl.before.insert(function(userId, doc){
  doc.modified = new Date();
});

Acl.before.update(function (userId, doc, fieldNames, modifier, options) {
  modifier.$set = modifier.$set || {};
  modifier.$set.modified = new Date();
});



ACL =  {
  process: function(collection, doc, modifier){
    var sets=modifier['$set'];
    var unsets=modifier['$unset'];
    var addtosets=modifier['$addToSet'];
    var pulls=modifier['$pull'];
    if (sets){
      _.map(_.keys(sets),
        function(key){
          ACL.set[collection] (collection,doc, key,sets[key]);
        });
    }
    if (unsets) {
      _.map(_.keys(unsets),
        function(key){
          ACL.unset[collection] (collection,doc, key,unsets[key]);
        });
    }
    if (addtosets) {
      _.map(_.keys(addtosets),
        function(key){
          ACL.addtoset[collection] (collection,doc, key,addtosets[key]);
        });
    }
    if (pulls) {
      _.map(_.keys(pulls),
        function(key){
          ACL.pull[collection] (collection,doc, key,pulls[key]);
        });
    }
  },
  insert:{
    photos: function(doc){
      ACL.unset.photos('photos',doc,'share.isPublic');
      ACL.unset.photos('photos',doc,'share.inHomepage');
    },
    albums: function(doc){
      ACL.unset.albums('albums',doc,'share.isPublic');
      ACL.unset.albums('albums',doc,'share.inHomepage');
    },
    users: function(doc){
      Acl.insert({collection:'users', id:doc._id,key:'share.isPublic', value:false});
      Acl.insert({collection:'users', id:doc._id,key:'share.inHomepage', value:false});
    }
  },
  remove: {
    photos: function(doc) {
      Acl.remove({collection:"photos", id:doc._id});
      Acl.update({collection:"albums"}, {$pull:{photos: doc._id}}, {multi:true});
      Acl.update({collection:"users"}, {$pull:{photos: doc._id}}, {multi:true});
    },
    albums: function(doc) {
      var acl = Acl.findOne({collection:"albums",id:doc._id});
      Acl.remove({collection:"albums", id:doc._id});
      Acl.update({collection:"users"}, {$pull:{albums: doc._id}}, {multi:true});

      _.each(acl.photos, function(photoid){
        var photo = Photos.findOne({_id:photoid});
        _.each(['share.isPublic', 'share.inHomepage'], function(key) {
          if (! photo.share || photo.share[key.replace(/^share./,'')] === undefined){
            ACL.unset.photos('photos',photo,key);
          }
        });
      });
    }
  },
  addtoset: {
    albums: function(collection, doc, key, value){
      if (key === 'share.friends') {
        Acl.upsert({collection:'albums', id:doc._id, key:key}, {$set: {collection:'albums', id:doc._id, key:key},
								$addToSet:{value: value}});
	var query = {albums:doc._id};
	query[key] = {'$ne':value}; // {$exists: false};
	var photos = Photos.find(query);
	photos.map(function(photo){
          Acl.upsert({collection:'photos', id:photo._id, key:key}, {$set: {collection:'photos', id:photo._id, key:key}, $addToSet:{value: value}});
	});
      }
      else {
	var photo = Photos.findOne({_id:value});
	_.each(['share.isPublic', 'share.inHomepage'], function(key) {
          if (! photo.share || photo.share[key.replace(/^share./,'')] === undefined){
            var albumacl = Acl.findOne({collection:"albums", id:doc._id, key:key});
            if (! photo.albums)
              photo.albums = [doc._id];
            else
              photo.albums.push(doc._id);
            ACL.set.photos('photos',photo,key,albumacl.value);
        }
	});
      }
    },
    photos: function(collection, doc, key, value) {
      if (key === 'share.friends') {
        Acl.upsert({collection:'photos', id:doc._id, key:key}, {$set: {collection:'photos', id:doc._id, key:key},
          $addToSet:{value: value}});
      }
    },
    users: function(collection, doc, key, value) {
      if (key === 'share.friends') {
        Acl.upsert({collection:'users', id:doc._id, key:key}, {$set: {collection:'users', id:doc._id, key:key},
          $addToSet:{value: value}});
	var query = {owner:doc._id};
	query[key] = {'$ne': value};
	var albums = Albums.find(query);
	albums.map(function(album){
          Acl.upsert({collection:'albums', id:album._id, key:key}, {$set: {collection:'albums', id:album._id, key:key}, $addToSet:{value: value}});
	});
	var photos = Photos.find(query);
	photos.map(function(photo){
          Acl.upsert({collection:'photos', id:photo._id, key:key}, {$set: {collection:'photos', id:photo._id, key:key}, $addToSet:{value: value}});
	});
      }
    }
  },
  pull: {
    photos: function(collection, doc, key, value) {
      if (key === 'share.friends') {
        Acl.upsert({collection:'photos', id:doc._id, key:key}, {$set: {collection:'photos', id:doc._id, key:key},
	  $pull:{value: value}});
      }
    },
    albums: function(collection, doc, key, value) {
      if (key === 'share.friends') {
        Acl.upsert({collection:'albums', id:doc._id, key:key}, {$set: {collection:'albums', id:doc._id, key:key},
								 $pull:{value: value}});
	var query = {albums:doc._id};
	query[key] = {'$ne':value};
	var photos = Photos.find(query);
	photos.map(function(photo){
          Acl.update({collection:'photos', id:photo._id, key:key}, {$pull:{value: value}});
	});
      }
    },
    users: function(collection, doc, key, value) {
      if (key === 'share.friends') {
        Acl.upsert({collection:'users', id:doc._id, key:key}, {$set: {collection:'users', id:doc._id, key:key},
							       $pull:{value: value}});
	var query = {owner:doc._id};
	query[key] = {'$ne': value};
	var albums = Albums.find(query);
	albums.map(function(album){
          Acl.update({collection:'albums', id:album._id, key:key}, {$pull:{value: value}});
	});
	var photos = Photos.find(query);
	photos.map(function(photo){
          Acl.update({collection:'photos', id:photo._id, key:key}, {$pull:{value: value}});
	});
      }
    }
  },
  set:{
    photos: function(collection, doc, key, value){
      Acl.upsert({collection:collection, id:doc._id,key:key}, {$set: {collection:collection, id:doc._id,key:key, value:value}});

      _.each(doc.albums, function(album){
        if (value===true)
          Acl.upsert({collection:'albums', id:album, key:key}, {$set: {collection:'albums', id:album, key:key},
            $addToSet:{photos: doc._id}});
        else
          Acl.upsert({collection:'albums', id:album, key:key}, {$set: {collection:'albums', id:album, key:key},
            $pull:{photos: doc._id}});
      });
      if (value===true)
        Acl.upsert({collection:'users', id:doc.owner, key:key}, {$set: {collection:'users', id:doc.owner, key:key},
          $addToSet:{photos: doc._id}});
      else
        Acl.upsert({collection:'users', id:doc.owner, key:key}, {$set: {collection:'users', id:doc.owner, key:key},
          $pull:{photos: doc._id}});
    },
    albums:function(collection, doc, key, value){
      Acl.upsert({collection:collection, id:doc._id,key:key}, {$set: {collection:collection, id:doc._id,key:key, value:value}});

      _.each(doc.photos,function(photoid){
        var photo = Photos.findOne({_id:photoid});
        if (photo && (! photo.share || photo.share[key.replace(/^share./,'')] === undefined)){
          ACL.set.photos('photos',photo,key,value);
        }
      });

      if (value===true)
        Acl.upsert({collection:'users', id:doc.owner, key:key}, {$set: {collection:'users', id:doc.owner, key:key},
          $addToSet:{albums: doc._id}});
      else
        Acl.upsert({collection:'users', id:doc.owner, key:key}, {$set: {collection:'users', id:doc.owner, key:key},
          $pull:{albums: doc._id}});

    },
    users:function(collection, doc, key, value){
      Acl.upsert({collection:collection, id:doc._id,key:key}, {$set: {collection:collection, id:doc._id,key:key, value:value}});

      var query = {owner:doc._id};
      query[key] = {$exists: false};
      var albums = Albums.find(query);
      albums.map(function(album){
        ACL.set.albums('albums',album,key,value);
      });
      var photos = Photos.find(query);
      photos.map(function(photo){
        if (photo && (! photo.share || photo.share[key.replace(/^share./,'')] === undefined))
          ACL.set.photos('photos',photo,key,value);
      });
    }
  },
  unset: {
    photos: function(collection, doc, key, value){
      if (! _.isEmpty(doc.albums)){
        var acl;
        if (key === 'share.friends')
          acl = _.intersection.apply(this,_.map(doc.albums, function(album){
                                            var aacl = Acl.findOne({collection:'albums', id:album,key:key});
                                            if (aacl)
                                              return aacl.value;
                                          }));
        else
          acl = _.every(_.map(doc.albums, function(album){
                          var aacl = Acl.findOne({collection:'albums', id:album,key:key});
                          if (aacl)
                            return aacl.value;
                        }));
      } else{
        acl = Acl.findOne({collection:'users', id:doc.owner,key:key});
        if (acl)
          acl = acl.value;
      }

      //       ACL.set.photos('photos',doc,key,albumsacl);
      Acl.upsert({collection:collection, id:doc._id,key:key}, {$set: {collection:collection, id:doc._id,key:key, value:acl}});
      if (_.isEmpty(acl)){
        _.each(doc.albums, function(album){
          Acl.upsert({collection:'albums', id:album, key:key}, {$set: {collection:'albums', id:album, key:key},
            $addToSet:{photos: doc._id}});
        });
        Acl.upsert({collection:'users', id:doc.owner, key:key}, {$set: {collection:'users', id:doc.owner, key:key},
          $addToSet:{photos: doc._id}});
      }else{
        _.each(doc.albums, function(album){
          Acl.upsert({collection:'albums', id:album, key:key}, {$set: {collection:'albums', id:album, key:key},
            $pull:{photos: doc._id}});
        });
        Acl.upsert({collection:'users', id:doc.owner, key:key}, {$set: {collection:'users', id:doc.owner, key:key},
          $pull:{photos: doc._id}});
      }
    },
    albums: function(collection, doc, key, value){
      var useracl = Acl.findOne({collection:'users', id:doc.owner,key:key});
      ACL.set.albums('albums',doc,key,useracl.value);
    }
  }
};


Photos.after.update(function (userId, doc, fieldNames, modifier, options) {
  if (_.contains(fieldNames,'share')){
    ACL.process('photos',doc, modifier);
  }
}, {fetchPrevious: true});
Photos.after.insert(function(userId,doc){
  ACL.insert.photos(doc);
});
Photos.after.remove(function(userId,doc){
  ACL.remove.photos(doc);
});


Albums.after.update(function (userId, doc, fieldNames, modifier, options) {
  if (_.contains(fieldNames,'share') || _.contains(fieldNames,'photos')){
    ACL.process('albums',doc, modifier);
  }
}, {fetchPrevious: true});
Albums.after.insert(function(userId,doc){
  ACL.insert.albums(doc);
});
Albums.after.remove(function(userId,doc){
  ACL.remove.albums(doc);
});


Meteor.users.after.update(function (userId, doc, fieldNames, modifier, options) {
  if (_.contains(fieldNames,'share')){
    ACL.process('users',doc, modifier);
  }
}, {fetchPrevious: true});
Meteor.users.after.insert(function(userId,doc){
  ACL.insert.users(doc);
});
Meteor.users.after.remove(function(userId,doc){
  console.err("ACL after remove user");
  //  ACL.remove.user(doc);
});
