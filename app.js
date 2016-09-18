var path = require('path');
var fs = require('fs');
var express = require('express');
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser');
var logger = require('morgan');
var router = require('./config/router.js');
var mongoskin = require('mongoskin');
var config = require('./config.json');
var multiparty = require('multiparty');
var ueditor = require('ueditor');

var session = require('express-session');
var cookieParser = require('cookie-parser');
var MongoStore = require('connect-mongo')(session);

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var hour = 3600000;

var userName = config.username,
	passWord = config.password,
	dbName = config.dbname,
	port = config.port,
	host = config.host;

var dbUrl = 'mongodb://'+host+':'+port+'/'+dbName

var db = mongoskin.db(dbUrl,{native_parser:true});

var app = express();


app.set('port', process.env.PORT || 4000);

app.set('views', path.join(__dirname, './app/view'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname,'public'))); //声明静态资源地址

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//ueditor
app.use("/ueditor/ue", ueditor(path.join(__dirname, 'public'), function (req, res, next) {

    // ueditor 客户发起上传图片请求
    if (req.query.action === 'uploadimage') {
        var foo = req.ueditor;
        var date = new Date();
        var imgname = req.ueditor.filename;

        var img_url = '/upload';
        res.ue_up(img_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
    }

    //  客户端发起图片列表请求
    else if (req.query.action === 'listimage') {
        var dir_url = '/upload';
        res.ue_list(dir_url);  // 客户端会列出 dir_url 目录下的所有图片
    }

    // 客户端发起其它请求
    else {

        res.setHeader('Content-Type', 'application/json');
        res.redirect('/ueditor/nodejs/config.json')
    }

}));

app.use(multipart({
    uploadDir: './public/upload/',
    keepExtensions: true
})); //设置上传文件存放的地址。

app.use(cookieParser());
app.use(session({
    secret: 'user',
    cookie: {maxAge: hour*24},
    //expires:new Date(Date.now() + hour*24),
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ 
        url:dbUrl,
        collection:'sessions'
    })
}));

app.use(function(req, res, next){
    
    res.locals.userName = req.session.userName;
    res.locals.userId = req.session.userId;
    res.locals.admin = req.session.admin;
    
    next();
});

app.use(router);

if (app.get('env') =='development') {
    //app.use(express.errorHandler());
 	app.set('showStackError',true);
	app.use(logger(':method :url :status'));
	app.locals.pretty = true;
}

var server = app.listen(app.get('port'),function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log('服务器开启了：'+host+app.get('port') );
});

module.exports = app;
