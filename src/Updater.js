define(function() {
	var Updater = function() {
		this.layerHash = {};
	}
	
	Updater.prototype = {
		/**
		 * 为了避免调用indexOf，采用此hash
		 */
		registerLayer: function(id) {
			this.layerHash[id] = false;
		},
		
		register: function register(layer) {
			this.layerHash[layer.id] = layer;
		},
		
		update: function() {
			for(var i in this.layerHash) {
				var layer = this.layerHash[i];
				if(layer) layer.update();
				this.layerHash[i] = false;
			}
		},
		
		remove: function(obj) {
			//TODO
		}
	};
	
	return new Updater();
});
