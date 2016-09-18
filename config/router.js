var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var Index = require('../app/controller/index.js');
var About = require('../app/controller/about.js');
var News = require('../app/controller/news.js');
var Feature = require('../app/controller/feature.js');
var Contact = require('../app/controller/contact.js');
var User = require('../app/controller/user.js');

var Admin = require('../app/controller/admin.js');

router.route('*').all(function(req,res,next){
	
	if (req.session.userName) {
		req.session.userName = req.session.userName;
		res.locals.userName = req.session.userName
	};

	if (req.session.mailCode) {
		req.session.mailCode = req.session.mailCode;
		res.locals.mailCode = req.session.mailCode
	};

	if (req.session.phoneCode) {
		req.session.phoneCode = req.session.phoneCode;
		res.locals.phoneCode = req.session.phoneCode
	};

	if (req.session.checkcode) {
		req.session.checkcode = req.session.checkcode;
		res.locals.checkcode = req.session.checkcode
	};

	if (req.session.userId) {
		req.session.userId = req.session.userId;
		res.locals.userId = req.session.userId
	};

	if (req.session.admin) {
		req.session.admin = req.session.admin;
		res.locals.admin = req.session.admin
	}

	next();

})

router.route('/').all(Index.index)

router.route('/about').get(About.about)

router.route('/news').get(News.news)
router.route('/news_detail/:id').get(News.news_detail);

router.route('/feature').get(Feature.feature)

router.route('/contact').get(Contact.contact)

router.route('/register').get(User.register);

router.route('/setNickname').get(User.setNickname)

router.route('/login').get(User.login);

router.route('/forget').get(User.forget)

router.route('/loginout').get(User.loginout)
router.route('/center').get(User.requireLogin,User.center)
//注册服务
router.route('/api/phone/register').post(User.phoneRegister);
router.route('/api/mail/register').post(User.mailRegister);
router.route('/api/register/sendMail').post(User.register_sendMail);

router.route('/api/user/sendMsg').post(User.sendMsg);
router.route('/api/phone/nickname').post(User.phone_nickname);
router.route('/api/mail/nickname').post(User.mail_nickname);

router.route('/api/user/login').post(User.userLogin);

router.route('/api/getUser').get(User.getUser);
router.route('/api/uploadPic').post(multipartMiddleware,User.uploadPic);
router.route('/api/deleteUser').get(User.deleteUser);

router.route('/api/getCode').get(User.getCode);
router.route('/api/checkCode').post(User.checkCode);

router.route('/api/forget/sendMail').post(User.forget_sendMail);
router.route('/api/forget/sendMsg').post(User.forget_sendMsg);

router.route('/api/checkCode/mail').post(User.checkMailcode);
router.route('/api/checkCode/phone').post(User.checkPhonecode);

router.route('/adminUser/login').post(Admin.adminUserLogin);
router.route('/admin/home/newHomeNew').post(multipartMiddleware, News.uploadImg,News.admin_newList);
router.route('/admin/userList').get(Admin.adminUserList);
router.route('/api/admin/userList').post(Admin.userList);
router.route('/api/admin/deleteUser').post(Admin.deleteUser);

//提交评论和点赞
router.route('/api/comment').post(News.comment);
router.route('/api/commentList').post(News.commentList);
router.route('/api/zan').post(News.zan);
router.route('/api/cai').post(News.cai);
//首页新闻输出接口
router.route('/api/home/homeNewList').get(News.homeNewList);
router.route('/api/news/NewsList').post(News.NewsList);

router.route('/api/admin/deleteNew').post(News.homeDeleteNew)

//后台管理
router.route('/admin/homeBannerNew').get(Index.adminIndex);
router.route('/admin/login').get(Admin.adminLogin);
router.route('/admin/loginout').get(Admin.adminLoginout);


router.route('/admin/newHomeNew').get(Admin.requireAdminLogin, News.newHomeNew);
router.route('/admin/homeNewList').get(Admin.requireAdminLogin, News.admin_homeNewList);
router.route('/admin/homeNewUpdate/:id').get(Admin.requireAdminLogin, News.homeNewUpdate);
router.route('/admin/commentList/:id').get(Admin.requireAdminLogin,News.adminCommentList);
router.route('/api/admin/commentList').post(News.api_commentList);
router.route('/api/admin/deleteComment').post(News.deleteComment);

//banner图上传
router.route("/admin/home/banner").post(multipartMiddleware, Index.uploadImg, Index.newHomeBanner);
router.route('/admin/homeBannerList').get(Admin.requireAdminLogin, Index.homeBannerList);
//首页banner输出接口
router.route('/api/home/bannerList').get(Index.getHomeBannerList);
router.route('/api/admin/deleteBanner').post(Index.homeDeleteBanner);
router.route('/admin/homeBannerUpdate/:id').get(Admin.requireAdminLogin, Index.homeBannerUpdate);


module.exports = router