
tags:
	ctags -RVe --exclude=packages *

wc:
	find . -name '*.js' -o -name '*.html' | grep -v .meteor | grep -v package | xargs  wc


attributes:
	git config filter.dtcversion.smudge ./private/.version_smudge.sh
	git config filter.dtcversion.clean ./private/.version_clean.sh

prepare_version: attributes
	rm -f private/version.json
	git reset --hard

build:
	meteor build /tmp/albums

docker:
	rsync -Pva /tmp/albums/*.tar.gz app.tar.gz
	docker build -t albums:latest .

deploy-dev: build docker
	docker tag -f albums:latest albums:`date +%y%m%d`-dev

deploy: build docker
	docker tag -f albums:latest albums:`date +%y%m%d`


deploy_:
	docker tag albums:`date +%y%m%d` valvassori.info:5000/albums:`date +%y%m%d`
	docker tag albums:`date +%y%m%d` valvassori.info:5000/albums:latest
	docker push valvassori.info:5000/albums:`date +%y%m%d`
	docker push valvassori.info:5000/albums:latest



clean:
	find . -name '*~' | xargs rm -vf

clean-hard: clean
	rm -rf  .meteor/local/build
	find packages -name .build | xargs rm -rf

CASPERLOG=/tmp/casper.log

cleanscreenshots:
	rm -rf /tmp/screenshots
	> $(CASPERLOG)


# tests/names.js,tests/pusers.js,tests/pannonces.js,
%.test:tests/%.test.js patchUnderscore patchAppcache # extract_users
	casperjs $(VERBOSETEST) --includes=tests/config.casper.js,tests/utils.casper.js,tests/mongo.casper.js test $< | tee -a $(CASPERLOG)

tests: tests01 tests02
#	casperjs test --includes=tests/config.js,tests/utils.js tests/test_recherche.js
	grep FAIL $(CASPERLOG) ; true
	! grep -q FAIL $(CASPERLOG)

tests01: cleanscreenshots test_acl_homepage test_acl_public test_acl_homepage_album test_acl_homepage_album_overrided test_acl_homepage_user test_acl_homepage_user_overrided_by_photo test_album_create
#	casperjs test --includes=tests/config.js,tests/utils.js tests/test_recherche.js
	grep FAIL $(CASPERLOG) ; true
	! grep -q FAIL $(CASPERLOG)

tests02: cleanscreenshots test_acl_homepage_user_overrided_by_album test_friends_photo test_acl_share_friend_photo test_acl_share_friend_album test_acl_share_friend_user test_search test_previous_next
#	casperjs test --includes=tests/config.js,tests/utils.js tests/test_recherche.js
	grep FAIL $(CASPERLOG) ; true
	! grep -q FAIL $(CASPERLOG)

test_acl_homepage:
	$(MAKE) dumpSimple acl.homepage.test
test_acl_public:
	$(MAKE) dumpSimple acl.public.test
test_acl_homepage_album:
	$(MAKE) dumpSimple acl.homepage.album.test
test_acl_homepage_album_overrided:
	$(MAKE) dumpSimple acl.homepage.album.overrived.test
test_acl_homepage_user:
	$(MAKE) dumpSimple acl.homepage.user.test
test_acl_homepage_user_overrided_by_photo:
	$(MAKE) dumpSimple acl.homepage.user.overrided.by.photo.test
test_acl_homepage_user_overrided_by_album:
	$(MAKE) dumpSimple acl.homepage.user.overrided.by.album.test
test_friends_photo:
	$(MAKE) dumpSimple friends.test
test_acl_share_friend_photo:
	$(MAKE) dumpOneFriend acl.share.friend.photo.test
test_acl_share_friend_album:
	$(MAKE) dumpOneFriend acl.share.friend.album.test
test_acl_share_friend_user:
	$(MAKE) dumpOneFriend acl.share.friend.user.test
test_search:
	$(MAKE) dumpOneFriendAndShares search.test
test_album_create:
	$(MAKE) dumpSimple album.create.test
test_previous_next:
	$(MAKE) dumpOneFriendAndShares previous_next.test
test_myprofile:
	$(MAKE) dumpOneFriendAndShares myprofile.test


dumpSimple:
	make mongoRestore dump=simple
dumpOneFriend:
	make mongoRestore dump=oneFriend
dumpOneFriendAndShares:
	make mongoRestore dump=oneFriendAndShares


DUMPDIR=dumps
mongoDump:
ifdef out
	mongodump --host localhost:3001 --out $(DUMPDIR)/$(out)
else
	@echo make $@ out=...
endif

mongoRestore:
ifdef dump
	@mongorestore --host localhost:3001 --drop $(DUMPDIR)/$(dump) > /tmp/mongorestore
else
	@echo make $@ dump=...
	@echo Dumps disponibles:
	@ls $(DUMPDIR)/
endif


patchUnderscore:
	chmod +w .meteor/local/build/programs/server/packages/underscore.js
	grep -q Function.prototype.bind .meteor/local/build/programs/server/packages/underscore.js || cat tests/patchUnderscore >> .meteor/local/build/programs/server/packages/underscore.js
	chmod +w .meteor/local/build/programs/web.browser/packages/underscore.js
	grep -q Function.prototype.bind .meteor/local/build/programs/web.browser/packages/underscore.js || cat tests/patchUnderscore >> .meteor/local/build/programs/web.browser/packages/underscore.js

patchAppcache:
	rm -fv server/appcache.js
	sed -e '/appcache/d' .meteor/packages > /tmp/packages && mv /tmp/packages .meteor/packages
