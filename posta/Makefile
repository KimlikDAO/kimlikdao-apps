posta-en := "?en"
posta-tr := "?tr"

build/posta/sayfa-%.js: posta/sayfa.js \
    birim/ağlar/*.js \
    birim/cüzdan/*.js \
    birim/dil/birim.js \
    birim/kaydol/birim.js \
    birim/tckt/birim.js \
    lib/crosschain/*.js \
    lib/crypto/*.js \
    lib/did/*.js \
    lib/ethereum/*.js \
    lib/mina/*.js \
    lib/node/*.js \
    lib/util/dom.js lib/util/çevir.js \
    sdk/api/*.js \
    sdk/client/index.js
	mkdir -p $(dir $@)
	bun google-closure-compiler -W VERBOSE -O ADVANCED --charset UTF-8 \
                            --define "TR\$$\$$module\$$lib\$$util\$$dom=$(Lang-$*)" \
                            --define "KonumTR\$$\$$module\$$birim\$$dil\$$birim=$(posta-tr)" \
                            --define "KonumEN\$$\$$module\$$birim\$$dil\$$birim=$(posta-en)" \
                            --emit_use_strict \
                            --module_resolution NODE \
                            --assume_function_wrapper \
                            --dependency_mode PRUNE \
                            --entry_point $< \
                            --js $^ \
                            --js_output_file $@
	bun uglifyjs $@ -m -c toplevel,unsafe -o $@
	wc $@
