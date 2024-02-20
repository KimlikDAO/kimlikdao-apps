MAKEFLAGS := -j 8

include lib/birimler/Makefile
include birim/Makefile
include bot/Makefile
include bulten/Makefile
include demo-mapping/Makefile
include discord/Makefile
include join/Makefile
include blog/Makefile

.PHONY: dapp.dev
dapp.dev: dapp
	make -C $< dev

clean:
	rm -rf build

.PHONY: clean
