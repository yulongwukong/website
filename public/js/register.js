$(function(){
	var timer = null;
	var isSubmit = false;
	var type = 'phone';

	$(".register_header a").click(function() {
		var index = $(this).index();
		type = $(this).attr('type');
		
		$(this).addClass('current').siblings().removeClass('current');
		$('#registerForm div').eq(index).show().siblings('.item').hide()
	});


	jQuery.metadata.setType("attr", "validate");

	jQuery("#registerForm").validate({
	     onfocusout: function(element) {
	        jQuery(element).valid();
	    },
	    rules:{
	        userPhone:{
	            required:true,
	            isMobile:true
	        },
	        userMail:{
	            required:true,
	            mail:true
	        },
	        code:{
	        	required:true,
	            numCode:true
	        },
	        picCode:{
	        	required:true,
	            numCode:true
	        },
	        mailCode:{
	        	required:true,
	            numCheck:true
	        },
	        phoneCode:{
	        	required:true,
	            numCheck:true
	        },
	        passWord:{
	        	required:true,
	        	passwordNum:true
	        },
	        passWord2:{
	        	required:true,
	        	passwordNum:true,
	        	equalTo:'#passWord'
	        }
	    },
	    messages:{
	        userPhone:{
	            required:"请输入你的手机号码!",
	        },
	        userMail:{
	            required:"请输入你的邮箱!",
	        },
	        code:{
	            required:"请输入图片验证码!",
	        },
	        picCode:{
	            required:"请输入图片验证码!",
	        },
	        mailCode:{
	            required:"请输入邮箱验证码!",
	        },
	        phoneCode:{
	        	required:"请输入手机短信验证码!",
	        },
	        passWord:{
	        	required:'请输入密码'
	        },
	        passWord2:{
	        	required:'请输入确认密码'
	        }
	    },
	    errorPlacement: function (error, element) {
	        jQuery(element).next("em").html(error)
	    }
	});

	$(".codeImg").attr('src','/api/getCode?width=90&height=30')

	$(".refresh").click(function(event) {
		$(this).addClass('rotate');
		var _this = $(this);
		clearInterval(timer);
		timer = setTimeout(function(){
			var random = Math.random();
			$(".codeImg").attr('src','/api/getCode?width=90&height=30?'+random);
			_this.removeClass('rotate');
		}, 400);
	});

	function countDown(el,countNum){
		var count = countNum;
		//el.html(count);
		el.attr('disabled','disabled');
		clearInterval(timer);
		timer = setInterval(function(){
			count--;
			el.html(count+'秒后重发');
			if(count==0){
				clearInterval(timer);
				count=countNum;
				el.html('重发验证码');
				el.removeAttr('disabled');
			}
		},1000)
	};

	$(".phoneMsg").click(function(){

		var _this = $(this);
		var validate = '';
		var jsondata = type=='phone'?$("#code").val():$("#picCode").val()

		if(type=='phone'){
			validate = 
				$("#registerForm").validate().element($("#userPhone"))&&
				$("#registerForm").validate().element($("#code"))
		}
		else if(type=='mail'){
			validate = 
				$("#registerForm").validate().element($("#userMail"))&&
				$("#registerForm").validate().element($("#picCode"))
		}

		if( validate ){
			$.ajax({
				url: '/api/checkCode',
				type: 'POST',
				dataType: 'json',
				data: {
					code:jsondata
				}
			})
			.done(function(result) {

				if(result.json=='0000'){

					if(type=='phone'){
						$.ajax({
							url: '/api/user/sendMsg',
							type: 'post',
							dataType: 'json',
							data: {
								userPhone: $("#userPhone").val(),
								type:type
							},
							beforeSend:function(){
								_this.html('正在发送')
							},
							success:function(data){
								
								if(data.json=='0000'){
									countDown(_this,60);
									isSubmit = true;
								}
								else{
									_this.html('发送验证码')
									alert(data.msg)
								}
							}
						})
					}
					else if(type=='mail'){
						$.ajax({
							url: '/api/register/sendMail',
							type: 'post',
							dataType: 'json',
							data: {
								userMail: $("#userMail").val()
							},
							beforeSend:function(){
								_this.html('正在发送')
							},
							success:function(data){
								
								if(data.json=='0000'){
									countDown(_this,60);
									isSubmit = true;
								}
								else{
									_this.html('发送验证码')
									alert(data.msg)
								}
							}
						})
					}

					
				}
				else{
					alert(result.msg);
					$("#code").val('');
					$("#picCode").val('');
				}
			})
		}

	})


	//手机注册
	$("#registerForm a.submit").click(function(){

		if($('#registerForm').valid()){
			if(isSubmit){

				if(type=='phone'){
					$.ajax({
						url: '/api/phone/register',
						type: 'POST',
						dataType: 'json',
						data: {
							userPhone: $('#userPhone').val(),
							phoneCode: $('#phoneCode').val(),
							passWord:$('#passWord').val(),
							type:type
						}
					})
					.done(function(data) {
						if(data.json=='0000'){
							window.location.href = '/setNickname?userPhone='+$('#userPhone').val()+'&type='+type;
						}
						else{
							alert(data.msg)
						}
					})
				}
				else if(type=='mail'){
					$.ajax({
						url: '/api/mail/register',
						type: 'POST',
						dataType: 'json',
						data: {
							userMail: $('#userMail').val(),
							mailCode: $('#mailCode').val(),
							passWord:$('#passWord').val(),
							type:type
						}
					})
					.done(function(data) {
						if(data.json=='0000'){
							window.location.href = '/setNickname?userMail='+$('#userMail').val()+'&type='+type;
						}
						else{
							alert(data.msg)
						}
					})	
				}

			}
		}	
	});
})