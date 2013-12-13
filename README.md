# spawns [![NPM version](https://badge.fury.io/js/spawns.png)](http://badge.fury.io/js/spawns) [![Build Status](https://travis-ci.org/kaelzhang/node-spawns.png?branch=master)](https://travis-ci.org/kaelzhang/node-spawns) [![Dependency Status](https://gemnasium.com/kaelzhang/node-spawns.png)](https://gemnasium.com/kaelzhang/node-spawns)

Spawns could run piped commands(what's comming) or a list of commands. 

# Synopsis

```js
spawns(commands, options);
```

```js
spawns(['npm install', 'grunt'], {
	stdio: 'inherit'
	
}).on('close', function(code, signal){
	console.log('close with code:', code );
});
```

# Installation

```sh
npm install spawns --save
```

# Usage

`spawns(commands, options)` returns a `EventEmitter`.

## Arguments

### commands

type `Array.<string>`

Array of command strings. Notice that the command here is not a `"ls ['-al']"` way, but like `"ls -al"`.

### options

type `Object`

`options` is the same argument as `require('child_process').spawn`.

## Events

### Event: 'close'

### Event: 'exit'

### Event: 'child_close'

### Event: 'child_exit'

### Event: 'error'




