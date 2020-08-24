var Vue = require("vue");
var axios = require("axios");
var $ = require("jquery");

window.app = Vue.createApp({
	delimiters: ['[[',']]'],
	data: function(){
		return {
			files: [] 
		}
	},
	mounted: function(){
		axios.get('/api/csv')
			.then(response => (this.files = response.data.files));
	}

})

$('progress').attr({
  value: 0,
  max: 100,
});

$(':file').on('change', function () {
  var file = this.files[0];
});
$(':button').on('click', function () {
  $.ajax({
    url: '/api/csv',
    type: 'POST',
    data: new FormData($('#upload_form')[0]),

    cache: false,
    contentType: false,
    processData: false,

    xhr: function () {
      console.log($('#upload_form'));
      var myXhr = $.ajaxSettings.xhr();
      if (myXhr.upload) {
        // For handling the progress of the upload
        myXhr.upload.addEventListener('progress', function (e) {
          if (e.lengthComputable) {
            $('progress').attr({
              value: e.loaded,
              max: e.total,
            });
          }
        }, false);
      }
      return myXhr;
    },
  });
});
