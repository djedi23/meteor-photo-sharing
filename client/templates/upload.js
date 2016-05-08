var upload = function(event, template) {
  var self = this;

  console.log(self);
  FS.Utility.eachFile(event, function(file) {
    Images.insert(file, function (err, fileObj) {
      if (self.type==='album' || self.album){
	console.log("===",self,self._id || self.album._id);
        var photoId = Photos.insert({image: fileObj._id, albums: [self._id || self.album._id]});
        Albums.update({_id:self._id || self.album._id}, {$addToSet: {photos: photoId}});
      } else
        Photos.insert({image: fileObj._id});
    });
  });
};


Template.upload.events({
  'click .dropzone': function(e, tpl){
    e.stopPropagation();
    $('.uploadImages').click();
  },
  'change .uploadImages': upload,
  'dropped #dropzone': upload
});
