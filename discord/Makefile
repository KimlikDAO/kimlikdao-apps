build/discord/prod.js: discord/prod.js discord/prod.d.js \
    dapp/tcktm/discord.d.js dapp/tcktm/discord.js \
    lib/api/*.d.js lib/api/jsonrpc.js \
    lib/cloudflare/moduleWorker.d.js lib/cloudflare/types.d.js \
    lib/cloudflare/pageWorker.d.js lib/cloudflare/pageWorker.js \
    lib/crosschain/*.js \
    lib/crypto/sha3.js \
    lib/crypto/modular.js lib/crypto/secp256k1.js \
    lib/ethereum/*.d.js lib/ethereum/evm.js \
    lib/util/çevir.js \
    sdk/server-js/TCKT.js
	mkdir -p $(dir $@)
	yarn google-closure-compiler -W VERBOSE -O ADVANCED --charset UTF-8 \
                             --jscomp_error=checkTypes \
                             --jscomp_error=unusedLocalVariables \
                             --emit_use_strict \
                             --language_in ECMASCRIPT_NEXT \
                             --module_resolution NODE \
                             --assume_function_wrapper \
                             --dependency_mode PRUNE \
                             --entry_point $< \
                             --js $^ \
                             --js_output_file $@
	yarn uglifyjs $@ -m -c toplevel,unsafe -o $@
	sed -i.bak 's/globalThis.DiscordWorker=/export default/g' $@
	wc $@

discord.cf-deployment: build/discord/prod.js discord/prod.toml
	wrangler deploy \
        --config discord/prod.toml \
        --compatibility-date $(shell date -v -1d +%Y-%m-%d)

.PHONY: discord.cf-deployment
