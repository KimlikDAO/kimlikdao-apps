PAGES := blog/dizin

build/blog/sunucu/prod.js: blog/sunucu/prod.js \
    lib/cloudflare/moduleWorker.d.js lib/cloudflare/types.d.js \
    lib/cloudflare/pageWorker.d.js lib/cloudflare/pageWorker.js
	mkdir -p $(dir $@)
	yarn google-closure-compiler -W VERBOSE -O ADVANCED --charset UTF-8 \
                             --jscomp_error=checkTypes \
                             --jscomp_error=strictCheckTypes \
                             --jscomp_error=unusedLocalVariables \
                             --jscomp_error=reportUnknownTypes \
                             --emit_use_strict \
                             --language_in ECMASCRIPT_NEXT \
                             --module_resolution NODE \
                             --assume_function_wrapper \
                             --dependency_mode PRUNE \
                             --entry_point $< \
                             --js $^ \
                             --js_output_file $@
	yarn uglifyjs $@ -m -c toplevel,unsafe,drop_console -o $@
	sed -i.bak 's/globalThis.BlogWorker=/export default/g' $@
	wc $@

blog.dev:
	node lib/birimler/devSunucu --çalıştır blog/sunucu/dev.toml

blog.cf-deployment: build/blog/sunucu/prod.js blog/dizin.sayfa
	node lib/cloudflare/uploader blog/sunucu/prod.toml blog/sunucu/Makefile
	wrangler deploy \
	      --config blog/sunucu/prod.toml \
	      --compatibility-date $(shell date -v -1d +%Y-%m-%d)

.PHONY: blog.dev blog.cf-deployment
