build/demo-mapping/prod.js: demo-mapping/prod.js \
    lib/cloudflare/moduleWorker.d.js lib/cloudflare/types.d.js \
    lib/cloudflare/pageWorker.d.js
	mkdir -p $(dir $@)
	bun google-closure-compiler -W VERBOSE -O ADVANCED --charset UTF-8 \
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
	bun uglifyjs $@ -m -c toplevel,unsafe,drop_console -o $@
	sed -i.bak 's/globalThis.DemoMapping=/export default/g' $@
	wc $@

demo-mapping.cf-deployment: build/demo-mapping/prod.js demo-mapping/prod.toml
	bun wrangler deploy \
        --config demo-mapping/prod.toml \
        --compatibility-date $(shell date -v -1d +%Y-%m-%d)

.PHONY: demo-mapping.cf-deployment
