MAKEFLAGS := -j 8

include tools/Makefile
include birim/Makefile
include bulten/Makefile
include join/Makefile
include blog/Makefile

.PHONY: dapp.dev
dapp.dev: dapp
	make -C $< dev

clean:
	rm -rf build

.PHONY: clean
