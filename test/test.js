var cssInfo = require('../index.js');
var expect = require('chai').expect;

describe('parseRule(…)', function() {
	it('handles parsed css rule', function() {
		var classesByName = {};
		var discardedClassNames = [];
		var context = null;
		var rule = {
			type: 'rule',
			selectors: [
				'.yellow'
			],
			declarations: [
				{
					'property': 'color',
					'value': 'yellow',
				}
			]
		};
		var result = cssInfo._parseRule(classesByName, discardedClassNames, context, rule);
		expect(result).to.deep.equal([]);
		expect(classesByName).to.deep.equal({
			'yellow': {
				declarations: [
					{
						'property': 'color',
						'value': 'yellow',
					}
				],
				'medias': [],
				'states': []
			}
		});
	});
});

describe('cssInfo.parse(…)', function() {
	it('returns an object', function() {
		var input = '.yellow { color: yellow; }';
		var result = cssInfo.parse(input);
		expect(result).to.be.an('object');
	});
	it('returns an object with classes array', function() {
		var input = '.yellow { color: yellow; }';
		var result = cssInfo.parse(input);
		expect(result.classes).to.be.an('array');
	});
	it('handles class declaration containing one rule', function() {
		var input = '.yellow { color: yellow; }';
		var result = cssInfo.parse(input);
		expect(result.classes).to.have.length(1);
		expect(result.classes[0]).to.have.property('className', 'yellow');
		expect(result.classes[0]).to.have.property('properties').that.deep.equals(['color']);
		expect(result.classes[0]).to.have.property('values').that.deep.equals(['yellow']);
	});
	it('handles class declaration containing two rules', function() {
		var input = '.phm { padding-left: 1rem; padding-right: 1rem; }';
		var result = cssInfo.parse(input);
		expect(result.classes).to.have.length(1);
		expect(result.classes[0]).to.have.property('className', 'phm');
		expect(result.classes[0]).to.have.property('propertiesString').that.equals('padding-left,padding-right');
		expect(result.classes[0]).to.have.property('valuesString').that.equals('1rem');
	});
	it('combines rules with same selectors', function() {
		var input = '.phm { padding-left: 1rem; } .phm { padding-right: 1rem; }';
		var result = cssInfo.parse(input);
		expect(result.classes).to.have.length(1);
		expect(result.classes[0]).to.have.property('className', 'phm');
		expect(result.classes[0]).to.have.property('propertiesString').that.equals('padding-left,padding-right');
		expect(result.classes[0]).to.have.property('valuesString').that.equals('1rem');
	});
	it('handles selectors with pseudo-class/state', function() {
		var input = '.hover-yellow:hover { color: yellow; }';
		var result = cssInfo.parse(input);
		expect(result.classes).to.have.length(1);
		expect(result.classes[0]).to.have.property('className', 'hover-yellow');
		expect(result.classes[0]).to.have.property('propertiesString').that.equals('color');
		expect(result.classes[0]).to.have.property('valuesString').that.equals('yellow');
		expect(result.classes[0]).to.have.property('statesString').that.equals('hover');
	});
	it('handles selectors with multiple pseudo-classes/states', function() {
		var input = '.visited-hover-yellow:hover:visited { color: yellow; }';
		var result = cssInfo.parse(input);
		expect(result.classes).to.have.length(1);
		expect(result.classes[0]).to.have.property('className', 'visited-hover-yellow');
		expect(result.classes[0]).to.have.property('propertiesString').that.equals('color');
		expect(result.classes[0]).to.have.property('valuesString').that.equals('yellow');
		expect(result.classes[0]).to.have.property('statesString').that.equals('hover,visited');
	});
	it('discards selectors without classes', function() {
		var input = 'a { color: yellow; } :hover { color: red; }';
		var result = cssInfo.parse(input);
		expect(result.classes).to.have.length(0);
	});
	it('discards selectors with more than one class', function() {
		var input = '.color.yellow { color: yellow; } .color.red { color: red; }';
		var result = cssInfo.parse(input);
		expect(result.classes).to.have.length(0);
	});
	it('discards selectors with elements', function() {
		var input = 'a.yellow { color: yellow; }';
		var result = cssInfo.parse(input);
		expect(result.classes).to.have.length(0);
	});
	it('discards classes with dissimilar pseudo-classes/states', function() {
		var input = '.btn { color: yellow; } .btn:hover { color: red; }';
		var result = cssInfo.parse(input);
		expect(result.classes).to.have.length(0);
	});
	it('handles rules with multiple valid selectors', function() {
		var input = '.active-yellow:active, .focus-yellow:focus, .yellow, .hover-yellow:hover { color: yellow; }';
		var result = cssInfo.parse(input);
		expect(result.classes).to.have.length(4);
	});
});
