var css = require('css');
var jspath = require('jspath');

module.exports = {
	'parse': function(input) {
		var file = css.parse(input);
		var rules = jspath.apply('..*{.type === "stylesheet"}.stylesheet.rules', {file: file});
		var classesByName = {};
		rules = rules.filter(function(rule) {
			if(rule.type == 'rule') {
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
						}
						if(extendee) {
							classesByName[className].extendees = classesByName[className].extendees || [];
							classesByName[className].extendees.push(extendee);
						} else if(!selectorPseudoClasses.length) {
							extendee = className;
						}
					}
				});
				return false;
			}
			return true;
		});
		var classes = [];
		Object.keys(classesByName).forEach(function(className) {
			classesByName[className].className = className;
			var declarations = jspath.apply('.declarations{.type === "declaration"}', classesByName[className]);
			var firstValue = declarations[0].value;
			classesByName[className].properties = declarations.map(function(declaration) {
				return declaration.property;
			});
			if(declarations.every(function(declaration) {
				return declaration.value == firstValue;
			})) {
				classesByName[className].value = firstValue;
			}
			classesByName[className].css = css.stringify({
				type: 'stylesheet',
				stylesheet: {
					rules: [{
						type: 'rule',
						selectors: ['.'+className + (classesByName[className].states || []).map(function(state) {
							return ':'+state;
						}).join('')],
						declarations: classesByName[className].declarations,
					}]
				}
			}, {indent: '  '});
			classes.push(classesByName[className]);
		});
		return {
			'classes': []
		};
	}
};
