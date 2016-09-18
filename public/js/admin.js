$(".login").css({
	'height':$(window).height()
})

jQuery.metadata.setType("attr", "validate"); 

jQuery("#adminForm").validate({
     onfocusout: function(element) {
        jQuery(element).valid();
    },
    rules:{
        userName:{
            required:true,
            username:true
        },
        passWord:{
        	required:true,
        	passwordNum:true
        }
    },
    messages:{
        userName:{
            required:"请输入您的账号!",
        },
        passWord:{
        	required:'请输入密码'
        }
    },
    errorPlacement: function (error, element) {
        jQuery(element).next("em").html(error)
    }
});

$("#adminForm a").click(function(){
	if(jQuery("#adminForm").valid()){

		$.ajax({
            url: '/adminUser/login',
            type: 'POST',
            dataType: 'json',
            data: {
                username:$('#userName').val(),
                password:$('#passWord').val()
            }
        })
        .done(function(data) {
           if(data.json==='0000'){
                window.location.href = '/admin/homeBannerList'
            }
            if(data.json==='0002'){
                $("#userName").val('');
                $("#passWord").val('');
                $("#passWord").next('em').html(data.msg)
            }
            if(data.json==='0001'){
                $("#userName").val('');
                $("#phoneNum").next('em').html(data.msg)
            }
        })
        
	}
});

