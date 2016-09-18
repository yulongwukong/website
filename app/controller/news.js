var config = require('../../config.json');
var mongoskin = require('mongoskin');
var fs = require('fs');
var ObjectId = require('mongodb').ObjectID;
var moment = require('moment');

var localhost = 'http://localhost:4000/'

var userName = config.username,
	passWord = config.password,
	dbName = config.dbname,
	port = config.port,
	host = config.host;

var dbUrl = 'mongodb://'+host+':'+port+'/'+dbName
var db = mongoskin.db(dbUrl,{native_parser:true});

exports.news = function(req,res){
	
	res.render('news',{
		title:'新闻列表'
	});

}

exports.adminCommentList = function(req,res){

	var id = req.params.id;

	res.render('admin/commentList',{
		title:'新闻评论列表',
		sideTitle:'新闻评论列表',
		'id':id
	});

}

exports.api_commentList = function(req,res){

 	var id = req.body.id;

	var pageSize = req.body.pageSize*1;
	var skip = req.body.skip*1;
	var count = 0;
	var newResult;

	db.bind('comment');
	db.comment.find({'newsId':id}).sort({'time':-1}).skip(skip).limit(pageSize).toArray(function(err, result) {
		if(result.length>0){
			db.comment.count({'newsId':id},function(err,count){
				if (err) throw err;
				newResult = {"newList":result,"count":count,'pageSize':pageSize}

					if (err) throw err;

					if(newResult.newList.length>0){
						
						res.json({
							'json':'0000',
							'data':newResult
						})
					}
			})
		}
		else{
			res.json({
				'json':'0001',
				'msg':'没有任何评论！'
			})
		}
	})

}

exports.deleteComment = function(req,res,next){

	var objectId = req.body.objectId;
	var id=req.body.id;
	db.bind('comment');

	db.comment.find({'_id':ObjectId(objectId)}).toArray(function(err, result) {
		if (err) throw err;
		if(result.length>0){
			db.comment.remove({'_id':ObjectId(objectId)},function(){
				db.bind('newList');
				db.newList.findAndModify({'_id':ObjectId(id)},[],{$inc:{'commentCount':-1}})
				res.json({
					json:'0000',
					msg:'删除成功'
				})
			})
		}
	})
}



exports.news_detail = function(req,res){

	var id = req.params.id;

	db.bind('newList');
	db.newList.find({'_id':ObjectId(id)}).toArray(function(err, result) {

		if (err) throw err;
		if(result.length>0){

			res.render('news_detail',{
				title:'新闻详细',
				news_detail:result[0]
			});
		}
	})
}


exports.newHomeNew = function(req,res,next){
	res.render('admin/newHomeNew',{
		title:'首页新建新闻',
		sideTitle:'首页新建新闻',
		news:{}
	})
}

exports.homeNewUpdate = function(req,res,next){

	var id = req.params.id;

	db.bind('newList');
	db.newList.find({'_id':ObjectId(id)}).toArray(function(err, result) {
		
		if (err) throw err;
		if(result.length>0){
			res.render('admin/newHomeNew',{
				title:'首页新建新闻',
				sideTitle:'首页新建新闻',
				news:result[0]
			})
		}
	})
}

//存下评论；
exports.comment = function(req,res,next){

	var id = req.body.newsId;
	var comment = req.body.commentText;
	var userPhone = req.body.userPhone;
	var userId = req.body.userId;


	db.bind('user');
	db.user.find({'_id':ObjectId(userId)}).toArray(function(err,result){
		if(err) throw err;
		var pic = result[0].pic;
		var json = {
			'newsId': id,
			'userId': userId,
			'userPhone': userPhone,
			'userPic':pic,
			'content': comment,
			'time': moment().format('YYYY-MM-DD HH:mm:ss'),
			'zan': 0,
			'cai': 0
		}

		db.bind('comment');
		db.comment.save(json,function(){
			res.json({
				'json':'0000',
				'msg':'评论提交成功！'
			});
			db.bind('newList');
			db.newList.findAndModify({'_id':ObjectId(id)},[],{$inc:{'commentCount':1}})
		});
		
	})
}

