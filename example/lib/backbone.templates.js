///////////////////////////////////////////////////////////////////////////////
//
// Written by Nicolas FRADIN
// Date: 2013/03/07
//
///////////////////////////////////////////////////////////////////////////////

(function(_, Backbone) {

	// Extend Backbone View prototype
	_.extend(Backbone.View.prototype, {
		getTemplate: function(name) {
			return Backbone.Templates.getTemplate(name);
		}
	});

	// Add Bacbone Templates object
	Backbone.Templates = {
		config: {
			"path": "tpl/",
			"defaultExtension": ".html"
		},

		templates: {},

		loadTemplate: function(name) {
			var self = this;
			console.log("Loading template: " + name);
			$.ajax({
				url: self.config["path"] + name + self.config["defaultExtension"], 
				async: false, 
				success: function(data) { 
			  		self.addTemplate(name, data);
				}
			});
		},

		addTemplate: function(name, template) {
			this.templates[name] = template;
		},

		loadTemplateAsync: function(name, callback) {
			var self = this;
			console.log("[async] Loading template: " + name);
			$.ajax({ 
				url: self.config["path"] + name + self.config["defaultExtension"], 
				async: true, 
				success: function(data) { 
			  		self.addTemplate(name, data);
			  		if(callback) callback();
				}
			});
		},

		loadTemplates: function(names, config, callback) {
			var self = this;
			if(!config || config["async"] != false) {
				for(var index in names) {
					if(index == names.length-1) {
						self.loadTemplateAsync(names[index], callback);
					} else {
						self.loadTemplateAsync(names[index]);
					}
				}
			} else {
				for(var index in names) {
					self.loadTemplate(names[index]);
				}
				if(callback) callback();
			}
		},

		getTemplate: function(name) {
			if(!this.templates[name]) {
				this.loadTemplate(name);
			}
			return this.templates[name];
		}
	}

})(window._, window.Backbone);