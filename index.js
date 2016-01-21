var css = require('css');
var _ = require('underscore');
var Immutable = require('immutable');

function declarationHasNoVendorPrefixes(declaration) {
	return !/^-.*?-/.test(declaration.property) && !/^-.*?-/.test(declaration.value);
}

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

function destructureDeclaration(declaration) {
	var propertyMatches, destructuredDeclarations, values;

	// border-top, border-right, border-bottom, border-left
	if((propertyMatches = declaration.property.match(/^border-(top|right|bottom|left)$/))) {
		destructuredDeclarations = {};
		declaration.value = CssValue.lengthValue.getAll(declaration.value, function(values) {
			if(values.length) {
				destructuredDeclarations[propertyMatches[0]+'-width'] = values[values.length-1];
			} else {
				destructuredDeclarations[propertyMatches[0]+'-width'] = 'initial';
			}
		});
		declaration.value = CssValue.borderStyle.getAll(declaration.value, function(values) {
			if(values.length) {
				destructuredDeclarations[propertyMatches[0]+'-style'] = values[values.length-1];
			} else {
				destructuredDeclarations[propertyMatches[0]+'-style'] = 'initial';
			}
		});
		declaration.value = CssValue.color.getAll(declaration.value, function(values) {
			if(values.length) {
				destructuredDeclarations[propertyMatches[0]+'-color'] = values[values.length-1];
			} else {
				destructuredDeclarations[propertyMatches[0]+'-color'] = 'initial';
			}
		});
		return _.map(destructuredDeclarations, function(value, property) {
			return {
				property: property,
				value: value
			};
		});
	}
	// border
	else if((propertyMatches = declaration.property.match(/^border$/))) {
		destructuredDeclarations = {};
		declaration.value = CssValue.lengthValue.getAll(declaration.value, function(values) {
			if(values.length) {
				destructuredDeclarations['border-top-width'] = values[values.length-1];
				destructuredDeclarations['border-right-width'] = values[values.length-1];
				destructuredDeclarations['border-bottom-width'] = values[values.length-1];
				destructuredDeclarations['border-left-width'] = values[values.length-1];
			} else {
				destructuredDeclarations['border-top-width'] = 'initial';
				destructuredDeclarations['border-right-width'] = 'initial';
				destructuredDeclarations['border-bottom-width'] = 'initial';
				destructuredDeclarations['border-left-width'] = 'initial';
			}
		});
		declaration.value = CssValue.borderStyle.getAll(declaration.value, function(values) {
			if(values.length) {
				destructuredDeclarations['border-top-style'] = values[values.length-1];
				destructuredDeclarations['border-right-style'] = values[values.length-1];
				destructuredDeclarations['border-bottom-style'] = values[values.length-1];
				destructuredDeclarations['border-left-style'] = values[values.length-1];
			} else {
				destructuredDeclarations['border-top-style'] = 'initial';
				destructuredDeclarations['border-right-style'] = 'initial';
				destructuredDeclarations['border-bottom-style'] = 'initial';
				destructuredDeclarations['border-left-style'] = 'initial';
			}
		});
		declaration.value = CssValue.color.getAll(declaration.value, function(values) {
			if(values.length) {
				destructuredDeclarations['border-top-color'] = values[values.length-1];
				destructuredDeclarations['border-right-color'] = values[values.length-1];
				destructuredDeclarations['border-bottom-color'] = values[values.length-1];
				destructuredDeclarations['border-left-color'] = values[values.length-1];
			} else {
				destructuredDeclarations['border-top-color'] = 'initial';
				destructuredDeclarations['border-right-color'] = 'initial';
				destructuredDeclarations['border-bottom-color'] = 'initial';
				destructuredDeclarations['border-left-color'] = 'initial';
			}
		});
		return _.map(destructuredDeclarations, function(value, property) {
			return {
				property: property,
				value: value
			};
		});
	}
	// border-style, border-width, border-color
	else if((propertyMatches = declaration.property.match(/^border-(style|width|color)$/))) {
		values = declaration.value.split(/\s+/g);
		CssValue[
			{
				style: 'borderStyle',
				width: 'lengthValue',
				color: 'color',
			}[propertyMatches[1]]
		].getAll(declaration.value, function(matchedValues) {
			values = matchedValues;
		});
		destructuredDeclarations = {};
		switch(values.length) {
			case 1:
			destructuredDeclarations['border-top-'+propertyMatches[1]] = values[0];
			destructuredDeclarations['border-right-'+propertyMatches[1]] = values[0];
			destructuredDeclarations['border-bottom-'+propertyMatches[1]] = values[0];
			destructuredDeclarations['border-left-'+propertyMatches[1]] = values[0];
			break;
			case 2:
			destructuredDeclarations['border-top-'+propertyMatches[1]] = values[0];
			destructuredDeclarations['border-right-'+propertyMatches[1]] = values[1];
			destructuredDeclarations['border-bottom-'+propertyMatches[1]] = values[0];
			destructuredDeclarations['border-left-'+propertyMatches[1]] = values[1];
			break;
			case 3:
			destructuredDeclarations['border-top-'+propertyMatches[1]] = values[0];
			destructuredDeclarations['border-right-'+propertyMatches[1]] = values[1];
			destructuredDeclarations['border-bottom-'+propertyMatches[1]] = values[2];
			destructuredDeclarations['border-left-'+propertyMatches[1]] = values[1];
			break;
			case 4:
			destructuredDeclarations['border-top-'+propertyMatches[1]] = values[0];
			destructuredDeclarations['border-right-'+propertyMatches[1]] = values[1];
			destructuredDeclarations['border-bottom-'+propertyMatches[1]] = values[2];
			destructuredDeclarations['border-left-'+propertyMatches[1]] = values[3];
			break;
		}
		return _.map(destructuredDeclarations, function(value, property) {
			return {
				property: property,
				value: value
			};
		});
	} else {
		return [{
			property: declaration.property,
			value: declaration.value,
		}];
	}

}

