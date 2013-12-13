'use strict';

var expect = require('chai').expect;
var spawns = require('../');

describe("spawns", function(){
    it("", function(done){
        spawns(['ls', 'ls'], {
            stdio: 'inherit'
        
        }).on('close', function (code) {
            expect(code).to.equal(0);
            
            done();
        });
    });
});