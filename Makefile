MAKEFLAGS := -j 8

include tools/Makefile
include birim/Makefile
include bulten/Makefile
include join/Makefile

clean:
	rm -rf build

.PHONY: clean
