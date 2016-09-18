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

exports.adminUserLogin = function(req, res, next) {
	var username = req.body.username;
	var password = req.body.password;

	if (username && password) {

		db.bind('admin');

		db.admin.find({
			'username': username
		}).toArray(function(err, result) {
			if (err) throw err;

			if (result.length > 0) {

				if (result[0].password == password) {

					req.session.admin = username;
					req.session.regenerate(function(err) {
						if (err) console.log("session重新初始化失败.");
						else console.log("session被重新初始化.");
					});
					
					res.json({
						'json': '0000',
						'msg': '登录成功'
					});
				} else {
					res.json({
						'json': '0002',
						'msg': '用户名或密码不正确'
					})
				}
			} else {
				res.json({
					'json': '0001',
					'msg': '用户不存在'
				})
			}

		});
	}
}

exports.requireAdminLogin = function(req,res,next){
	if(!req.session.admin){
		res.redirect('/admin/login')
	}
	next();
}

exports.adminLoginout = function(req,res,next){
	req.session.destroy(function(err) {
		if (err) console.log("sessions清除失败");
		else console.log("sessions清除完成");
	});
	res.redirect('/admin/login');
}


exports.adminLogin = function(req,res,next){
	res.render('admin/login',{
		title:'后台登录'
	})
}

exports.adminUserList = function(req,res,next){
	res.render('admin/userList',{
		title:'用户列表',
		sideTitle:'用户列表'
	})
}

exports.userList = function(req,res,next){

	var pageSize = req.body.pageSize*1;
	var skip = req.body.skip*1;
	var count = 0;
	var newResult;

	db.bind('user');
	
	db.user.find({}).sort({'time':-1}).skip(skip).limit(pageSize).toArray(function(err, result) {

		db.user.count(function(err,count){
			if (err) throw err;
			
			newResult = {"userList":result,"count":count,'pageSize':pageSize}

				if (err) throw err;

				if(newResult.userList.length>0){
					
					res.json({
						'json':'0000',
						'data':newResult
					})
				}
		})
	})
}

exports.deleteUser = function(req,res){
	var id = req.body.objectId;

	db.bind('user');
	db.user.remove({'_id':ObjectId(id)},function(err){
		if(err) throw err;
		res.json({
			'json':'0000',
			'msg':'用户删除成功'
		});
		req.session.userName = ''
	})
}

