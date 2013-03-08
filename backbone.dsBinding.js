///////////////////////////////////////////////////////////////////////////////
//
// Written by Nicolas FRADIN
// Date: 2013/03/07
//
///////////////////////////////////////////////////////////////////////////////

(function(_, Backbone) {

      var bindingSplitter = /^(\S+)\s*(.*)$/;
      var functionSplitter = /^(\w+)[\(]([\w_,\s]+)[\)]$/;

      //
      // Extend Backbone View Prototype
      //
	_.extend(Backbone.View.prototype, {

            //
            // Method used to bind DataSources to view
            //
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
                              initialize: function() {
                                    this.template = _.template(this.getTemplate(templateName));
                              },
                              render: function(context) {
                                    // Render ItemView in $el
                                    $(this.el).html(this.template(this.model.toJSON()));
                                    return this;
                              }
                        });

                        ///////////////////////////////////////////////////////////////
                        // Create ListView Prototype
                        var ListView = Backbone.View.extend({
                              initialize: function() {
                                    // Init items array
                                    this.itemViews = [];
                              },
                              render: function(context) {

                                    // Clear list HTML
                                    $(this.el).empty();

                                    // Iterate on each model
                                    _.each(this.model.models, function (dsItem) {
                                          // Build ItemView for current model
                                          var itemView = new ListViewItem({model: dsItem, events: {}});
                                          this.itemViews.push(itemView);
                                          // Generate Events for current ItemView
                                          itemView.delegateEvents(Backbone.DsBinding.prepareEventsForView(itemView, ListItemViewEvents, self));
                                          
                                          // Render ItemView and append to ListView
                                          $(this.el).append(itemView.render().el);
                                    }, this);

                                    return this;
                              }
                        });


                        ///////////////////////////////////////////////////////////////
                        // Build ListView
                        self._dsBindings[element] = new ListView({el: DOMElement, model: DataSource});

                        // Use IIF to bind DataSource events to View
                        (function(listView) {

                              // Bind DataSource modifications to View
                              DataSource.bind("add remove update reset destroy", function() {
                                    listView.render();

                                    var datarole = listView.$el.attr("data-role");
                                    if(datarole == "listview") {
                                          listView.$el.listview();
                                          listView.$el.listview('refresh');
                                    } 
                                    listView.$el.trigger('create');
                              });

                        })(this._dsBindings[element]);


                        // Render ListView
                        this._dsBindings[element].render(this);

                        // Use IIF to bind Model events to View
                        (function(listView) {
                              if(listView.itemViews.length > 0) {
                                    _.each(listView.itemViews, function(itemView){
                                          itemView.model.bind('change', function(){ 
                                                listView.render();
                                                if(listView.$el.data("role") == "listview")
                                                      listView.$el.listview('refresh');
                                                else
                                                      listView.$el.trigger('create');
                                          }, itemView);
                                    });
                              }
                        })(this._dsBindings[element]);
                        
                  }, this);
		}

	});


      //
      // DsBinding Object
      // Contains utility methods and objects
      //
      Backbone.DsBinding = {};


      //
      // Method used to prepare events for View
      //
      Backbone.DsBinding.prepareEventsForView = function(view, events, context) {

            // Get events keys
            var eventBindings = _.keys(events);
            var viewEvents = {};

            // Iterate on each event binding
            _.each(eventBindings, function(eventBinding) {

                  // Check typeof event
                  var eventType = typeof(events[eventBinding]);

                  // If event is a function
                  if(eventType == "function") {
                        viewEvents[eventBinding] = events[eventBinding](context);
                  }

                  // If event is a String
                  else if(eventType == "string") {

                        // Use regex to extract function name and params
                        var   fctMatch = events[eventBinding].match(functionSplitter),
                              fctName = fctMatch ? fctMatch[1] : events[eventBinding],
                              fctParams = fctMatch ? fctMatch[2] : "";

                        // Split params names
                        var paramsArray = fctParams.split(',');

                        // Build trim function
                        var trim = function(text) {
                              return text.replace(/^\s+/g,'').replace(/\s+$/g,'')
                        }

                        // Build params object.
                        var params = {};
                        _.each(paramsArray, function(param){
                              var paramName = trim(param);
                              params[paramName] = view.model.get(paramName);
                        });

                        // Create view event
                        viewEvents[eventBinding] = (function(view, context, events){ 
                              return function(event){ context[fctName](event, view, params); }; 
                        })(view, context, events);
                  }

                  // If event has another type -> Error
                  else {
                        throw new Error("Unable to process event with type: " + eventType);
                  }

            }, this);

            return viewEvents;
      };


})(window._, window.Backbone);