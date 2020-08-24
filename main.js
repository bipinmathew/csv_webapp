var Vue = require("vue");
var axios = require("axios");
var $ = require("jquery");
window.Grid = require("gridjs");

window.app = Vue.createApp({
	delimiters: ['[[',']]'],
	data: function(){
		return {
			files: [] 
		}
	},
  methods: {
    uploadHandler: function(){
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
    },
    updateFile: function(){
      var file = this.files[0];
    },
    handlePreview: function(args){
      console.log(args);
      axios.get('/api/csv/'+args)
        .then(response =>(Grid.Grid(response.data.csv).render(document.getElementById('#csv_preview'))));
    }
  },
	mounted: function(){
    $('progress').attr({
      value: 0,
      max: 100,
    });
		axios.get('/api/csv')
			.then(response => (this.files = response.data.files));
	}
});
