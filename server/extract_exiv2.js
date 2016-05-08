Meteor.startup(() => {
  let images = Images.find({
    exiv2: {
      $exists: false
    }
  });
  images.forEach((fileObj) => {
    extractExiv2(fileObj, fileObj.createReadStream('images'));
  });
});