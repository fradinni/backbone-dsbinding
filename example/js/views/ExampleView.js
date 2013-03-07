window.ExampleView = Backbone.View.extend({

	bindings: {
		
	},

	dsBindings: {
		"#groupList1 li": function(view){ return groupCollection; },
		"#groupList2": function(view){ return groupCollection; }
	},

	events: {
		"click #btn": "addElement",
		"click a[id^='delete_']": "deleteElement"
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
		var elementName = $("#elementName").val();
		var nbElements = groupCollection.models.length;
		var newElement = new GroupModel({_id: nbElements+1, name: elementName});
		groupCollection.add(newElement);
		newElement.save({}, {
			success: function() {
				console.log("New element saved !");
			}
		});
		$("#elementName").val("");
	},

	deleteElement: function(event) {
		event.preventDefault();
		var tagId = $(event.srcElement).attr('id') || $(event.srcElement.parentNode).attr('id');
		var elementId = tagId.substring(tagId.indexOf('_')+1);
		var element = groupCollection.find(function(obj) { return obj.get('_id') == elementId});
		element.destroy();
	}
});