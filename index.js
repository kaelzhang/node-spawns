'use strict';

var spawn = require('child_process').spawn;
var win_spawn = require('win-spawn');
var EE = require('events').EventEmitter;
var util = require('util');
var async = require('async');
var node_path = require('path');
var mix = require('mix2');

module.exports = spawns;

function spawns(commands, options) {
  return new Spawns(commands, options || {});
}
spawns.Spawns = Spawns;

// @param {Array.<string>} commands 
function Spawns(commands, options) {
  if (!util.isArray(commands)) {
    commands = [commands];
  }

  // [
  //     // single command
  //     [command],

  //     // piped commands
  //     [command, command]
  // ]
  this._commands = commands || [];
  this._options = options;
  var self = this;

  // run in the next tick, 
  // so that forward event buidings could be applied
  process.nextTick(function() {
    self._process();
  });
}

util.inherits(Spawns, EE);

// events for all processes
// this.emit('close');
// this.emit('exit');
// this.emit('error');

// // child process events
// this.emit('child_close');
// this.emit('child_exit');

Spawns.prototype._process = function() {
  var self = this;
  async.series(this._commands.map(function(command) {
    return function(done) {
      self._spawn(command, done);
    };
  }), function(code, status) {
    var last = status.pop();
    self.emit('close', last[0], last[1]);
  });
};


// spawns a child command
// @param {Object} command {
//      name:
//      args:     
// }
Spawns.prototype._spawn = function(command, done) {
  var child = this._get_spawn(command);
  var self = this;

  child.on('error', function(err) {
    self.emit('error', err);
  });

  child.on('exit', function(code, signal) {
    self.emit('child_exit', code, signal);
  });

  child.on('close', function(code, signal) {
    self.emit('child_close', code, signal);
    done(code, code, signal);
  });

  return child;
};


var is_windows = process.platform === 'win32';

Spawns.prototype._get_spawn = function(command) {
  if (!is_windows) {
    return spawn('sh', ['-c', command], this._options);
  }

  var options = mix({
    windowsVerbatimArguments: true
  }, this._options);

  var parsed = this._parse_command(command);
  return win_spawn(parsed.name, parsed.args, options);
};


Spawns.prototype._parse_command = function(command) {
  // #4,
  // We should reserve quoted spaces, so never use `/\s+/`
  var slices = command.split(/\s/).map(function(slice) {
    return slice.trim();
  });

  var name = slices.shift();

  return {
    name: name,
    args: this._balance_args(slices),
    origin: command
  };
};


var DOUBLE_QUOTE_START = /^".*[^"]$/;
var DOUBLE_QUOTE_END = /"$/;
var SINGLE_QUOTE_START = /^'.*[^']$/;
var SINGLE_QUOTE_END = /'$/;

// empty argument is allowed
// git commit -a -m "" -> empty value is allow by bash, but git commit will fail
var QUOTE_PAIR = /^(['"])(.*)\1$/;
function trim (str) {
  var match = str.match(QUOTE_PAIR);
  return match
    ? match[2]
    : str;
}

// #4,
// Deal with quotes
Spawns.prototype._balance_args = function(slices) {
  var double_quoted;
  var single_quoted;
  var stack = [];
  var max = slices.length - 1;
  return slices.reduce(function(prev, current, index) {
    if (double_quoted) {
      stack.push(current);
      if (DOUBLE_QUOTE_END.test(current)) {
        double_quoted = false;

        prev.push( trim(stack.join(' ')) );
        stack.length = 0;

      // -a "a b
      // -> ['-a', '"a', 'b']
      // balance quotes teminated
      } else if (index === max) {
        prev = prev.concat(stack);
        stack.length = 0;
      }

    } else if (single_quoted) {
      stack.push(current);
      if (SINGLE_QUOTE_END.test(current)) {
        single_quoted = false;

        prev.push( trim(stack.join(' ')) );
        stack.length = 0;

      } else if (index === max) {
        prev = prev.concat(stack);
        stack.length = 0;
      }

    // if not quoted, and current is empty, just skip
    } else if (current) {
      if (DOUBLE_QUOTE_START.test(current)) {
        stack.push(current);
        double_quoted = true;

      } else if (SINGLE_QUOTE_START.test(current)) {
        stack.push( current );
        single_quoted = true;

      } else {
        prev.push( trim(current) );
      }
    }

    return prev;
  }, []);
};
