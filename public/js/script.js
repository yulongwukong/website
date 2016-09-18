
function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB'];
    if (bytes == 0) return 'n/a';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
};

function checkForm(){
    if(parseInt($('#w').val())) return true;
    alert('请先选择要裁剪的区域后，再提交。')
    return false;
};

// update info by cropping (onChange and onSelect events handler)
function updateInfo(e) {
    $('#x1').val(e.x);
    $('#y1').val(e.y);
    $('#w').val(e.w);
    $('#h').val(e.h);

    var rx = $("#preview_box").width() / e.w; 
    var ry = $("#preview_box").height() / e.h;
    //通过比例值控制图片的样式与显示
    $("#crop_preview").css({
        width:Math.round(rx * $("#preview").width()) + "px",  //预览图片宽度为计算比例值与原图片宽度的乘积
        height:Math.round(rx * $("#preview").height()) + "px",    //预览图片高度为计算比例值与原图片高度的乘积
        marginLeft:"-" + Math.round(rx * e.x) + "px",
        marginTop:"-" + Math.round(ry * e.y) + "px"
    });
};

// clear info by cropping (onRelease event handler)
function clearInfo() {
    $('.info #w').val('');
    $('.info #h').val('');
};

function getMax(w,h){
    if(w>=h){
        return w;
    }
    else{
        return h
    }
}

var jcrop_api, boundx, boundy;

function fileSelectHandler() {

    // get selected file
    var oFile = $('#image_file')[0].files[0];

    var rFilter = /^(image\/jpeg|image\/png)$/i;
    if (! rFilter.test(oFile.type)) {
        alert('请选择一个有效的图像文件(JPG和PNG)');
        return;
    }

    if (oFile.size > 250 * 1024) {
        alert('您选择了太大的文件，请选择一个较小的图像文件');
        return;
    }

    // preview element
    var oImage = document.getElementById('preview');
    var crop_preview= document.getElementById('crop_preview');

    // prepare HTML5 FileReader
    var oReader = new FileReader();

        oReader.onload = function(e) {
        // e.target.result contains the DataURL which we can use as a source of the imag 
            
            oImage.src = e.target.result;
            crop_preview.src = e.target.result


            oImage.onload = function () { // onload event handler

                var level = 400;
                var imgW = this.width;
                var imgH = this.height;

                 

                if(getMax(imgW,imgH)>level){
                    imgW>imgH?this.style.width='400px':this.style.height='400px'
                }
                else{

                    console.log(this.width+'||'+this.height)

                    this.style.width=this.width+'px';
                    this.style.height=this.height+'px';
                }

                

                $(".fileImage").fadeIn();
                // display some basic image info
                var sResultFileSize = bytesToSize(oFile.size);
                $('#filesize').val(sResultFileSize);
                $('#filetype').val(oFile.type);
                $('#fileWidth').val(oImage.naturalWidth);
                $('#fileHeight').val(oImage.naturalHeight);
                
                // destroy Jcrop if it is existed
                if (typeof jcrop_api != 'undefined'){
                    jcrop_api.destroy();
                }
                    
                // initialize Jcrop
                $('#preview').Jcrop({
                    minSize: [60, 60], // min crop size
                    aspectRatio : 1, // keep aspect ratio 1:1
                    bgColor:'#fff',
                    onChange: updateInfo,
                    onSelect: updateInfo,
                    onRelease: clearInfo
                }, function(){

                    // use the Jcrop API to get the real image size
                    var bounds = this.getBounds();
                    boundx = bounds[0];
                    boundy = bounds[1];

                    // Store the Jcrop API in the jcrop_api variable
                    jcrop_api = this;

                });

            };
        };

        // read selected file as DataURL
        oReader.readAsDataURL(oFile);

}