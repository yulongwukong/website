$(function(){

	jQuery.metadata.setType("attr", "validate"); 

	jQuery("#contactForm").validate({
	     onfocusout: function(element) {
	        jQuery(element).valid();
	    },
	    rules:{
	        userName:{
	            required:true
	        },
	        passWord:{
	        	required:true,
	        	passwordNum:true
	        }
	    },
	    messages:{
	        userName:{
	            required:"请输入你的账号!",
	        },
	        passWord:{
	        	required:'请输入密码'
	        }
	    },
	    errorPlacement: function (error, element) {
	        jQuery(element).next("em").html(error)
	    }
	}); 

	$(".form a.submit").click(function(){

		if(jQuery("#contactForm").valid()){

			$.ajax({
				url: '/api/user/login',
				type: 'POST',
				dataType: 'json',
				data: {
					userName:$("#userName").val(),
					passWord:$("#passWord").val()
				}
			})
			.done(function(data){
				if(data.json=='0000'){
					window.location.href = getUrlParam('url')||'/'
				}
				if(data.json=='0002'){
					$("#userName").val('');
					$("#passWord").val('');
					$("#passWord").next('em').html(data.msg)
				}
				if(data.json=='0001'){
					$("#userName").val('');
					$("#userName").next('em').html(data.msg)
				}
			})
			
		}
	});
})