#!/usr/bin/env node

'use strict';

var fs = require('fs');
var node_path = require('path');

var argv = require('minimist')(process.argv.slice(2));

var file = node_path.join(__dirname, '..', 'arg.tmp');
fs.writeFileSync(file, argv.arg);

process.exit(1);