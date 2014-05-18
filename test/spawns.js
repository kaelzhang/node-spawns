'use strict';

var expect = require('chai').expect;
var spawns = require('../');

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
  var command = 'command -a "a \'b\' c" -b \'a "b" c\' -c "a b" -d \'a b\' -e "a" -f \'a\''
  it("double quoted: " + command, function(){
    var parsed = proto._parse_command(command);

    expect(parsed.name).to.equal('command');
    expect(parsed.args).to.deep.equal([
      '-a', '"a \'b\' c"', 
      '-b', "'a \"b\" c'", 
      '-c', '"a b"',
      '-d', "'a b'",
      '-e', '"a"',
      '-f', "'a'"
    ]);
    expect(parsed.origin).to.equal(command);
  });
});