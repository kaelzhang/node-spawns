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

### Event: 'spawn'

- command `String` the command string

This event is emitted when a command is about to spawned.

### Event: 'close'

- code `Number` the exit code, if it exited normally.
- signal `String` the signal passed to kill the child process, if it was killed by the parent.

This event is emitted when the stdio streams of **all child processes** have all terminated, or if there are any error encountered. This is distinct from 'exit', since multiple processes might share the same stdio streams.

### Event: 'exit'

### Event: 'child_close'

### Event: 'child_exit'

### Event: 'error'

- err `Error Object` the error.

Emitted when:

1. The process could not be spawned, or
2. The process could not be killed, or
3. Sending a message to the child process failed for whatever reason.

Note that the exit-event may or may not fire after an error has occured. If you are listening on both events to fire a function, remember to guard against calling your function twice.


