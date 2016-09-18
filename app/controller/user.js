
var mongoskin = require('mongoskin');
var ObjectId = require('mongodb').ObjectID;
var nodemailer = require('nodemailer')
var smtpTransport = require('nodemailer-smtp-transport');
var moment = require('moment');

//设置邮件发送
var email = {
	service: 'QQ',
    user: '861571609@qq.com',
    pass: 'pkjxtfyjwlkybehi',
}

smtpTransport = nodemailer.createTransport(smtpTransport({
    service: email.service,
    auth:{
        user: email.user,
        pass: email.pass
    }
}));

//设置短信发送

TopClient = require('topClient').TopClient;
var client = new TopClient({
    'appkey': '23453519',
    'appsecret': '8aff8b51c65624bd1393852246fe65ae',
    'REST_URL': 'http://gw.api.taobao.com/router/rest'
});

var fs = require('fs');
var images = require('images');
var path = require('path');
var captchapng = require('captchapng');

var config = require('../../config.json');
var userName = config.username,
	passWord = config.password,
	dbName = config.dbname,
	port = config.port,
	host = config.host;

var dbUrl = 'mongodb://'+host+':'+port+'/'+dbName
var db = mongoskin.db(dbUrl,{native_parser:true});


var crypto = require('crypto');//加密；
var salt = "lefupuhui";

var pic = '/images/default_boy.jpg'

exports.register = function(req, res) {
	res.render('register', {
		title: '注册'
	})
}

exports.setNickname = function(req,res){
	res.render('setNickname',{
		title:'设置昵称'
	})
}

exports.login = function(req, res) {
	res.render('login', {
		title: '登录'
	})
}

exports.forget = function(req, res) {
	res.render('forget', {
		title: '修改密码'
	})
}

exports.center = function(req, res) {

	var userName = req.session.userName;
	var query = {$or:[{'userPhone':userName},{'userMail':userName},{'nickname':userName}]}

	db.bind('user');
	db.user.find(query).toArray(function(err,result){
		if(err) throw err;
		
		if(result.length>0){
			res.render('center', {
				title: '个人中心',
				user:result[0]
			})
		}
		else{
			res.redirect('/login')
		}
		
	})
}

exports.getUser = function(req, res) {
	var userName = req.session.userName;
	db.bind('user');
	db.user.find({'nickname':userName}).toArray(function(err,result){
		if(err) throw err;
		if(result.length>0){
			res.json({
				'json':'0000',
				'data':result[0].pic
			})
		}
		else{
			res.json({
				'json':'0001',
				'pic':pic
			})
		}
		
	})
}

//图片增加水印；
exports.watermarkImg = function(req,res){

	var watermarkImg = images(path.join(__dirname, '../../public/images/default_girl.jpg'));
	var sourceImg = images(path.join(__dirname, '../../public/images/banner01.jpg'));
	var savePath = path.join(__dirname, '../../public/images/saveImg.jpg');

	// 比如放置在右下角，先获取原图的尺寸和水印图片尺寸
	var sWidth = sourceImg.width();
	var sHeight = sourceImg.height();
	var wmWidth = watermarkImg.width();
	var wmHeight = watermarkImg.height();

	images(sourceImg)
	  // 设置绘制的坐标位置，右下角距离 10px
	  .draw(watermarkImg, sWidth - wmWidth - 10, sHeight - wmHeight - 10)
	  // 保存格式会自动识别
	  .save(savePath);
    
}


exports.uploadPic = function(req,res){

	var file = req.files.image_file.path;
	var fileWidth = req.body.fileWidth*1;
	var fileHeight = req.body.fileHeight*1;
	var level = 400;
	var scale = 1;

	if(getMax(fileWidth,fileWidth)>level){
		scale = fileWidth>fileHeight?parseFloat(fileWidth/level):parseFloat(fileHeight/level);
	}

	var imgType = req.body.filetype;
	var userId = req.body.userId;
	var username = req.session.username;

	var x1 = req.body.x1*scale,
		y1 = req.body.y1*scale,
		w = req.body.w*scale,
		h = req.body.h*scale,
		sourceImg = images(path.join(__dirname, '../../'+file)),
		savePath = path.join(__dirname, '../../public/upload/user/'+userId+"."+imgType.split('/')[1]);


	images(sourceImg,x1,y1,w,h)
	  .save(savePath,{operation:100});

	db.bind('user');
	db.user.findAndModify({'username':username},[],{$set:{'pic':'/upload/user/'+userId+'.'+imgType.split('/')[1]}},function(error){
		if(error) throw error;

		db.bind('comment');
		db.comment.update(
			{'userId':userId},
			{$set:{'userPic':'/upload/user/'+userId+'.'+imgType.split('/')[1]}},
			{multi:true},
			function(){
				res.redirect('/center');
			}
		)
	});

	function getMax(w,h){
	    if(w>h){
	        return w;
	    }
	    else{
	        return h
	    }
	}

}

