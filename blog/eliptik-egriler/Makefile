build/blog/eliptik-egriler/banner.webp: blog/eliptik-egriler/banner.webp
	mkdir -p $(dir $@)
	cp $^ $@

build/blog/eliptik-egriler/banner.keymap: $(call compressions, build/blog/eliptik-egriler/banner.webp)
	mkdir -p $(dir $@) && > $@
	node lib/birimler/hasher $@ $<
