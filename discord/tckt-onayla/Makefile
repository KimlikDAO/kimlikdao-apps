discord/tckt-onayla-en := "tckt-onayla"
discrod/tckt-onayla-tr := "verify-tckt"

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
                             --define "KonumTR\$$\$$module\$$birim\$$dil\$$birim=$(discord/tckt-onayla-tr)" \
                             --define "KonumEN\$$\$$module\$$birim\$$dil\$$birim=$(discord/tckt-onayla-en)" \
                             --emit_use_strict \
                             --module_resolution NODE \
                             --assume_function_wrapper \
                             --dependency_mode PRUNE \
                             --entry_point $< \
                             --js $^ \
                             --js_output_file $@
	yarn uglifyjs $@ -m -c toplevel,unsafe -o $@
	wc $@