#!/usr/bin/env node

'use strict';

var argv = require('minimist')(process.argv.slice(2));

console.log('arg:' + argv.arg);

process.exit(1);