include blog/sunucu/Makefile
include blog/dizin/Makefile
include blog/eliptik-egriler/Makefile
include blog/eliptik-imza/Makefile

blog.dev:
	node blog/sunucu/dev.js

blog.cf-deployment: build/blog/sunucu/prod.js blog/dizin.sayfa
	node lib/cloudflare/uploader blog/sunucu/prod.toml blog/sunucu/Makefile
	wrangler deploy \
	      --config blog/sunucu/prod.toml \
	      --compatibility-date $(shell date -v -1d +%Y-%m-%d)

.PHONY: blog.dev blog.cf-deployment
