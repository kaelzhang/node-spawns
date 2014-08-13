'use strict';

var spawn = require('child_process').spawn;
var win_spawn = require('win-spawn');
var EE = require('events').EventEmitter;
var util = require('util');
var async = require('async');
var node_path = require('path');
var mix = require('mix2');
var split = require('argv-split');

module.exports = spawns;

function spawns(command, args, options) {
  var commands;
  if (arguments.length === 3) {
    command = spawns._parse_command(command);
    command.args = command.args.concat(args || []);
    command.origin = command.name + ' ' + split.join(command.args);
    commands = [command];

  } else {
    commands = util.isArray(command)
      ? command
      : [command];
    options = args;

    commands = commands.map(spawns._parse_command);
  }

  return new Spawns(commands, options || {});
}
spawns.Spawns = Spawns;

// @param {Array.<string>} commands 
function Spawns(commands, options) {
  this._commands = commands;
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
  var data;
  async.eachSeries(this._commands, function (command, done) {
    self._spawn(command, function (err, d) {
      data = d;
      done(err);
    });

  }, function (err) {
    if (err && err instanceof Error) {
      return;
    }

    this.emit('exit', data.code, data.signal);
    this.emit('close', data.code, data.signal);
  }.bind(this));
};


// spawns a child command
// @param {Object} command {
//      name:
//      args:     
// }
Spawns.prototype._spawn = function(command, callback) {
  var child = this._get_spawn(command);
  var self = this;

  var called = false;
  function cb (err, data) {
    if (called) {
      return;
    }
    called = true;
    callback(err, data);
  }

  child.on('error', function(err) {
    self.emit('error', err);
    cb(err);
  });

  child.on('exit', function(code, signal) {
    self.emit('child_exit', code, signal);
  });

  child.on('close', function(code, signal) {
    self.emit('child_close', code, signal);
    cb(code, {
      code: code,
      signal: signal
    });
  });

  return child;
};


var is_windows = process.platform === 'win32';

Spawns.prototype._get_spawn = function(parsed) {
  if (!is_windows) {
    return spawn('sh', ['-c', parsed.origin], this._options);
  }

  var options = mix({
    windowsVerbatimArguments: true
  }, this._options);

  return win_spawn(parsed.name, parsed.args, options);
};


spawns._parse_command = function(command) {
  // #4,
  // We should reserve quoted spaces, so never use `/\s+/`
  var slices = command.split(/\s/).map(function(slice) {
    return slice.trim();
  });

  var name = slices.shift();

  return {
    name: name,
    args: split.balance(slices),
    origin: command
  };
};
