var install_wrappers  = function() {
  var wrappedFind = Meteor.Collection.prototype.find;
  var wrappedUpdate = Meteor.Collection.prototype.update;
  var wrappedInsert = Meteor.Collection.prototype.insert;
  var wrappedRemove = Meteor.Collection.prototype.remove;
  
  console.log('[startup] wrapping Collection.find');
  
  Meteor.Collection.prototype.find = function () {
    console.log(this._name + '.find', JSON.stringify(arguments));
    return wrappedFind.apply(this, arguments);
  };
  Meteor.Collection.prototype.update = function () {
    console.log(this._name + '.update', JSON.stringify(arguments));
    return wrappedUpdate.apply(this, arguments);
  };
  Meteor.Collection.prototype.insert = function () {
    console.log(this._name + '.insert', JSON.stringify(arguments));
    return wrappedInsert.apply(this, arguments);
  };
  Meteor.Collection.prototype.remove = function () {
    console.log(this._name + '.remove', JSON.stringify(arguments));
    return wrappedRemove.apply(this, arguments);
  };
};

//install_wrappers();
