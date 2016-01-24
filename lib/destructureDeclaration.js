module.exports = function destructureDeclaration(declaration) {
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