function parseRule(classesByName, context, rule) {
	context = (context || new Immutable.Map({
		medias: new Immutable.Set()
	}));
	if(rule.type === 'rule') {
		var extendee;
		rule.selectors.forEach(function(selector) {
			// Skip selectors that are comprised of anything more than classes and pseudo-classes.
			if(!/^(\.[\w-]+|:[\w-]+)+$/.test(selector)) return;
			var selectorParts = selector.split(/(?!^)(?=[.:])/g);
			var selectorClasses = [];
			var selectorPseudoClasses = [];
			selectorParts.forEach(function(part) {
				if(part.substr(0,1) == '.') {
					selectorClasses.push(part.substr(1));
				} else {
					selectorPseudoClasses.push(part.substr(1));
				}
			});
			if(selectorClasses.length == 1) {
				var className = selectorClasses[0];
				classesByName[className] = classesByName[className] || {};
				classesByName[className].declarations = (classesByName[className].declarations || []).concat(rule.declarations);
				if(selectorPseudoClasses.length) {
					classesByName[className].states = selectorPseudoClasses;
				} else {
					classesByName[className].states = [];
				}
				if(extendee) {
					classesByName[className].extendees = classesByName[className].extendees || [];
					classesByName[className].extendees.push(extendee);
				} else if(!selectorPseudoClasses.length) {
					extendee = className;
				}
				classesByName[className].medias = context.get('medias').toArray();
			}
		});
		return false;
	} else if(rule.type === 'media') {
		rule.rules = rule.rules.filter(_.partial(parseRule, classesByName, context.update('medias', function(medias) {
			return medias.add(rule.media);
		})));
		return rule.rules.length > 1;
	}
	return true;
}

