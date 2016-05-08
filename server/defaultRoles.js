Accounts.onCreateUser(function(options, user) {
  Roles.addUsersToRoles(user, ['uploadPhoto']);
  user.roles = ['uploadPhoto'];
  return user;
});