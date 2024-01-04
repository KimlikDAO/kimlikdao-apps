2023.12-en := "2023-12"
2023.12-tr := "2023.12"

build/blog/2023.12/sayfa-%.js: blog/2023.12/sayfa.js \
    birim/ağlar/*.js \
    birim/cüzdan/*.js \
    birim/dil/*.js
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