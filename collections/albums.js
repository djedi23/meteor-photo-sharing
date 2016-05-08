Albums = new Mongo.Collection('albums');

Albums.allow({
  insert: function(userId, doc) {
    return userId !== null;
  },
  update: function(userId, doc, fieldNames, modifier) {
    if (userId!==null && userId == doc.owner){
      //console.log(modifier);
      if (modifier.$addToSet && modifier.$addToSet.photos)
        return true;
      if (modifier.$addToSet && modifier.$addToSet['share.friends'])
        return true;
      if (modifier.$pull && modifier.$pull['share.friends'])
        return true;
      if (modifier.$set && modifier.$set.name)
        return true;
      if (modifier.$set)
        if (modifier.$set['share.allowModification']!==undefined ||
            modifier.$set['share.inHomepage']!==undefined ||
            modifier.$set['share.isPublic']!==undefined)
          return true;     
      if (modifier.$unset)
	if (modifier.$unset['share.allowModification']===true ||
            modifier.$unset['share.inHomepage']===true ||
            modifier.$unset['share.isPublic']===true ||
	    modifier.$unset['share.friends']===true)
          return true;     
    }
    return false;
  },
  remove: function(userId, doc) {
    return userId!==null && userId == doc.owner;
  }
});


Albums.deny({
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


Albums.before.insert(function (userId, doc) {
  doc.createdAt = Date.now();
  doc.owner = userId;
});

Albums.after.findOne(function (userId, selector, options, doc) {
  if (doc)
    doc.type='album';
});
