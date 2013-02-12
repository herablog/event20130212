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

// add user
$('#user .button').tap(function() {
	var input = $('#user .nick-name');
	var nickName = input.value();
	if (!nickName) {
		alert('ニックネームを入力してください。');
		return;
	}
	input.attr({disabled: 'disabled'});
	$('#user .button').visible(0);
	socket.emit('addUser', { name: nickName });
});

// get user data
socket.on('userData', function(data) {
	$.storage('user', data);
});

// win a prize
socket.on('win', function(data) {
	var user = $.storage('user');
	if (user.id === data.id) {
		$('#index img').attr({
			src: '/img/kozuchi.png'
		});
	}
});

// currect user
socket.on('currectUser', function(data) {
	var user = $.storage('user');
	if (user.id === data.id) {
		alert('currect!')
	}
});

// reset answer
socket.on('reset', function() {
	$('#vote li').each(function() {
		$(this).cls({tap: null});
	});
});

// send answer
$('#vote input').tap(function() {
	var el = $(this);
	$('#vote input').each(function() {
		$(this).cls({tap:0});
	});
	el.cls('tap');
	socket.emit('recieveAnswer', { value: el.value() });
});

// save answered data
socket.on('saveAnswer', function(data) {
	$.storage('answer', data);
});

// change page
socket.on('changePage', function(data) {
	$('#vote input').each(function() {
		$(this).cls({tap:0});
	});
	if (data.name === 'q') {
		location.hash = '#vote';
	} else {
		location.hash = '#index';
	}
});

// show page by hash
function showPage(hash) {
	hash = hash || location.hash.substring(1) || 'index';
	var els = $('#contents > div');
	els.each(function() {
		var el = $(this);
		if (el.attr('id') === hash) {
			el.css({ display: 'block' });
		} else {
			el.css({ display: 'none' });
		}
		
	});
}

// event listeners
$.win.on('hashchange', function() {
	showPage();
});

// show page at first time
showPage();

})();