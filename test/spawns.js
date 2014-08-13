'use strict';

var expect = require('chai').expect;
var spawns = require('../');
var node_path = require('path');
var fs = require('fs');
var mix = require('mix2');


describe("spawns", function() {
  it("normal", function(done) {
    spawns(['ls', 'ls'], {
      stdio: 'inherit'

    }).on('close', function(code) {
      expect(code).to.equal(0);
      done();
    });
  });

  it("exit event", function(done){
    spawns(['ls', 'ls'], {
      stdio: 'inherit'

    }).on('exit', function(code) {
      expect(code).to.equal(0);
      done();
    });
  });
});


describe("cross-platform compatibility", function(){
  it("spawn a custom command", function(done){
    var path = node_path.join(__dirname, './fixtures/command.js');
    prepare_cmd(path, function (err, file, dir) {
      expect(err).to.equal(null);

      var env = {};
      mix(env, process.env);
      env._CWD = dir;

      spawns([
        file + ' --arg "a b c d"'
      ], {
        env: env

      }).on('close', function (code) {
        expect(code).not.to.equal(0);
        var file = node_path.join(dir, 'arg.tmp')
        var content = fs.readFileSync(file);
        expect(content.toString()).to.equal('a b c d');
        done();
      });
    });
  });

  it("spawn with arguments", function(done){
    var path = node_path.join(__dirname, './fixtures/command.js');
    prepare_cmd(path, function (err, file, dir) {
      expect(err).to.equal(null);

      var env = {};
      mix(env, process.env);
      env._CWD = dir;

      spawns(file, ['--arg', 'a b c d'], {
        stdio: 'inherit',
        env: env
      })
      .on('close', function (code) {
        expect(code).not.to.equal(0);
        var file = node_path.join(dir, 'arg.tmp');
        var content = fs.readFileSync(file);
        expect(content.toString()).to.equal('a b c d');
        done();
      });
    });
  });
});


var shim = require('cmd-shim');
var tmp = require('tmp-sync');
var is_windows = process.platform === 'win32';
function prepare_cmd (path, callback) {
  var dir = tmp.in(__dirname);
  var to = node_path.join(dir, 'command');
  if (is_windows) {
    return shim(path, to, function (err) {
      if (err) {
        return callback(err);
      }

      callback(null, to);
    });
  }

  fs.symlinkSync(path, to);
  // var content = fs.readFileSync(path).toString();
  // console.log(content, to)
  // fs.writeFileSync(to, content);
  // fs.chmodSync(to, 755);
  callback(null, to, dir);
};
