join-en := "?en"
join-tr := "?tr"

build/join/sayfa-%.js: join/sayfa.js \
    birim/cüzdan/*.js \
    birim/dil/birim.js \
    birim/tckt/birim.js \
    lib/crosschain/*.js \
    lib/crypto/*.js \
    lib/did/*.js \
    lib/ethereum/*.js \
    lib/node/*.js \
    lib/util/dom.js lib/util/çevir.js \
    sdk/api/*.js \
    sdk/client/index.js
	mkdir -p $(dir $@)
	yarn google-closure-compiler -W VERBOSE -O ADVANCED --charset UTF-8 \
                             --define "TR\$$\$$module\$$lib\$$util\$$dom=$(Lang-$*)" \
                             --define "KonumTR\$$\$$module\$$birim\$$dil\$$birim=$(join-tr)" \
                             --define "KonumEN\$$\$$module\$$birim\$$dil\$$birim=$(join-en)" \
                             --emit_use_strict \
                             --module_resolution NODE \
                             --assume_function_wrapper \
                             --dependency_mode PRUNE \
                             --entry_point $< \
                             --js $^ \
                             --js_output_file $@
	yarn uglifyjs $@ -m -c toplevel,unsafe -o $@
	wc $@

build/join/l400.keymap: build/birim/lato/birim.keymap
	mkdir -p $(dir $@)
	sed 's# -> # -> //kimlikdao.org/#g' $< > $@

build/join/l700-%.keymap: build/birim/lato/birim-%.keymap
	mkdir -p $(dir $@)
	sed 's# -> # -> //kimlikdao.org/#g' $< > $@

build/join/sayfa-%.css: birim/lato/l400.css \
    birim/lato/l700.css \
    build/join/l400.keymap \
    build/join/l700-%.keymap \
    join/sayfa.css \
    birim/ortak.css \
    birim/başlık/birim.css \
    birim/cüzdan/birim.css \
    birim/dil/birim.css \
    birim/tckt/birim.css
	mkdir -p $(dir $@)
	cat $(filter %.css,$^) | yarn csso --output $@
	lib/birimler/keymapper.py $@ $(filter %.keymap,$^)

build/join/sayfa-%.keymap: build/join/l700-%.keymap \
    build/join/l400.keymap \
    $(call compressions, build/join/sayfa-%.js build/join/sayfa-%.css)
	mkdir -p $(dir $@) && > $@
	node lib/birimler/hasher $@ build/join/sayfa-$*.js build/join/sayfa-$*.css
	cat $< build/join/l400.keymap >> $@

build/join-%.html: join/sayfa.html \
    build/join/sayfa-%.keymap \
    birim/başlık.birim \
    birim/favicon.birim \
    birim/lato-%.birim \
    birim/tckt.birim
	mkdir -p $(dir $@)
	node lib/birimler/işleyici $< $*
	yarn html-minifier -c lib/birimler/htmlMinifierConfig.json $@ -o $@

.PHONY: build/join.sayfa
build/join.sayfa: $(call compressions,build/join-en.html build/join-tr.html)

build/join/prod.js: join/prod.js join/prod.d.js \
    join/başvuru.d.js join/başvuru.js \
    lib/api/jsonrpc.d.js lib/api/jsonrpc.js \
    lib/cloudflare/types.d.js \
    lib/cloudflare/moduleWorker.d.js \
    lib/cloudflare/pageWorker.d.js lib/cloudflare/pageWorker.js \
    lib/crosschain/*.js \
    lib/crypto/modular.js lib/crypto/secp256k1.js lib/crypto/sha3.js \
    lib/did/*.d.js lib/did/section.js \
    lib/ethereum/*.d.js lib/ethereum/evm.js \
    lib/node/nvi.d.js \
    lib/util/çevir.js \
    sdk/api/*.js \
    sdk/server-js/TCKT.js sdk/server-js/TCKTSigners.js sdk/server-js/validator.js
	yarn google-closure-compiler -W VERBOSE -O ADVANCED --charset UTF-8 \
                             --jscomp_error=checkTypes \
                             --jscomp_error=strictCheckTypes \
                             --emit_use_strict \
                             --module_resolution NODE \
                             --assume_function_wrapper \
                             --dependency_mode PRUNE \
                             --entry_point $< \
                             --js $^ \
                             --js_output_file $@
	yarn uglifyjs $@ -m -c unsafe -o $@
	sed -i.bak 's/globalThis.JoinWorker=/export default/g' $@
	wc $@

.PHONY: join.cf-deployment
join.cf-deployment: build/join.sayfa build/join/prod.js
	node lib/cloudflare/uploader join/prod.toml join/uploader.config
	wrangler deploy \
        --config join/prod.toml \
        --compatibility-date $(shell date -v -1d +%Y-%m-%d)

.PHONY: join.cf-trim
join.cf-trim: join.cf-deployment
	node lib/cloudflare/cftrimmer.py join/prod.toml join/uploader.config

.PHONY: join.dev
join.dev:
	node join/dev.js