exports.deleteUser = function(req, res) {
	var userName = req.session.userName;
	db.bind('user');
	db.user.remove({'nickname':userName},function(err){
		if(err) throw err;
		req.session.userName = '';
		res.json({
			'json':'0000',
			'msg':'用户注销成功！'
		})
	})
}

exports.sendMsg = function(req, res, next){

	var userPhone = req.body.userPhone;
	var phoneCode = parseInt(Math.random()*900000+100000)+"";
	req.session.phoneCode = phoneCode;

	db.bind('user');
	db.user.find({'userPhone':userPhone}).toArray(function(err,result){
		if(err) throw err;
		if(result.length==0){
			client.execute('alibaba.aliqin.fc.sms.num.send' , {
			      sms_free_sign_name: '吴玉隆的网站',
			      sms_type: 'normal' ,
				  sms_param:JSON.stringify({"number":phoneCode, "product": "吴玉隆"}),
				  rec_num: userPhone,
				  sms_template_code: 'SMS_14771399'
			}, function(error, data) {
				if(error) console.log(error);
				console.log(data);
				if(data.result.err_code==0){
					res.json({
						'json':'0000',
						'msg':'此手机号码尚未注册！'
					})
				}
			});
		}
		else{
			res.json({
				'json':'0001',
				'msg':'此手机号码已经被注册！'
			})
		}
	})
}

exports.phoneRegister = function(req, res, next) {

	var userPhone = req.body.userPhone;
	var phoneCode = req.body.phoneCode;
	var passWord = md5Salt(req.body.passWord,salt);
	var type = req.body.type;
	
	if (userPhone && passWord && phoneCode){

		if(req.session.phoneCode==phoneCode){
			db.bind('user');
			db.user.find({
				'userPhone': userPhone
			}).toArray(function(err, result) {
				if (err) throw err;
				if (result.length == 0) {

					db.user.save({
						'userPhone': userPhone,
						'passWord': passWord,
						'type':type,
						'pic':pic,
						'time':moment().format('YYYY-MM-DD HH:mm:ss')
					})
					res.json({
						'json': '0000'
					});

				} else {
					res.json({
						'json': '0001',
						'msg': '此手机号已被注册'
					})
				}
			});
		}
		else{
			res.json({
				'json': '0002',
				'msg': '手机验证码不匹配！'
			})
		}

	}
};

exports.mailRegister = function(req, res, next) {

	var userMail = req.body.userMail;
	var mailCode = req.body.mailCode;
	var passWord = md5Salt(req.body.passWord,salt);
	var type = req.body.type;
	
	if (userMail && passWord && mailCode ) {

		if(req.session.mailCode == mailCode){

			db.bind('user');
			db.user.find({
				'userMail': userMail
			}).toArray(function(err, result) {
				if (err) throw err;
				if (result.length == 0) {

					db.user.save({
						'userMail': userMail,
						'passWord': passWord,
						'type':type,
						'pic':pic,
						'time':moment().format('YYYY-MM-DD HH:mm:ss')
					})
					res.json({
						'json': '0000'
					});

				} else {
					res.json({
						'json': '0001',
						'msg': '此邮箱已被注册'
					})
				}

			});
		}
		else{
			res.json({
				'json': '0002',
				'msg': '邮箱验证码不匹配！'
			})
		}	
	}
};

