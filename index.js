'use strict';

var spawn   = require('child_process').spawn;
var EE      = require('events').EventEmitter;
var util    = require('util');

function spawn (commands, options){
    return new Spawn(commands, options);
}

// @param {Array.<string>} commands 
function Spawn (commands, options){
    if ( !util.isArray(commands) ) {
        commands = [commands];
    }

    // [
    //     // single command
    //     [command],

    //     // piped commands
    //     [command, command]
    // ]
    this._commands = this._parse_commands(commands);
    this._options = options;
    var self = this;

    // run in the next tick, 
    // so that forward event buidings could be applied
    process.nextTick(function () {
        self._process(); 
    });
}

util.inherits(Spawn, EE);

// events for all processes
// this.emit('close');
// this.emit('exit');
// this.emit('error');

// // child process events
// this.emit('child_close');
// this.emit('child_exit');

Spawn.prototype._process = function() {
    var self = this;

    async(this._commands.map(function (command) {
        return function(done){
            self._spawn(command, done);
        };
        
    }), function (code, status) {
        var last = status.pop();

        self.emit('close', last[0], last[1]);
    });
};


// spawn a child command
// @param {Object} command {
//      name:
//      args:     
// }
Spawn.prototype._spawn = function(command, done) {
    var child = spawn(command.name, command, this._options);
    var self = this;

    child.on('error', function (err) {
        self.emit('error', err);
    });

    child.on('exit', function (code, signal) {
        self.emit('child_exit', code, signal);
    });

    child.on('close', function (code, signal) {
        self.emit('child_close', code, signal);
        done(code, code, signal);
    });

    return child;
};


// @param {Array.<string>} commands
Spawn.prototype._parse_commands = function(commands) {
    return commands.map(this._parse_piped, this);
};


Spawn.prototype._parse_piped = function (command) {
    return command.split('|')
        .map(function (pipe) {
            return pipe.trim();
        })
        .filter(Boolean)
        .map(this._parse_command, this);
};


// @param {string} command
Spawn.prototype._parse_command = function(command) {
    var slices = command.split(/\s+/).map(function (slice) {
        return slice.trim();
    });

    var name = slices.shift();

    return {
        name : name,
        args : slices
    };
};