exports.commentList = function(req,res,next){

	var id = req.body.newsId;

	db.bind('comment');
	db.comment.find({'newsId':id}).sort({'time':-1}).toArray(function(err,result){
		
		if(err) throw err
		if(result.length>0){
			res.json({
				'json':'0000',
				'data':result
			})
		}
		else{
			res.json({
				'json':'0001',
				'msg':'没有任何评论！'
			})
		}
		
	})
}

exports.zan = function(req,res,next){
	var id = req.body.commentId;

	db.bind('comment');

	db.comment.findAndModify({'_id':ObjectId(id)},[],{$inc:{zan:1}},function(err,result){
		if(result){
			res.json({
				'json':'0000',
				'msg':'点赞成功！'
			})
		}
	})
}

exports.cai = function(req,res,next){
	var id = req.body.commentId;
	db.bind('comment');
	db.comment.findAndModify({'_id':ObjectId(id)},[],{$inc:{cai:1}},function(err,result){
		if(result){
			res.json({
				'json':'0000',
				'msg':'踩成功！'
			})
		}
	})
}


exports.admin_homeNewList = function(req,res,next){
	res.render('admin/homeNewList',{
		title:'首页新闻列表',
		sideTitle:'首页新闻列表',
	})
}

//上传缩略图
exports.uploadImg = function(req,res,next){
	
	var uploadImg = req.files.uploadImg;
	//var poster = req.body.poster;

	if(uploadImg!='undefined'){ //如果有需要上传的文件  
        var tempPath=uploadImg.path; //获取上传之后的文件路径  
        fs.rename(tempPath,'./public/upload/'+uploadImg.name,function(err){  //将文件移动到你所需要的位置  
            if(err) throw err  
            next(); 
        });  
    }

}

exports.admin_newList = function(req,res,next){

	var title = req.body.title,
		uploadImg = req.files.uploadImg.name?localhost+'upload/'+req.files.uploadImg.name:req.body.poster,
		desc = req.body.desc,
		link = 'news_detail/',
		id = req.body.id,
		content = req.body.editorValue;

	var json = {
		'title':title,
		'uploadImg':uploadImg,
		'desc':desc,
		'time':moment().format('YYYY-MM-DD'),
		'link':link,
		'content':content,
		'orderTime':moment().format('YYYY-MM-DD HH:mm:ss'),
		'commentCount':0
	}

	//有id更新，没有新增；	
	if(id){
		db.bind('newList');
		db.newList.find({_id:ObjectId(id)}).toArray(function(error,result){
			if(error) throw error;
			var commentCount = result[0].commentCount
			if(commentCount>0){
				json.commentCount = commentCount;
			}

			db.newList.update({_id:ObjectId(id)},json,function(error,result){
				if(error) throw error;
			})

		})
	}
	else{
		db.bind('newList');
		db.newList.save(json,{sort:{orderTime:-1}});
	}

	res.redirect('/admin/homeNewList');
}


//新闻列表方法
exports.NewsList = function(req,res,next){

	var pageSize = req.body.pageSize*1;
	var skip = req.body.skip*1;
	var count = 0;
	var newResult;

	db.bind('newList');
	
	db.newList.find({}).sort({'orderTime':-1}).skip(skip).limit(pageSize).toArray(function(err, result) {

		db.newList.count(function(err,count){
			if (err) throw err;
			
			newResult = {"newList":result,"count":count,'pageSize':pageSize}

				if (err) throw err;

				if(newResult.newList.length>0){
					
					res.json({
						'json':'0000',
						'data':newResult
					})
				}
		})
	})
}


//首页新闻列表方法
exports.homeNewList = function(req,res,next){

	db.bind('newList');
	
	db.newList.find({}).sort({'orderTime':-1}).toArray(function(err, result) {

		if (err) throw err;

		if(result.length>0){

			result.length = 3;
			
			res.json({
				'json':'0000',
				'data':result
			})
		}
		
	})

}

exports.homeDeleteNew = function(req,res,next){

	var objectId = req.body.objectId;
	db.bind('newList');

	db.newList.find({'_id':ObjectId(objectId)}).toArray(function(err, result) {
		
		if (err) throw err;
		if(result.length>0){
			db.newList.remove({'_id':ObjectId(objectId)},function(){
				res.json({
					json:'0000',
					msg:'删除成功'
				})
			})
		}
	})
}

