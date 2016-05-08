Meteor.users.before.update(function (userId, doc, fieldNames,modifier, options) {
  //console.log(fieldNames,modifier);
  if (_.contains(fieldNames, 'profile') && modifier.$set){
    if (modifier.$set['profile.name.value'])
      modifier.$set['profile.name.value'] = sanitizeHtml(modifier.$set['profile.name.value'], {allowedTags: ['b', 'i', 'em']});
    if (modifier.$set['profile.email.value'])
      modifier.$set['profile.email.value'] = sanitizeHtml(modifier.$set['profile.email.value'], {allowedTags: []});
  }
});
