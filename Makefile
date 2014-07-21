REPORTER = spec

test:
		chmod +x ./test/fixtures/command.js
		@./node_modules/.bin/mocha \
			--reporter $(REPORTER) \
			./test/spawns.js

.PHONY: test