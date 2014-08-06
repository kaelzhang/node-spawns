#!/usr/bin/env node

'use strict';

var fs = require('fs');
var node_path = require('path');

var file = node_path.join(process.env._CWD, 'arg.tmp');
fs.writeFileSync(file, process.argv[3]);

process.exit(1);