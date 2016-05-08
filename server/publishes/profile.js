
Meteor.publishComposite('profile', function(id) {
  return {
    find: function() {
      check(id, checkMeteorId);
      var user_ = Meteor.users.findOne({_id: id});
      var fields = {'profile.name':1, 'profile.picture':1};
      if (user_ && user_.profile){
        _.each(_.pairs(user_.profile), function(kv){
          if (kv[1]['hidden'] !== undefined && kv[1]['hidden'] === false)
            fields['profile.'+kv[0]] = 1;
        });
      }
      return Meteor.users.find(id, {fields: fields});
    },
    children: [
      {
        find: function(user) {
          if (user.profile)
            return Images.find({_id: user.profile.picture});
          return null;
        }
      }
    ]};});