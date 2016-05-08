
Package.describe({
  name: "exiv2",
  summary: "",
  version: "0.6.2",
  git: ""
});

Npm.depends({
  "exiv2":"0.6.2"
});

Package.on_use(function (api) {
  api.export('exiv2');
  api.add_files('exiv2.js', 'server');
});