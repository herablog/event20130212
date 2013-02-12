(function() {

$('body').cls('connected');

// get answer data
var qid = $('#contents').data('id');
$.http.get('/api/answers/' + qid).on({
	complete: function(res) {
		var data = res.data;
		var total = data.reduce(function(x,y) {
			return x + y;
		});
		var values = data.map(function(val) {
			return val / total * 100;
		});
		// set data to the element
		$('#chart li').each(function() {
			var el = $(this);
			var num = parseInt(el.data('num'), 10);
			var percentage = Math.floor(values[num]) + '%';
			el.css({width: percentage});
			el.find('.percentage').text(percentage);
			el.find('.value').text('(' + data[num] + ')');
		});
	}
});

})();