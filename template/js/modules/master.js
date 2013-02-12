(function() {

// initial socket io
var socket = io.connect('/');

// connect
socket.on('connect', function(c){
	console.log('connect', c);
	$('body').cls('connected');
});

// disconnect
socket.on('disconnect', function(data) {
	console.log('disconnect');
	$('body').cls({'connected': null});
});

// save all data
socket.on('saveAllData', function(data) {
	$.storage('allData', data);
});

// change page
$('#menu button').tap(function() {
	var el = $(this);
	if (el.data('name') === 'select') {
		socket.emit('select');
		$.http.get('/api/user/selected').on({
			complete: function(data) {
				$('#contents').prepend($.tag('p').text([data.name, data.id].join(',')));
			}
		});
	} else if (el.data('name') === 'currect') {
		socket.emit('currectUser');
	} else {
		socket.emit('changePage', {
			name: el.data('name'),
			option: el.data('option')
		});
	}
});

})();