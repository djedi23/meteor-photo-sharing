

Meteor.users.allow({
  insert: function(userId, doc) {
    return false;
  },
  update: function(userId, doc, fieldNames, modifier) {
    var flag = true
    if (_.contains(fieldNames, 'invitation')){
      if (modifier['$addToSet'] && modifier['$addToSet'].invitation && modifier['$addToSet'].invitation.user ) {
        // Autorise les invitations si la personne n'est pas d&jà un ami ou si l'invitation n'est pas déjà envoyée
        if (_.contains(_.pluck(doc.invitation, 'user'), modifier['$addToSet'].invitation.user) ||
            _.contains(_.pluck(doc.friends, 'user'), modifier['$addToSet'].invitation.user) ||
            _.contains(_.pluck(doc.invitationSent, 'user'), modifier['$addToSet'].invitation.user))
	  flag = flag && false;
        else
	  flag = flag && true;
      }
      if (modifier['$pull'] && modifier['$pull'].invitation && modifier['$pull'].invitation.user )
        if (_.contains(_.pluck(doc.invitation, 'user'), modifier['$pull'].invitation.user))
	  flag = flag && true;
        else
	  flag = flag && false;
    }

    return flag;
  },
  remove: function(userId, doc) {
    return false;
  }
});


Meteor.users.deny({
  insert: function(userId, doc) {
    return true;
  },
  update: function(userId, doc, fieldNames, modifier) {
    return userId==null; // && userId != doc._id;
  },
  remove: function(userId, doc) {
    return true;
  }
});


Meteor.users.after.findOne(function (userId, selector, options, doc) {
  if (doc)
    doc.type='user';
});
