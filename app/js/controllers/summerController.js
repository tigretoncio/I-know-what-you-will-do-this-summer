angular.module("summerApp").controller("summerController", ["$env", "$http", "SharedDataService", function($env, $http, $SharedDataService) {

  var self = this;
  var method = 'GET';
  var url = 'https://api.yelp.com/v2/search?callback=JSON_CALLBACK';
  self.Dropdown = $SharedDataService;

  self.update = function(){
    self.reset();
    self.params.callback = 'angular.callbacks._0';
    self.params.location = self.location;
    self.params.radius_filter = (typeof self.radius_filter === 'undefined') ? 5000 : self.radius_filter*1000;
    self.params.cc = self.Dropdown.selected_country;
    self.params.category_filter = self.Dropdown.selected_categories.join(",");
    self.params.term = self.term;
    self.params.sort = self.Dropdown.selected_sort;
    self.params.oauth_nonce = randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
    self.params.oauth_timestamp = new Date().getTime();
    var signature = oauthSignature.generate(method, url, self.params, $env.consumerSecret, $env.tokenSecret);
    self.params.oauth_signature = signature;
    self.getWeather();
  };

  self.buildQuery = function(){
    $http.jsonp(url, {params: self.params}).then(function(response){
      self.result = response.data.businesses;
    });
  };

  self.reset = function(){
    self.result = null;
    self.params = null;
    self.params = {
      callback: "",
      category_filter: "",
      location: "",
      cc: "",
      radius_filter: "5000",
      oauth_consumer_key: $env.oauth_consumer_key,
      oauth_nonce: "",
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: "",
      oauth_token: $env.oauth_token,
      oauth_version: "1.0",
      sort: "",
      term: ""
    };
  };

   function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
      return result;
  }

  self.doSort = function() {
    self.result = self.result.reverse();
  };

  self.getWeather = function() {
    var url = "https://api.wunderground.com/api/403cd5091c5612ec/conditions/q/" + self.Dropdown.selected_country + "/" + self.location + ".json";
    $http.get(url)
    .success(function(response){
      self.temp = response.current_observation.temp_c + "°C";
      self.weather = response.current_observation.weather;
      self.icon_url = response.current_observation.icon_url;
    });
  };

}]);
