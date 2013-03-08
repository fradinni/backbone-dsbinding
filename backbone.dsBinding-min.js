/*
//
// Written by Nicolas FRADIN
// Date: 2013/03/07
//
// https://github.com/fradinni/backbone-dsbinding
//
*/(function(e,t){var n=/^(\S+)\s*(.*)$/;var r=/^(\w+)[\(]([\w_,\s]+)[\)]$/;e.extend(t.View.prototype,{bindDataSources:function(r){console.log("Bind datasources...");var i=this;r=r||e.result(this,"dsBindings");if(!r)return;this._dsBindings=this._dsBindings||{};e.each(r,function(r,s){var o=s.match(n),u=o[1],a=o[2];a=a||"div";var f;var l;var c;var h=typeof r;if(h=="function"){f=r(this);l={};c={}}else if(h=="object"){f=r["dataSource"](this)||undefined;l=r["listEvents"]||{};c=r["itemEvents"]||{}}else{throw new Error("Unable to determine type of attribute for dsBinding: "+s)}if(!f){throw new Error("Unable to configure DataSource.")}var p=this.$el.find(u).first();var d=p.attr("ds-item-template");var v=t.View.extend({tagName:a,initialize:function(){this.template=e.template(this.getTemplate(d))},render:function(e){$(this.el).html(this.template(this.model.toJSON()));return this}});var m=t.View.extend({initialize:function(){this.itemViews=[]},render:function(n){$(this.el).empty();e.each(this.model.models,function(e){var n=new v({model:e,events:{}});this.itemViews.push(n);n.delegateEvents(t.DsBinding.prepareEventsForView(n,c,i));$(this.el).append(n.render().el)},this);return this}});i._dsBindings[u]=new m({el:p,model:f});(function(e){f.bind("add remove update reset destroy",function(){e.render();var t=e.$el.attr("data-role");if(t=="listview"){e.$el.listview();e.$el.listview("refresh")}e.$el.trigger("create")})})(this._dsBindings[u]);this._dsBindings[u].render(this);(function(t){if(t.itemViews.length>0){e.each(t.itemViews,function(e){e.model.bind("change",function(){t.render();if(t.$el.data("role")=="listview")t.$el.listview("refresh");else t.$el.trigger("create")},e)})}})(this._dsBindings[u])},this)}});t.DsBinding={};t.DsBinding.prepareEventsForView=function(t,n,i){var s=e.keys(n);var o={};e.each(s,function(s){var u=typeof n[s];if(u=="function"){o[s]=n[s](i)}else if(u=="string"){var a=n[s].match(r),f=a?a[1]:n[s],l=a?a[2]:"";var c=l.split(",");var h=function(e){return e.replace(/^\s+/g,"").replace(/\s+$/g,"")};var p={};e.each(c,function(e){var n=h(e);p[n]=t.model.get(n)});o[s]=function(e,t,n){return function(n){t[f](n,e,p)}}(t,i,n)}else{throw new Error("Unable to process event with type: "+u)}},this);return o}})(window._,window.Backbone)