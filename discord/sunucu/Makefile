PAGES := discord/tckt-onayla

build/discord/sunucu/prod.js: discord/sunucu/prod.js discord/sunucu/prod.d.js \
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
	sed -i.bak 's/globalThis.DiscordWorker=/export default/g' $@
	wc $@

discord.dev:
	node lib/birimler/devSunucu --çalıştır discord/sunucu/dev.toml

discord.kanarya: discord/tckt-onayla.sayfa
	node lib/birimler/kanaryaSunucu --çalıştır discord/sunucu/dev.toml

discord.cf-deployment: build/discord/sunucu/prod.js discord/sunucu/prod.toml
	wrangler deploy \
        --config discord/sunucu/prod.toml \
        --compatibility-date $(shell date -v -1d +%Y-%m-%d)

.PHONY: discord.dev discord.kanarya discord.cf-deployment
