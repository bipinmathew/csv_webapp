var Vue = require("vue");
var axios = require("axios");
var $ = require("jquery");
var gridjs = require("gridjs");

window.app = Vue.createApp({
	delimiters: ['[[',']]'],
	data: function(){
		return {
			files: [] ,
      selected_file: null
		}
	},
  methods: {
    uploadHandler: function(){
			var mythis = this;
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
				success: function(){
					axios.get('/api/csv')
						.then(response => (mythis.files = response.data.body.files));
				}
      });
    },
    updateFile: function(){
      var file = this.files[0];
    },
    handlePreview: function(){
			var myobj = this;
			myobj.columns = [];
			var grid = new gridjs.Grid({
				pagination: {
					limit: 10,
					server:{
						url: function(prev,page,limit){
							return prev+'?start='+(page*limit)+'&get='+limit;
						}
					}
				},
				server: {
					url:'/api/csv/'+this.selected_file,
					then: function(response){
						myobj.columns = response.body.columns;
						return response.body.data;
					},
					total: function(response){
						return response.body.total;
					}
				}
			});

			grid.updateConfig({columns:myobj.columns}).render(document.getElementById("csv_preview"));

			/**
      axios.get('/api/csv/'+this.selected_file+'?start=0&get=10')
        .then(response => {
          var grid = new gridjs.Grid(JSON.parse(response.data.body))
            .render(document.getElementById("csv_preview"));
        });
				**/
    },
    handleDownload: function(){
      axios.get('/api/csv/'+this.selected_file+'/download')
        .then(response => {
					window.location = '/api/csv/'+this.selected_file+'/download'
        });
    },
    handleStats: function(){
      axios.get('/api/csv/'+this.selected_file+'/stats')
        .then(response => {
          var grid = new gridjs.Grid(JSON.parse(response.data.body))
            .render(document.getElementById("csv_preview"));
        });
    },
  },
	mounted: function(){
    $('progress').attr({
      value: 0,
      max: 100,
    });
		axios.get('/api/csv')
			.then(response => (this.files = response.data.body.files));
	}
});
