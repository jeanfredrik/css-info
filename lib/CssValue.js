var _ = require('lodash');

var CssValue = function(regex, options) {
	_.extend(this, options);
	var regexSource = regex.source;
	this.getAllRegex = this.getAllRegex || new RegExp('(?:^|\s+)('+regexSource+')(?:$|\s+)', 'g');
	this.getOneRegex = this.getOneRegex || new RegExp('(?:^|\s+)('+regexSource+')(?:$|\s+)', '');
	this.getNextRegex = this.getNextRegex || new RegExp('^(?:\s*)('+regexSource+')(?:$|\s+)', '');
};
CssValue.prototype.getAll = function(str, cb) {
	var matches = [];
	var result = str.replace(this.getAllRegex, function() {
		matches.push(arguments[1]);
		return '';
	});
	cb(matches);
	return result;
};

//XXX Currently accepts all alphabetical strings as units
//XXX Currently accepts unitless numbers that are not zero
CssValue.lengthValue = new CssValue(/^[+-]?(\d+|\d*\.\d+)([a-z]+)?$/);

CssValue.borderStyle = new CssValue(/^(none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset)$/);

//XXX Currently accepts anything wrapped in rgb(), rgba(), hsl() and hsla() as color
//XXX Currently accepts hexstring of any length as color
//XXX Currently accepts all alpabetical strings as colors
CssValue.color = new CssValue(/^((rgba?|hsla?)\(.*?\)|#[0-9a-fA-F]+|[a-zA-Z]+)$/);

module.exports = CssValue;
