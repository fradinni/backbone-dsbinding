window.ExampleView = Backbone.View.extend({

	bindings: {
		
	},

	dsBindings: {
		"#groupList1 li": {
			dataSource: function(view){ return groupCollection; },
			itemEvents: {
				//"click .delete": "test2"
			}
		},
		"#groupList2": function(view){ return groupCollection; }
	},

	events: {
		"click #btn": "addElement",
		"click .delete": "deleteElement"
	},

	initialize: function() {
		this.template = _.template(this.getTemplate("example"));
	},

	render: function() {
		if(!this.model) {
			$(this.el).html(this.template());
		} else {
			$(this.el).html(this.template(this.model.toJSON()));
		}
		this.bindDataSources();	// Bind datasources to view
		return this.bindModel();
	},

	addElement: function(event) {
		event.preventDefault();

		// Get element name
		var elementName = $("#elementName").val();

		// Build new element
		var nbElements = groupCollection.models.length;
		var newElement = new GroupModel({_id: nbElements+1, name: elementName});

		// Save element
		groupCollection.add(newElement);
		newElement.save({}, {
			success: function() {
				console.log("New element saved !");
			}
		});

		// Clear input field
		$("#elementName").val("");
	},

	deleteElement: function(event) {
		event.preventDefault();
		var id = $(event.currentTarget).data("id")
		var element = groupCollection.find(function(obj) { return obj.get('_id') == id });
		element.destroy();
	}
});