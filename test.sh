#!/bin/bash

chmod +x ./test/fixtures/command

./node_modules/.bin/mocha \
  --reporter spec \
  ./test/spawns.js