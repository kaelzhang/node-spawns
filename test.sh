#!/bin/bash

chmod +x ./test/fixtures/command.js

./node_modules/.bin/mocha --reporter spec ./test/spawns.js