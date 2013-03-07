//
//
//
window.GroupModel = Backbone.Model.extend({
	defaults: {
		"_id" : "",
		"name": "New Media"
	}
});


//
// 
//
window.GroupCollection = Backbone.QueryCollection.extend({

	model: GroupModel,

	// Store collection in local storage
	localStorage: new Backbone.LocalStorage("GroupCollection")

});