
var util = require('util');

exports.post_entitlements = function(input) {
	return process(input, function(el) {
		return Object.assign({}, el, {
			"creationDateTime": new Date().getTime(),
			"enabled": true
		});
	});
}

exports.return_entitlements = function(input) {
	return process(input, function(el) {	
		var status = calculateStatus(el);
		return Object.assign({}, el, {
			"status": status
		});
	});
}

function process(input, fnMap) {
	var res = asArray(input)
			.map(fnMap)
			.reduce(function(col, el) {
				return col.concat([el]);
			},[]);
	return util.isArray(input) ? res : res[0];
}

function calculateStatus(el) {
	if (['MILITARY','STUDENT'].indexOf(el.productRestrictionName) == -1) return 'UNBOUND';
	if (!el.enabled) return 'CANCELLED';
	if (el.expirationDateTime < new Date().getTime()) return 'EXPIRED';
	return 'ACTIVE';
}

function asArray(input) {
	return util.isArray(input) ? input : [input];
}