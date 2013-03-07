//
//
//
window.MediaModel = Backbone.Model.extend({
	defaults: {
		"_id" : "",
		"name": "New Media",
		"type": "Image",
		"src": ""
	}
});


//
// 
//
window.MediaCollection = Backbone.QueryCollection.extend({

	model: MediaModel,

	// Store collection in local storage
	localStorage: new Backbone.LocalStorage("MediaCollection")

});