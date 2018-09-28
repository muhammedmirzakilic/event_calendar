(function($) {

  var app = $.sammy('#app', function() {
    this.use('Template');
/*
    this.around(function(callback) {
      var context = this;
      this.load('data/articles.json')
          .then(function(items) {
            context.items = items;
          })
          .then(callback);
    });
*/
    this.get('#/', function(context) {
      this.partial('views/home.htm');
    });
    this.get('#/home', function(context) {
      this.partial('views/home.htm');
    });
    this.get('#/profile', function(context) {
      this.partial('views/profile.htm');
    });
    this.get('#/events', function(context) {
      this.partial('views/events.htm');
    });
    this.get('#/sign', function(context) {
      this.partial('views/sign.htm');
    });
    this.get('#/users', function(context) {
      this.partial('views/users.htm');
    });
    this.before('.*', function() {

        var hash = document.location.hash;
        $("nav").find("a").removeClass("active");
        $("nav").find("a[href='"+hash+"']").addClass("active");
   });

  });

  $(function() {
    app.run('#/sign');
  });

})(jQuery);
