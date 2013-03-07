///////////////////////////////////////////////////////////////////////////////
//
// Written by Nicolas FRADIN
// Date: 2013/03/07
//
///////////////////////////////////////////////////////////////////////////////

(function(_, Backbone) {

      var bindingSplitter = /^(\S+)\s*(.*)$/;

	_.extend(Backbone.View.prototype, {

		bindDataSources: function(dsBindings) {
			console.log("Bind datasources...");
			var self = this;
			// Bindings can be defined three different ways. It can be
                  // defined on the view as an object or function under the key
                  // 'bindings', or as an object passed to bindModel.
                  dsBindings = dsBindings || _.result(this, 'dsBindings');

                  // Skip if no bindings can be found or if the view has no model.
                  if (!dsBindings)
                      return;

                  // Create the private bindings map if it doesn't exist.
                  this._dsBindings = this._dsBindings || {};

                  // Iterate on each binding
                  _.each(dsBindings, function(attribute, binding) {

                        var   match = binding.match(bindingSplitter),
                              element = match[1],
                              tagName = match[2];

                        tagName = tagName || "div";

      			var DOMElement = this.$el.find(element).first();
                  	var DataSource =  typeof(attribute) == "function" ? attribute(this) : attribute;
                        var templateName = DOMElement.attr("ds-item-template");

                        // Create ListViewItem Prototype
                        var ListViewItem = Backbone.View.extend({
                              tagName: tagName,
                              initialize: function() {
                                    this.template = _.template(this.getTemplate(templateName));
                              },
                              render: function() {
                                    $(this.el).html(this.template(this.model.toJSON()));
                                    return this;
                              }
                        });

                        // Create ListView Prototype
                        var ListView = Backbone.View.extend({
                              render: function() {
                                    $(this.el).empty();
                                    _.each(this.model.models, function (dsItem) {
                                          $(this.el).append(new ListViewItem({model: dsItem}).render().el);
                                    }, this);
                                    return this;
                              }
                        });

                        // Build ListView
                        self._dsBindings[element] = new ListView({el: DOMElement, model: DataSource});
                        (function(listView) {

                              // Bind DataSource modifications
                              DataSource.bind("add remove update reset destroy", function() {
                                    listView.render();

                                    var datarole = listView.$el.attr("data-role");
                                    if(datarole == "listview") {
                                          listView.$el.listview();
                                          listView.$el.listview('refresh');
                                    } else {
                                        listView.$el.trigger('create');
                                    }
                              });
                        })(this._dsBindings[element]);

                        // Render ListView
                        self._dsBindings[element].render();

                  }, this);
		}

	});

})(window._, window.Backbone);