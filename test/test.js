var cssInfo = require('../index.js');
var expect = require('chai').expect;

describe('cssInfo.parse(…)', function() {
	it('returns an object', function() {
		var input = '.yellow { color: yellow; }';
		var result = cssInfo.parse(input);
		expect(result).to.be.an('object');
	});
	// it('contains "classes" array', function() {
	// 	var input = '.white, .button { color: white; }'+
	// 		'.phm, .button { padding-left: 1.5rem; padding-right: 1.5rem; }'+
	// 		'.bg-navy, .button, .hover-navy:hover { background-color: navy; }'+
	// 		// '.hover-navy:hover { background-color: navy; }'+
	// 		'body { margin: 0; }';
	// 	var result = cssInfo.parse(input);
	// 	expect(result).to.have.key('classes');
	// 	expect(result['classes']).to.be.an('array');
	// });
});
