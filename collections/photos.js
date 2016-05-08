Photos = new Mongo.Collection('photos');

Photos.allow({
  insert: function(userId, doc) {
    //console.log(Roles.userIsInRole(userId, ['uploadPhoto','admin']));
    return (userId !== null && Roles.userIsInRole(userId, ['uploadPhoto','admin']))
  },
  update: function(userId, doc, fieldNames, modifier) {
    return userId!==null && userId == doc.owner;
  },
  remove: function(userId, doc) {
    return userId!==null && userId == doc.owner;
  }
});


Photos.deny({
  insert: function(userId, doc) {
    return userId == null;
  },
  update: function(userId, doc, fieldNames, modifier) {
    return userId==null && userId != doc.owner;
  },
  remove: function(userId, doc) {
    return userId==null && userId != doc.owner;
  }
});


Photos.before.insert(function (userId, doc) {
  doc.createdAt = Date.now();
  doc.owner = userId;
});

Photos.after.findOne(function (userId, selector, options, doc) {
  if (doc)
    doc.type='photo';
});
