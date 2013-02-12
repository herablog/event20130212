// node modules
var path = require('path');
var http = require('http');

// 3rd party modules
// get command line arguments
var argv = require('optimist').argv;
var port = argv.port || 3000;

// get base directory path
var basedir = path.join(__dirname, '..');

// create web server
var express = require('express');
var app = express();
app.configure(function() {
	// jade setting
	app.set('view engine','jade');
	app.set('views', path.join(basedir, '/template/jade'));
	// static server setting
	app.use(express['static'](path.join(basedir, '/public')));
});

// routing
app.get('/', function(req, res){
	res.render('user');
});

app.get('/master', function(req, res){
	res.render('master');
});

app.get('/master/:id', function(req, res){
	res.render('master/answer.jade', {
		id: req.param('id')
	});
});

// api
// get answer counts
app.get('/api/answers/:id?', function(req, res) {
	var id = parseInt(req.param('id'), 10) - 1;
	res.json(answers[id] ? { data: answers[id] } : {});
});

// get all correct user
app.get('/api/user/selected', function(req, res) {
	res.json(selectedUser);
});

// start server
var server = http.createServer(app).listen(port, function(){
	console.log('server started port on ' + port);
});

// user data object
var user = {};
var selectedUser = {};

// answer data object
var answers = {};
var current = 0;
var defaultAnswer = require('../config/answer.json');

// socket io
var io = require('socket.io').listen(server);
io.configure(function() {
	io.set("transports", ["xhr-polling"]);
	io.set("polling duration", 10);
	io.set('log level', 1);
});

// connect
io.sockets.on('connection', function (socket) {
	
	// disconnect
	socket.on('disconnect', function() {
		if (user[socket.id]) {
			delete user[socket.id];
		}
	});
	
	// added user
	socket.on('addUser', function(data) {
		// save user data
		user[socket.id] = {
			id: socket.id,
			name: data.name,
			answer: []
		};
		// send user data to client
		socket.emit('userData', user[socket.id]);
	});
	
	// recieve user answer
	socket.on('recieveAnswer', function(data) {
		if (user[socket.id]) {
			// minus answer data
			if (user[socket.id].answer[current]) {
				answers[current][user[socket.id].answer[current].value]--;
			}
			// plus answer data
			answers[current] && answers[current][parseInt(data.value, 10)]++;
			// save data
			user[socket.id].answer[current] = data;
			socket.emit('saveAnswer', user[socket.id].answer);
		}
		// save all data in client
		socket.broadcast.emit('saveAllData', {
			user: user,
			answer: answers
		});
	});
	
	// select user
	socket.on('select', function() {
		var id = user[Object.keys(user)[select(user)]] && user[Object.keys(user)[select(user)]].id;
		// broadcast selected user data
		if (id) {
			selectedUser = user[id];
			socket.broadcast.emit('win', user[id]);
		}
	});
	
	// change page
	socket.on('changePage', function(data) {
		current = parseInt(data.option, 10);
		// create answer object
		answers[current] = [];
		answers[current][0] = answers[current][1] = answers[current][2] = answers[current][3] = 0;
		// send to client
		socket.broadcast.emit('changePage', data);
	});
	
	// currect user
	socket.on('currect', function() {
		socket.emit('currectUser', user[socket.id]);
	});
	
});

function select(obj) {
	return parseInt(Math.random() * Object.keys(obj).length, 10);
}