module.exports = {
	'parse': function(input, options) {
		options = _.extend({
			medias: true,
			mediasString: true,
			states: true,
			statesString: true,
			declarations: true,
			declarationsMap: true,
			declarationsString: true,
			values: true,
			valuesString: true,
			properties: true,
			propertiesString: true,
			stateVersions: true,
			stateVersionsMap: true,
			negativeValues: true,
			destructureShorthands: true,
		}, options || {});

		var file = css.parse(input);

		var rules = file.stylesheet.rules;
		var classesByName = {};
		rules = rules.filter(_.partial(parseRule, classesByName, null));
		var classes = _.values(classesByName);
		Object.keys(classesByName).forEach(function(className) {
			var classObj = classesByName[className];
			classObj.className = className;
		});

		if(options.mediasString) {
			classes.forEach(function(classObj) {
				classObj.mediasString = _.chain(classObj.medias).sort().value().join(';');
			});
		}

		if(options.statesString) {
			classes.forEach(function(classObj) {
				classObj.statesString = _.chain(classObj.states).sort().value().join(',');
			});
		}

		if(options.declarations) {
			classes.forEach(function(classObj) {
				var d = classObj.declarations;
				classObj.declarations = [];
				d.filter(function(declaration) {
					return declaration.type === 'declaration';
				}).forEach(function(declaration) {
					classObj.declarations = classObj.declarations.concat(destructureDeclaration(declaration).filter(declarationHasNoVendorPrefixes));
				});
			});
		}

		if(options.declarationsMap) {
			classes.forEach(function(classObj) {
				classObj.declarationsMap = {};
				classObj.declarations.forEach(function(declaration) {
					classObj.declarationsMap[declaration.property] = declaration.value;
				});
			});
		}

		if(options.declarationsString) {
			joiner = function(pair) {
				return pair.join(':');
			};
			classes.forEach(function(classObj) {
				classObj.declarationsString = _.chain(classObj.declarationsMap).pairs().sortBy('0').map(joiner).value().join(';');
			});
		}

		if(options.values) {
			classes.forEach(function(classObj) {
				classObj.values = _.chain(classObj.declarationsMap).pairs().pluck('1').uniq().value();
			});
		}

		if(options.valuesString) {
			classes.forEach(function(classObj) {
				classObj.valuesString = _.chain(classObj.values).sort().value().join(',');
			});
		}

		if(options.properties) {
			classes.forEach(function(classObj) {
				classObj.properties = _.chain(classObj.declarationsMap).pairs().pluck('0').uniq().value();
			});
		}

		if(options.propertiesString) {
			classes.forEach(function(classObj) {
				classObj.propertiesString = _.chain(classObj.properties).sort().value().join(',');
			});
		}

		if(options.stateVersions) {
			classes.forEach(function(classObj) {
				if(classObj.states.length) {
					classObj.stateVersions = [];
					return;
				}
				classObj.stateVersions = _.chain(classes).filter(function(classObj2) {
					return classObj2.states.length &&
						classObj2.declarationsString === classObj.declarationsString;
				}).map(function(classObj2) {
					return {
						className: classObj2.className,
						states: classObj2.states,
						statesString: classObj2.statesString
					};
				}).value();
			});
		}

		if(options.stateVersionsMap) {
			classes.forEach(function(classObj) {
				classObj.stateVersionsMap = {};
				classObj.stateVersions.forEach(function(stateVersion) {
					if(!classObj.stateVersionsMap[stateVersion.statesString]) {
						classObj.stateVersionsMap[stateVersion.statesString] = [];
					}
					classObj.stateVersionsMap[stateVersion.statesString].push(stateVersion.className);
				});
			});
		}

		if(options.negativeValues) {
			classes.forEach(function(classObj) {
				classObj.negativeValues = _.chain(classObj.values).filter(function(value) {
					return (/^-(\.?\d.*$)/).test(value);
				}).value();
			});
		}

		return {
			'classes': classes
		};
	}
};
