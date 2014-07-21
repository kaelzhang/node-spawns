'use strict';

var expect = require('chai').expect;
var spawns = require('../');
var node_path = require('path');
var fs = require('fs');

describe("spawns", function() {
  it("normal", function(done) {
    spawns(['ls', 'ls'], {
      stdio: 'inherit'

    }).on('close', function(code) {
      expect(code).to.equal(0);
      done();
    });
  });

  var proto = spawns.Spawns.prototype;

  // #4
  var command = 'command -a "a \'b\' c" -b \'a "b" c\' -c "a b" -d \'a b\' -e "a" -f \'a\' -g "a b c'
  it("double quoted: " + command, function(){
    var slices = command.split(/\s+/);
    slices.shift();
    var args = proto._balance_args(slices);
    expect(args).to.deep.equal([
      '-a', "a 'b' c", 
      '-b', 'a "b" c', 
      '-c', 'a b',
      '-d', "a b",
      '-e', 'a',
      '-f', "a",
      '-g', '"a', 'b', 'c'
    ]);
  });
});


describe("cross-platform compatibility", function(){
  it("spawn a custom command", function(done){
    var path = node_path.join(__dirname, './fixtures/command.js');
    spawns([
      path + ' --arg "a b c d"'
    ]).on('close', function (code) {
      expect(code).not.to.equal(0);
      var file = node_path.join(__dirname, 'fixtures', 'arg.tmp')
      var content = fs.readFileSync(file);
      expect(content.toString()).to.equal('a b c d');
      done();
    });
  });
});
