const app = Vue.createApp({
	delimiters: ['[[',']]'],
	data: function(){
		return {
			files: 'Hello' 
		}
	},
	mounted: function(){
		axios.get('/api/csv')
			.then(response => (this.files = response.data.files));
	}

})

var get_files = function(){
  $.getJSON("/api/csv",function(data){
    data.files.forEach(file => {
      $('#file_list').append(new Option(file, file));
    });
  });
}

$(document).ready(function(){
  get_files()
});

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

    success: get_files
  });
});
