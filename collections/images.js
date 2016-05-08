var convertArrayOfDottedSlots = function (tags) {
  var obj = {};
  _.forEach(_.pairs(tags), function (tag) {
    convertDottedSlot(obj, tag[0], tag[1]);
  });
  return obj;
};

var convertDottedSlot = function (obj, tag, value) {
  var slots = tag.split('.');
  for (var i = 0; i < slots.length - 1; i++) {
    if (_.isUndefined(obj[slots[i]]))
      obj[slots[i]] = {};
    obj = obj[slots[i]];
  }
  obj[slots[slots.length - 1]] = value;
};



extractExiv2 = function (fileObj, readStream) {
  var fs = Npm.require('fs');
  var tempFileName = '/tmp/' + fileObj.name();
  var tempStream = fs.createWriteStream(tempFileName);
  readStream.pipe(tempStream);
  tempStream.on('finish', Meteor.bindEnvironment(function (err, data) {
    if (err)
      console.error(err);
    else {
      exiv2.getImageTags(tempFileName, Meteor.bindEnvironment(function (err, tags) {
        fs.unlink(tempFileName, function () {
          if (err) console.error(err);
        });
        if (err) {
          console.error(err);
          return;
        }
        if (tags) {
          var otags = convertArrayOfDottedSlots(tags);
          fileObj.update({
            $set: {
              exiv2: otags
            }
          });
        }
      }));
    }
  }));
};


var imageStore = new FS.Store.GridFS("images");
var imageThumbStore = new FS.Store.GridFS("imagesThumbs", {
  transformWrite: function (fileObj, readStream, writeStream) {
    fileObj.name(FS.Utility.setFileExtension(fileObj.name(), 'jpg'));
    fileObj.type('image/jpeg');
    gm(readStream, fileObj.name()).resize('512', '>').interlace('Line').quality(50).stream('JPEG').pipe(writeStream);

    gm(readStream, fileObj.name()).identify(
      Meteor.bindEnvironment(function (err, identity) {
        if (err) return err;
        fileObj.update({
          $set: {
            metadata: identity
          }
        });
      }));
    extractExiv2(fileObj, readStream);
  }
});
var imageScreenStore = new FS.Store.GridFS("imagesScreen", {
  transformWrite: function (fileObj, readStream, writeStream) {
    fileObj.name(FS.Utility.setFileExtension(fileObj.name(), 'jpg'));
    fileObj.type('image/jpeg');
    gm(readStream, fileObj.name()).resize('1500', '1500', '>').interlace('Line').quality(95).stream('JPEG').pipe(writeStream);
  }
});
var imageIconStore = new FS.Store.GridFS("icon", {
  transformWrite: function (fileObj, readStream, writeStream) {
    fileObj.name(FS.Utility.setFileExtension(fileObj.name(), 'jpg'));
    fileObj.type('image/jpeg');
    gm(readStream, fileObj.name()).resize('64', '64', '>').interlace('Line').quality(30).stream('JPEG').pipe(writeStream);
  }
});



Images = new FS.Collection("images", {
  stores: [imageThumbStore, imageIconStore, imageScreenStore, imageStore],
  filter: {
    allow: {
      contentTypes: ['image/*'] //allow only images in this FS.Collection
    }
  }
});


Images.allow({
  insert: function (userId, doc) {
    return userId !== null;
  },
  update: function (userId, doc, fieldNames, modifier) {
    return userId !== null;
  },
  remove: function (userId, doc) {
    return userId !== null;
  },
  download: function (userId, fileObj) {
    return true;
  }
});
Images.deny({
  insert: function (userId, doc) {
    return userId == null;
  },
  update: function (userId, doc, fieldNames, modifier) {
    return userId == null;
  },
  remove: function (userId, doc) {
    return userId == null;
  },
  download: function (userId, fileObj) {
    return false;
  }
});
