
Photos.before.update(function (userId, doc, fieldNames,modifier, options) {
  if (_.contains(fieldNames, 'title') && modifier.$set && modifier.$set.title)
    modifier.$set.title = sanitizeHtml(modifier.$set.title, {allowedTags: ['b', 'i', 'em', 'br']});
  if (_.contains(fieldNames, 'place') && modifier.$set && modifier.$set.place)
    modifier.$set.place = sanitizeHtml(modifier.$set.place, {allowedTags: ['b', 'i', 'em', 'br']});
  if (_.contains(fieldNames, 'date') && modifier.$set && modifier.$set.date)
    modifier.$set.date = sanitizeHtml(modifier.$set.date, {allowedTags: ['b', 'i', 'em', 'br']});
  if (_.contains(fieldNames, 'description') && modifier.$set && modifier.$set.description)
    modifier.$set.description = sanitizeHtml(modifier.$set.description, {allowedTags: ['b', 'i', 'em', 'br']});
});
