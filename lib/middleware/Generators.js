(function() {
	
	exports.uuid = function() {
	    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	      var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
	      return v.toString(16);
    	});
  	};

  	exports.int = function(existingIds) {
  		existingIds.sort(function(a, b) {
  			return a - b;
		});
		for (var i = 0; i < existingIds.length; i++) {
			if (existingIds[i] != (i + 1)) return i + 1;
		}
  		return existingIds.length + 1;
  	}
})();