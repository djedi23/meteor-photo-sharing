

modules.push('template.editphoto.toolbar.action', 20, 'camanToolbarAction');
modules.push('template.editphoto.panel', 20, 'camanSettingsPanel');

var applyEffect = function(domid, effects){
  Caman(domid, function () {
    this.revert(false);
    if (effects.vignette)
      this.vignette((effects.vignette.size||0)+"%", effects.vignette.strenght||0);
    if (effects.brightness)
      this.brightness(effects.brightness);
    if (effects.clip)
      this.clip(effects.clip);
    this.render();
  });
};

var handleEffectSettings = function (effect) {
  return function(evt){
    var update = {$set: {}};
    update.$set[effect] = $(evt.target).val().trim();
    Photos.update({_id:this._id}, update);
    var photo = Photos.findOne({_id:this._id});
    applyEffect('#mainPhoto', photo.effects || {});
  };
};

Template.camanToolbarAction.events({
  'click #toggleEditMode': function(){
    if (Session.equals("editMode", 1))
      Session.set('editMode', undefined);
    else
      Session.set('editMode', 1);
  }
});
Template.camanSettingsPanel.events({
  'change #brightness': handleEffectSettings('effects.brightness'),
  'change #vsize': handleEffectSettings('effects.vignette.size'),
  'change #vstrenght': handleEffectSettings('effects.vignette.strenght'),
  'change #clip': handleEffectSettings('effects.clip')
});

Template.camanSettingsPanel.helpers({
  editMode: function() {
    return Session.equals('editMode', 1);
  },
  "default": function(val, defaut) {
    return val || defaut;
  }
});

if (modules['template.editphoto.rendered'] === undefined)
  modules['template.editphoto.rendered'] = [];
modules['template.editphoto.rendered'].push(function(){
  if (this.data){
    var effects = this.data.effects || {};
    applyEffect('#mainPhoto', effects);
  }
});