exports.phone_nickname = function(req, res, next){
	var userPhone = req.body.userPhone;
	var nickname = req.body.nickname;

	if(nickname){
		db.bind('user');
		db.user.find({'nickname':nickname}).toArray(function(err,result){
			if(err) console.log(err);
			if(result.length==0){
				db.user.findAndModify(
					{'userPhone':userPhone},
					[],
					{$set:{'nickname':nickname}},
					{new:true,upset:true},
					function(err){
						if(err) console.log(err);
						res.json({
							'json':'0000',
							'msg':'此昵称可以使用！'
						})
					}
				)
			}
			else{
				res.json({
					'json':'0001',
					'msg':'此昵称已经存在！'
				})
			}
		})
	}
}

exports.mail_nickname = function(req, res, next){
	var userMail = req.body.userMail;
	var nickname = req.body.nickname;

	if(nickname){
		db.bind('user');
		db.user.find({'nickname':nickname}).toArray(function(err,result){
			if(err) console.log(err);
			if(result.length==0){
				db.user.findAndModify(
					{'userMail':userMail},
					[],
					{$set:{'nickname':nickname}},
					{new:true,upset:true},
					function(err){
						if(err) console.log(err);
						res.json({
							'json':'0000',
							'msg':'此昵称可以使用！'
						})
					}
				)
			}
			else{
				res.json({
					'json':'0001',
					'msg':'此昵称已经存在！'
				})
			}
		})
	}
}

