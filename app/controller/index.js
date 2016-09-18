// var db = require('../../app/model/db.js');

var config = require('../../config.json');
var mongoskin = require('mongoskin');
var fs = require('fs');
var ObjectId = require('mongodb').ObjectID;
var moment = require('moment');

var localhost = 'http://localhost:4000/upload/'

var userName = config.username,
	passWord = config.password,
	dbName = config.dbname,
	port = config.port,
	host = config.host;

var dbUrl = 'mongodb://'+host+':'+port+'/'+dbName
var db = mongoskin.db(dbUrl,{native_parser:true});


exports.index = function(req,res){
	res.render('index',{
		title:'首页'
	});
}

exports.adminIndex = function(req,res,next){
	res.render('admin/index',{
		title:'后台登录',
		sideTitle:'banner图轮播',
		banner:{}
	})
}

//新建首页banner图
exports.newHomeBanner = function(req,res,next){

	var uploadImg = req.files.uploadImg.name?localhost+req.files.uploadImg.name:req.body.poster,
		link = req.body.link,
		id = req.body.id,
		sortIndex = req.body.sortIndex;

	var json = {
		'uploadImg':uploadImg,
		'link':link,
		'sortIndex':moment().format('YYYY-MM-DD'),
		'orderTime':moment().format('YYYY-MM-DD HH:mm:ss')
	}

	//有id更新，没有新增；	
	if(id){
		db.bind('bannerList');
		db.bannerList.update({_id:ObjectId(id)},json,function(error){
			if(error) throw error
		})
	}
	else{
		db.bind('bannerList');

		db.bannerList.save(json,{sort:{'sortIndex':1}});
	}

	res.redirect('/admin/homeBannerList');
}


//上传缩略图
exports.uploadImg = function(req,res,next){
	
	var uploadImg = req.files.uploadImg;
	var poster = req.body.poster;

	if(!poster){
		if(uploadImg!='undefined'){ //如果有需要上传的文件  
	        var tempPath=uploadImg.path; //获取上传之后的文件路径  
	        fs.rename(tempPath,'./public/upload/'+uploadImg.name,function(err){  //将文件移动到你所需要的位置  
	            if(err){throw err}  
	            next(); 
	        });  
	    }

	}
	else{
		next();
	}
}

exports.homeBannerList = function(req,res,next){
	res.render('admin/homeBannerList',{
		title:'首页banner列表',
		sideTitle:'首页banner列表',
	})
}

exports.getHomeBannerList = function(req,res,next){

	db.bind('bannerList');
	db.bannerList.find({}).sort({'sortIndex':1}).toArray(function(err, result) {

		if (err) throw err;
		if(result.length>0){
			res.json({
				'json':'0000',
				'data':result
			})
		}
		
	})
}

exports.homeDeleteBanner = function(req,res,next){

	var objectId = req.body.objectId;
	db.bind('bannerList');

	db.bannerList.find({'_id':ObjectId(objectId)}).toArray(function(err, result) {
		
		if (err) throw err;
		if(result.length>0){
			db.bannerList.remove({'_id':ObjectId(objectId)},function(){
				res.json({
					json:'0000',
					msg:'删除成功'
				})
			})
		}
	})
}

exports.homeBannerUpdate = function(req,res,next){

	var id = req.params.id;

	db.bind('bannerList');
	db.bannerList.find({'_id':ObjectId(id)}).toArray(function(err, result) {
		
		if (err) throw err;
		if(result.length>0){
			res.render('admin/index',{
				title:'首页新建新闻',
				sideTitle:'首页新建新闻',
				banner:result[0]
			})
		}
	})
}