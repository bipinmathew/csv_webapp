var Vue = require("vue");
var axios = require("axios");
var $ = require("jquery");
var gridjs = require("gridjs");

window.app = Vue.createApp({
	delimiters: ['[[',']]'],
	data: function(){
		return {
			files: [] ,
      selected_file: null,
			upload_file: null,
			loading: false
		}
	},
	created: function(){
		this._grid = new gridjs.Grid({data:[],columns:[]});
	},
  methods: {
		updateFile: function(event){
			if(event.target.files[0])
				this.upload_file=event.target.files[0].name;
			else
				this.upload_file=null;
		},
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
						.then(function(response){
							$('progress').attr({
								value: 0,
								max: 100,
							});
							mythis.files = response.data.body.files;
							mythis.selected_file = mythis.upload_file;
							mythis.upload_file = null;
						});
				}
      });
    },
    handlePreview: function(){
			var mythis = this;
			if(!this.selected_file){
				alert("Please select a file first.");
				return(0);
			}
			mythis.loading = true;
      axios.get('/api/csv/'+this.selected_file+'?start=0&get=10')
        .then(response => {
					var obj = {
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
								return response.body.data;
							},
							total: function(response){
								return response.body.total;
							}
						}
					};
					var returned_data = response.data.body;
					returned_data.pagination=obj.pagination;
					returned_data.server=obj.server;
					$('#csv_preview').empty();
					mythis._grid.updateConfig(returned_data)
						.forceRender();
        })
			.catch(function(error){
				alert(error.response.data.msg);
			})
			.finally(function(){
				mythis.loading = false;
			});
    },
    handleDownload: function(){
			if(!this.selected_file){
				alert("Please select a file first.");
				return(0);
			}
      axios.get('/api/csv/'+this.selected_file+'/download')
        .then(response => {
					window.location = '/api/csv/'+this.selected_file+'/download'
        })
				.catch(function(error){
					alert(error.response.data.msg);
				});
    },
    handleStats: function(){
			if(!this.selected_file){
				alert("Please select a file first.");
				return(0);
			}
			var mythis = this;
			mythis.loading = true;
      axios.get('/api/csv/'+this.selected_file+'/stats')
        .then(response => {
					$('#csv_preview').empty();
					var obj = response.data.body;
					obj.pagination = false;
					obj.server = null;
					mythis._grid
						.updateConfig(obj)
						.forceRender();
        })
			.catch(function(error){
				alert(error.response.data.msg);
			})
			.finally(function(){
				mythis.loading = false;
			});
    },
  },
	mounted: function(){
		this._grid.render(document.getElementById('csv_preview'));
    $('progress').attr({
      value: 0,
      max: 100,
    });
		axios.get('/api/csv')
			.then(response => (this.files = response.data.body.files));
	},
});
