$(function(){

	jQuery.metadata.setType("attr", "validate"); 

	jQuery("#contactForm").validate({
	     onfocusout: function(element) {
	        jQuery(element).valid();
	    },
	    rules:{
	        nickname:{
	            required:true,
	            username:true
	        }
	    },
	    messages:{
	        nickname:{
	            required:"请设置一个炫酷的昵称",
	        }
	    },
	    errorPlacement: function (error, element) {
	        jQuery(element).next("em").html(error)
	    }
	}); 

	$(".form a.submit").click(function(){

		if(jQuery("#contactForm").valid()) {

			if(getUrlParam('type')=='phone'){
				$.ajax({
					url: '/api/phone/nickname',
					type: 'POST',
					dataType: 'json',
					data: {
						userPhone:getUrlParam('userPhone'),
						nickname:$("#nickname").val()
					}
				})
				.done(function(data){
					if(data.json=='0000'){
						window.location.href = '/login'
					}
					if(data.json=='0001'){
						$("#nickname").val('');
						$("#nickname").next('em').html(data.msg)
					}
				})
			}
			else if(getUrlParam('type')=='mail'){
				$.ajax({
					url: '/api/mail/nickname',
					type: 'POST',
					dataType: 'json',
					data: {
						userMail:getUrlParam('userMail'),
						nickname:$("#nickname").val()
					}
				})
				.done(function(data){
					if(data.json=='0000'){
						window.location.href = '/login'
					}
					if(data.json=='0001'){
						$("#nickname").val('');
						$("#nickname").next('em').html(data.msg)
					}
				})
			}

			
			
		}
	});
})