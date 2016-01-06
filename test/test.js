var cssInfo = require('../index.js');
var expect = require('chai').expect;

describe('cssInfo.parse(…)', function() {
	it('returns an object', function() {
		var input = '.yellow { color: yellow; }';
		var result = cssInfo.parse(input);
		expect(result).to.be.an('object');
	});
});