exports.userLogin = function(req, res, next) {

	var userName = req.body.userName;
	var passWord = md5Salt(req.body.passWord,salt);

	if (userName && passWord) {

		db.bind('user');

		db.user.find({
			$or:[{'userPhone': userName},{'userMail': userName},{'nickname': userName}]
		}).toArray(function(err, result) {

			if (err) throw err;
			if (result.length > 0) {

				if (result[0].passWord === passWord) {

					req.session.userName = result[0].nickname;
					req.session.userId = result[0]._id;
					req.session.passWord = passWord;

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

//数字验证码
exports.getCode = function(req, res) {

	var width=!isNaN(parseInt(req.query.width))?parseInt(req.query.width):100;
    var height=!isNaN(parseInt(req.query.height))?parseInt(req.query.height):30;

    var code = parseInt(Math.random()*9000+1000);
    req.session.checkcode = code;

    var p = new captchapng(width,height, code);
    p.color(255, 0, 0, 0);  // First color: background (red, green, blue, alpha) 
    p.color(0, 0, 0, 150); // Second color: paint (red, green, blue, alpha) 

    var img = p.getBase64();
    var imgbase64 = new Buffer(img,'base64');
    res.writeHead(200, {
        'Content-Type': 'image/png'
    });
    res.end(imgbase64);
}

exports.checkCode = function(req,res){
	var code = req.body.code;

	if(code == req.session.checkcode){
		res.json({
			'json':'0000',
			'msg':'图片验证码输入正确！'
		})
	}
	else{
		res.json({
			'json':'0001',
			'msg':'请输入正确的图片验证码！'
		})
	}
}

exports.register_sendMail = function(req, res){

	var userMail = req.body.userMail;
	var mailCode = parseInt(Math.random()*900000+100000);
	req.session.mailCode = mailCode;

	db.bind('user');
	db.user.find({'userMail':userMail}).toArray(function(err,result){
		if(err) throw err;
		if(result.length==0){
			var html = 
			'<p>您好：您在XXX社区的注册要求已收到，以下是注册验证码：</p>'+
			'<p>邮箱验证码：'+mailCode+'</p>'+
			'<p>该验证码5分钟内有效，请尽快进行注册。</p>'+
			'<p>如果您没有在XXX要求注册码，请忽略此邮件。这可能是其他人不小心输错了邮箱。</p>'+
			'<p>如果您还有其他问题，请回复此邮件。</p>'

			smtpTransport.sendMail({
		        from: email.user,
		        to: userMail,
		        subject: '吴玉隆的网站注册码',
		        html: html
		    }, function (error, response) {
		        if (error) {
		            console.log(error);
		        }
		        res.json({
		        	json:'0000',
		        	msg:'邮件发送成功！'
		        })
		    });
		}
		else{
			res.json({
	        	json:'0001',
	        	msg:'此邮箱账号已经注册！'
	        })
		}
	})
}

exports.forget_sendMail = function(req, res){

	var userMail = req.body.userMail;
	var mailCode = parseInt(Math.random()*900000+100000);
	req.session.mailCode = mailCode;

	db.bind('user');
	db.user.find({'userMail':userMail}).toArray(function(err,result){
		if(err) throw err;
		if(result.length>0){
			var nickname = result[0].nickname;
			var html = 
			'<p>'+nickname+',</p>'+
			'<p>您好：您在XXX社区的找回密码要求已收到，以下是密码找回的验证码：</p>'+
			'<p>邮箱验证码：'+mailCode+'</p>'+
			'<p>该验证码5分钟内有效，请尽快进行密码找回。</p>'+
			'<p>如果您没有在XXX要求找回密码，请忽略此邮件。这可能是其他人不小心输错了邮箱。</p>'+
			'<p>如果您还有其他问题，请回复此邮件。</p>'

			smtpTransport.sendMail({
		        from: email.user,
		        to: userMail,
		        subject: '吴玉隆个人网站找回密码',
		        html: html
		    }, function (error, response) {
		        if (error) {
		            console.log(error);
		        }
		        res.json({
		        	json:'0000',
		        	msg:'邮件发送成功！'
		        })
		    });
		}
		else{
			res.json({
	        	json:'0001',
	        	msg:'此邮箱账号尚未注册！'
	        })
		}
	})
}

exports.forget_sendMsg = function(req, res){

	var userPhone = req.body.userPhone;
	var phoneCode = parseInt(Math.random()*900000+100000)+"";
	req.session.phoneCode = phoneCode;

	db.bind('user');
	db.user.find({'userPhone':userPhone}).toArray(function(err,result){
		if(err) throw err;
		if(result.length>0){
			client.execute('alibaba.aliqin.fc.sms.num.send' , {
			      sms_free_sign_name: '吴玉隆的网站',
			      sms_type: 'normal' ,
				  sms_param:JSON.stringify({"number":phoneCode, "product": "吴玉隆"}),
				  rec_num: userPhone,
				  sms_template_code: 'SMS_14731889'
			}, function(error, data) {
				if(error) console.log(error);
				console.log(data);
				if(data.result.err_code==0){
					res.json({
						'json':'0000',
						'msg':'短信发送成功！'
					})
				}
				else{
					res.json({
						'json':'0001',
						'msg':'短信发送请求超时！'
					})
				}
			});
		}
		else{
			res.json({
				'json':'0002',
				'msg':'此手机号码尚未注册！'
			})
		}
	})

}

exports.checkMailcode = function(req, res){
	var mailCode = req.body.mailCode;
	var passWord = md5Salt(req.body.passWord,salt);
	var userMail = req.body.userMail
	if(mailCode==req.session.mailCode){
		db.bind('user')
		db.user.update({'userMail':userMail},{$set:{'passWord':passWord}},function(err){
			if(err) throw err;
			res.json({
				json:'0000',
				msg:'验证通过'
			})
		})
	}
	else{
		res.json({
			json:'0001',
			msg:'邮箱验证码不匹配'
		})
	}
}

exports.checkPhonecode = function(req, res){
	var phoneCode = req.body.phoneCode;
	var passWord = md5Salt(req.body.passWord,salt);
	var userPhone = req.body.userPhone
	if(phoneCode==req.session.phoneCode){

		db.bind('user')
		db.user.update({'userPhone':userPhone},{$set:{'passWord':passWord}},function(err){
			if(err) throw err;
			res.json({
				json:'0000',
				msg:'验证通过'
			})
		})
	}
	else{
		res.json({
			json:'0001',
			msg:'手机验证码不匹配！'
		})
	}
}


exports.requireLogin = function(req,res,next){
	if(!req.session.userName){
		res.redirect('/login')
	}
	else{
		next()
	}
}

exports.loginout = function(req,res,next){
	var url = req.query.url||"/login";
	req.session.destroy(function(err) {
		if (err) console.log("sessions清除失败");
		else console.log("sessions清除完成");
	});
	res.redirect(url)
}


exports.adminLogin = function(req,res,next){
	res.render('admin/login',{
		title:'后台登录'
	})
}

exports.adminIndex = function(req,res,next){
	res.render('admin/index',{
		title:'后台登录'
	})
}

//加盐的md5；
function md5Salt(text,salt){
	var md5 = crypto.createHash('md5');   //crypto模块功能是加密并生成各种散列
  	return md5.update(text+salt).digest('hex');
}