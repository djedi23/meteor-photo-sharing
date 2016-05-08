Albums.before.update(function (userId, doc, fieldNames,modifier, options) {
//  console.log('albums',fieldNames,modifier);
  if (_.contains(fieldNames, 'name') && modifier.$set){
    if (modifier.$set['name'])
      modifier.$set['name'] = sanitizeHtml(modifier.$set['name'], {allowedTags: ['b', 'i', 'em']});
  }
});
