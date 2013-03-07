var AppRouter = Backbone.Router.extend({
	routes: {
		"": "home",
		"example": "example"
	},

	initialize: function() {
		this.firstPage = true;
	},

	home: function() {
		this.changePage(new HomeView());
	},

	example: function() {
		this.changePage(new ExampleView());
	},

	changePage: function (page) {
        $(page.el).attr('data-role', 'page');
        page.render();
        $('body').append($(page.el));
        var transition = $.mobile.defaultPageTransition = 'slide';
        // We don't want to slide the first page
        if (this.firstPage) {
            transition = 'none';
            this.firstPage = false;
        }
        $.mobile.changePage($(page.el), {changeHash:false, transition: transition});
    }
});

$(document).ready(function() {	

	// Initialize collections
	window.groupCollection = new GroupCollection();
	groupCollection.fetch();

	var app = new AppRouter();
	Backbone.history.start();
});