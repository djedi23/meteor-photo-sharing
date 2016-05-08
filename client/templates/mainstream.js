Template.mainstream.helpers({
  photos: function () {
    return {
      photos: this
    };
  },
  nophotos: function () {
    return this.count() === 0;
  }
});

Template.mainstream.rendered = function () {
  Session.set('mainstream_limit', 10);

  this.autorun(function () {
    Meteor.subscribe('allMyPhotos', Session.get('mainstream_limit'))
  });
};