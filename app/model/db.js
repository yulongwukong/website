exports.db = function(){
	var config = require('../../config.json');
	var mongoskin = require('mongoskin');
	var fs = require('fs');
	var ObjectId = require('mongodb').ObjectID;
	var localhost = 'http://localhost:4000/upload/'

	var userName = config.username,
		passWord = config.password,
		dbName = config.dbname,
		port = config.port,
		host = config.host;

	var dbUrl = 'mongodb://'+host+':'+port+'/'+dbName
	var db = mongoskin.db(dbUrl,{native_parser:true});
}