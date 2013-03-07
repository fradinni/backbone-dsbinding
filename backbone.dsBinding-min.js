/*
//
// Written by Nicolas FRADIN
// Date: 2013/03/07
//
// https://github.com/fradinni/backbone-dsbinding
//
*/(function(e,t){var n=/^(\S+)\s*(.*)$/;e.extend(t.View.prototype,{bindDataSources:function(r){console.log("Bind datasources...");var i=this;r=r||e.result(this,"dsBindings");if(!r)return;this._dsBindings=this._dsBindings||{};e.each(r,function(r,s){var o=s.match(n),u=o[1],a=o[2];a=a||"div";var f=this.$el.find(u).first();var l=typeof r=="function"?r(this):r;var c=f.attr("ds-item-template");var h=t.View.extend({tagName:a,initialize:function(){this.template=e.template(this.getTemplate(c))},render:function(){$(this.el).html(this.template(this.model.toJSON()));return this}});var p=t.View.extend({render:function(){$(this.el).empty();e.each(this.model.models,function(e){$(this.el).append((new h({model:e})).render().el)},this);return this}});i._dsBindings[u]=new p({el:f,model:l});(function(e){l.bind("add remove update reset destroy",function(){e.render();var t=e.$el.attr("data-role");if(t=="listview"){e.$el.listview();e.$el.listview("refresh")}else{e.$el.trigger("create")}})})(this._dsBindings[u]);i._dsBindings[u].render()},this)}})})(window._,window.Backbone)