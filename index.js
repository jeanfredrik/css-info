var destructureDeclaration = require('./lib/destructureDeclaration.js');
var css = require('css');
var _ = require('lodash');
var Immutable = require('immutable');

function declarationHasNoVendorPrefixes(declaration) {
	return !/^-.*?-/.test(declaration.property) && !/^-.*?-/.test(declaration.value);
}

function parseValidSelector(selector) {
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
	return {
		classes: selectorClasses,
		pseudoClasses: selectorPseudoClasses,
	};
}

function parseRule(classesByName, discardedClassNames, context, rule) {
	context = (context || new Immutable.Map({
		medias: new Immutable.Set()
	}));
	if(rule.type === 'rule') {
		var invalidSelectors = [];
		var validSelectors = [];
		rule = Immutable.fromJS(rule);
		rule.get('selectors').forEach(function(selector) {
			var className, selectorParts;
			if(!/^(\.[\w-]+|:[\w-]+)+$/.test(selector)) {
				// Skip selectors that are comprised of anything more than classes and pseudo-classes.
				invalidSelectors.push(selector);
			} else {
				selectorParts = parseValidSelector(selector);
				if(selectorParts.classes.length == 1) {
					className = selectorParts.classes[0];
					if(_.includes(discardedClassNames, className)) {
						// Skip selector if class is in `discardedClassNames`
						invalidSelectors.push(selector);
					} else {
						if(!classesByName[className] || _.xor(classesByName[className].states, selectorParts.pseudoClasses).length === 0) {
							// Selector is valid!
							validSelectors.push({
								className: className,
								states: selectorParts.pseudoClasses,
							});
						} else {
							// Skip selector if pseudo-classes doesn't match a previous selector with same class
							invalidSelectors.push(selector);
							discardedClassNames.push(className);
							if(classesByName[className]) {
								delete classesByName[className];
							}
						}
					}
				} else {
					// Skip selectors with more than one class
					invalidSelectors.push(selector);
				}
			}
		});
		if(validSelectors.length) {
			_.forEach(validSelectors, function(selector) {
				var className = selector.className;
				classesByName[className] = classesByName[className] || {};
				classesByName[className].declarations = (classesByName[className].declarations || []).concat(rule.get('declarations').toJS());
				if(selector.states.length) {
					classesByName[className].states = selector.states;
				} else {
					classesByName[className].states = [];
				}
				classesByName[className].medias = context.get('medias').toArray();
			});
		}
		if(invalidSelectors.length) {
			return [rule.set('selectors', invalidSelectors)];
		} else {
			return [];
		}
	} else if(rule.type === 'media') {
		rule.rules = rule.rules.filter(_.partial(parseRule, classesByName, discardedClassNames, context.update('medias', function(medias) {
			return medias.add(rule.media);
		})));
		return rule.rules.length > 1;
	}
	// return [rule];
}

module.exports = {
	_parseRule: parseRule,
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
		var discardedClassNames = [];
		var classesByName = {};
		rules = _.flatMap(rules, _.partial(parseRule, classesByName, discardedClassNames, null));
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
				classObj.declarationsString = _.chain(classObj.declarationsMap).toPairs().sortBy('0').map(joiner).value().join(';');
			});
		}

		if(options.values) {
			classes.forEach(function(classObj) {
				classObj.values = _.chain(classObj.declarationsMap).values().uniq().value();
			});
		}

		if(options.valuesString) {
			classes.forEach(function(classObj) {
				classObj.valuesString = _.chain(classObj.values).sort().value().join(',');
			});
		}

		if(options.properties) {
			classes.forEach(function(classObj) {
				classObj.properties = _.chain(classObj.declarationsMap).keys().uniq().value();
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
