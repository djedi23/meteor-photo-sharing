var searchLimit = 10;

Meteor.methods({
  search: function (term) {
    var self = this;
    check(term, String);
    var users = Meteor.users.find({'profile.name.value': {$regex: '.*' + term + '.*'}},  { limit: searchLimit, fields: {profile: 1}}).map(
      function (u) {
/*      if (Meteor.isServer){
        if (self.userId) {
      // Faire un chack ACL ici
        }
      }
*/
        u.type = "searchUser";
        return u;
      });
    var photos = Photos.find({
   //   $and: [{
        $or: [{'title': {$regex: '.*' + term + '.*' }},
              {'title': {$regex: '.*' + term + '.*' }}]},
     //       {'share.isPublic': true}]},
      { limit: searchLimit, fields: { image: 1, title: 1, owner:1 }
    }).map(function (p) {
      if (Meteor.isServer){
        if (self.userId) {
          if (p.owner !== self.userId){
            var acl =  Acl.find({
              $or: [{ collection: "photos", key: "share.isPublic",value: true},
                    { collection: "photos", key: "share.friends", value: this.selfId}]});
            if (acl.count()===0)
              return null;
          }
        } else {
          acl =  Acl.find({ collection: "photos", key: "share.isHomepage",value: true});
          if (acl.count()===0)
            return null;
        }
      }
      p.type = "searchPhoto";
      delete p.owner;
      return p;
    });
    return _.compact(users.concat(photos));
  }
});