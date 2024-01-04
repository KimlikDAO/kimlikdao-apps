dizin-en := "?en"
dizin-tr := "?tr"

build/blog/dizin/sayfa-%.js: blog/dizin/sayfa.js \
    birim/ağlar/*.js \
    birim/blog/*/*.js \
    birim/cüzdan/*.js \
    birim/dil/birim.js \
    lib/api/jsonrpc.d.js lib/api/jsonrpc.js \
    lib/crosschain/unlockable.d.js \
    lib/crosschain/provider.js lib/crosschain/signer.js \
    lib/did/*.d.js \
    lib/ethereum/*.d.js lib/ethereum/TCKTLite.js \
    lib/node/*.d.js lib/node/ipfs.js \
    lib/util/dom.js lib/util/çevir.js
	mkdir -p $(dir $@)
	yarn google-closure-compiler -W VERBOSE -O ADVANCED --charset UTF-8 \
                             --define "TR\$$\$$module\$$lib\$$util\$$dom=$(Lang-$*)" \
                             --define "KonumTR\$$\$$module\$$birim\$$dil\$$birim=$(dizin-tr)" \
                             --define "KonumEN\$$\$$module\$$birim\$$dil\$$birim=$(dizin-en)" \
                             --emit_use_strict \
                             --module_resolution NODE \
                             --assume_function_wrapper \
                             --dependency_mode PRUNE \
                             --entry_point $< \
                             --js $^ \
                             --js_output_file $@
	yarn uglifyjs $@ -m -c toplevel,unsafe -o $@
	wc $@

build/blog/dizin/sayfa-%.css: blog/dizin/sayfa.css \
    birim/lato/l400.css \
    birim/lato/l700.css \
    build/join/l400.keymap \
    build/join/l700-%.keymap \
    blog/ortak.css \
    birim/blog/birim.css \
    birim/blog/eliptik-egriler/birim.css \
    birim/blog/eliptik-imza/birim.css \
    birim/ortak.css \
    birim/başlık/birim.css \
    birim/cüzdan/birim.css \
    birim/dil/birim.css
	mkdir -p $(dir $@)
	cat $(filter %.css,$^) | yarn csso --output $@
	lib/birimler/keymapper.py $@ $(filter %.keymap,$^)

build/blog/dizin/sayfa-%.keymap: \
    $(call compressions, build/blog/dizin/sayfa-%.js) \
    $(call compressions, build/blog/dizin/sayfa-%.css)
	mkdir -p $(dir $@) && > $@
	node lib/birimler/hasher $@ build/blog/dizin/sayfa-$*.js build/blog/dizin/sayfa-$*.css

build/blog/dizin-%.html: blog/dizin/sayfa.html \
    build/blog/dizin/sayfa-%.keymap \
    birim/başlık.birim \
    birim/blog/2023.12.birim \
    birim/blog/2024.01.birim \
    birim/blog/eliptik-imza.birim \
    birim/blog/eliptik-egriler.birim \
    birim/favicon.birim \
    birim/lato-%.birim
	node lib/birimler/işleyici $< $*

blog/dizin.sayfa: $(call compressions,build/blog/dizin-en.html build/blog/dizin-tr.html)
