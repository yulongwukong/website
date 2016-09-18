var pageSize = 5;
var skip = getUrlParam("page")?(getUrlParam("page")-1)*pageSize:0;
var count;

var vm = new Vue({
	el:'#newList',
	data:{
		newList:[],
		pageCount:0
	},
	ready:function(){
		$.ajax({
			url: '/api/admin/userList',
			type: 'post',
			dataType: 'json',
			data:{
				'pageSize':pageSize,
				'skip':skip
			}
		})
		.done(function(data) {
			if(data.json=='0000'){
				vm.newList = data.data.userList;
				count = data.data.count;

				if(count>pageSize){
					$(".page").show();
					vm.pageCount = Math.ceil(count/pageSize);
				}
				else{
					$(".page").hide();
				}

				vm.page();
			}
			vm.alertBox();
		})
	},
	methods:{
		alertBox:function(){
			this.$nextTick(function(){
				$(".homeNewList").delegate('a', 'click', function(event) {

					var _this = $(this);

					if($(this).html()=='删除'){

						$(".alertBox").fadeIn(200);

						$(".box span a").eq(1).unbind('click').bind('click',function(){
							$.ajax({
								url: '/api/admin/deleteUser',
								type: 'post',
								dataType: 'json',
								data: {
									'objectId': _this.attr('uid-id')
								}
							})
							.done(function(data) {
								if(data.json=='0000'){
									$(".alertBox").fadeOut(200);
									window.location.reload(true)
								}
							})
						})

					}
				});
			})
		},

		page:function(){
			this.$nextTick(function(){

				var curIndex = getUrlParam('page')||1;

				$(".page span a").eq(curIndex-1).addClass('active');

				if(curIndex==1){
					$(".page .prev").attr('href','?page=1')
				}
				else{
					$(".page .prev").attr('href','?page='+(curIndex-1))
				};

				if(curIndex==Math.ceil(count/pageSize)){
					$(".page .next").attr('href','?page='+Math.ceil(count/pageSize))
				}
				else{
					$(".page .next").attr('href','?page='+(curIndex*1+1))
				}
				
			})
		}

	}
});

function getUrlParam(name){
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substring(1).match(reg); //匹配目标参数
    if (r != null) return unescape(r[2]);
    return ''; //返回参数值
}