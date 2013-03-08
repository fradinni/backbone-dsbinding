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

                        // Extract binding parts
                        var   match = binding.match(bindingSplitter),
                              element = match[1],
                              tagName = match[2];

                        // Ensure that tagName is defined. 
                        //By default it's a DIV
                        tagName = tagName || "div";

                        // Declare DataSource properties
                        var DataSource;
                        var ListViewEvents;
                        var ListItemViewEvents;

                        // Determine typeof binding attribute to set DataSource
                        // It can be an object or a function
                        var attributeType = typeof(attribute);

                        // If attribute is a function, execute it and set
                        // DataSource with result
                        if(attributeType == "function") {
                              // The function has a view parameter which represents
                              // current view.
                              DataSource = attribute(this);
                              ListViewEvents = {};
                              ListItemViewEvents = {};
                        }

                        // If attribute is an object
                        else if(attributeType == "object") {
                              // Extract DataSource and Views parameters
                              DataSource = attribute["dataSource"](this) || undefined;
                              ListViewEvents = attribute["listEvents"] || {};
                              ListItemViewEvents = attribute["itemEvents"] || {};
                        }

                        // If binding attribute is a function,
                        else {
                              throw new Error("Unable to determine type of attribute for dsBinding: " + binding);
                        }
                        
                        console.log("ListItemViewEvents = " + ListItemViewEvents);

                        // Check if DataSource is defined
                        if(!DataSource) {
                              throw new Error("Unable to configure DataSource.")
                        }

                        // Get DOMElement will be binded to DataSource
      			var DOMElement = this.$el.find(element).first();

                        // Get template will be used for a DataSource Item
                        var templateName = DOMElement.attr("ds-item-template");

                        ///////////////////////////////////////////////////////////////
                        // Create ListViewItem Prototype
                        var ListViewItem = Backbone.View.extend({
                              tagName: tagName,
                              events: ListItemViewEvents,
                              initialize: function() {
                                    this.template = _.template(this.getTemplate(templateName));
                              },
                              prepareEvents: function(context) {
                                    var tmpEvents = this.events;
                              },
                              render: function(context) {
                                    // Prepare events for ItemView
                                    prepareEvents(context);

                                    // Render ItemView in $el
                                    $(this.el).html(this.template(this.model.toJSON()));
                                    return this;
                              }
                        });

                        ///////////////////////////////////////////////////////////////
                        // Create ListView Prototype
                        var ListView = Backbone.View.extend({
                              events: ListViewEvents,
                              initialize: function() {
                                    // Init items array
                                    this.itemViews = [];
                              },
                              prepareEvents: function(context) {
                                    var tmpEvents = this.events;
                              },
                              render: function(context) {
                                    // Init items array
                                    this.itemViews = [];

                                    // Clear list HTML
                                    $(this.el).empty();

                                    // Iterate on each model
                                    _.each(this.model.models, function (dsItem) {
                                          // Build ItemView for current model
                                          var itemView = new ListViewItem({model: dsItem});
                                          this.itemViews.push(itemView);

                                          // Prepare events for ItemView
                                          itemView.prepareEvents(context);
                                          
                                          // Render ItemView and append to ListView
                                          $(this.el).append(itemView.render().el);
                                    }, this);

                                    return this;
                              }
                        });

                        ///////////////////////////////////////////////////////////////
                        // Build ListView
                        self._dsBindings[element] = new ListView({el: DOMElement, model: DataSource});
                        (function(parentView, listView) {

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

                        })(this, this._dsBindings[element]);

                        // Render ListView
                        self._dsBindings[element].render(this);

                  }, this);
		}

	});

})(window._, window.Backbone);