;(function(jQuery) {
    //滚动切换；
    jQuery.fn.slider = function(options) {
        var defaults = { //默认设置
            "initWidth": 600, //初始宽度
            "initHeight": 450, //初始高度
            "autoPlay": false, //是否自动播放
            "loop": true, //是否循环；
            "intervalTime": 2500, //切换的时间间隔 
            "speed": 600, //切换速度;
            "showSidebar": true //显示底部导航；
        }

        var opts = jQuery.extend(defaults, options);
        this.each(function() {

            var thisObj = jQuery(this);
            var thisUl = thisObj.find("ul");
            var thisLi = thisUl.find("li");
            var thisNav = thisObj.find("div");
            var thisLenght = thisLi.length;
            var prev = thisObj.find("a.prev");
            var next = thisObj.find("a.next");
            var num = 0;
            var navNum = 0;
            var timer = null;
            var str = "";
            var onOff = true;

            var thisWidth = defaults["initWidth"];
            var thisHeight = defaults["initHeight"];
            var autoPlay = defaults["autoPlay"];
            var intervalTime = defaults["intervalTime"];
            var speed = defaults["speed"];
            var showSidebar = defaults["showSidebar"];
            var loop = defaults["loop"];

            thisObj.css({
                "width": thisWidth,
                "height": thisHeight
            });
            thisUl.css("width", thisWidth * thisLenght);

            next.click(function() {
                toNext();
            });

            prev.click(function() {
                toPrev();
            });

            if (autoPlay && loop) {
                autoRun();
            }

            if (showSidebar) {
                thisNav.show();
                for (var i = 0; i < thisLenght; i++) {
                    str += "<a href='javascript:;'></a>"
                }
                thisNav.html(str);
                var thisMenu = thisNav.find("a");
                thisMenu.eq(0).addClass("active");
                navClick();
            } else {
                thisNav.hide();
            }

            function navClick() { //导航点击；
                thisMenu.index();
                thisMenu.click(function() {
                    jQuery(this).addClass("active").siblings().removeClass("active");
                    var index = $(this).index();
                    thisUl.animate({
                        "left": -index * thisWidth
                    }, speed, "swing");
                    num = index;
                    navNum = index;
                })
            }

            function toNext() { //下一页;

                if (!onOff) return;
                onOff = false;

                if (num >= thisLenght - 1) {
                    if (loop) {
                        thisLi.eq(0).css({
                            "position": "relative",
                            "left": thisLenght * thisWidth
                        });
                    } else {
                        num = thisLenght - 2
                    }
                }

                num++;

                thisUl.animate({
                    "left": -num * thisWidth
                }, speed, "swing", function() {
                    if (loop) {
                        if (num == thisLenght) {
                            thisLi.css({
                                "position": "static"
                            });
                            thisUl.css("left", 0)
                            num = 0;
                        }
                    }
                    onOff = true;
                });

                navNum++;
                if (navNum == thisLenght) {
                    if (loop) {
                        navNum = 0;
                    } else {
                        navNum = thisLenght - 1;
                    }
                }
                silderNav(navNum);
            }

            function toPrev() { //上一页;

                if (!onOff) return;
                onOff = false;

                num--;

                if (loop) {
                    if (num < 0) {
                        thisLi.eq(thisLenght - 1).css({
                            "position": "relative",
                            "left": -thisLenght * thisWidth
                        });
                        thisUl.animate({
                            "left": -num * thisWidth
                        }, speed, "swing", function() {
                            thisLi.css({
                                "position": "static"
                            });
                            thisUl.css({
                                "left": -(thisLenght - 1) * thisWidth
                            });
                            num = thisLenght - 1;
                            onOff = true;
                        });
                    } else {
                        thisUl.animate({
                            "left": -num * thisWidth
                        }, speed, "swing", function() {
                            onOff = true;
                        });
                    }
                } else {
                    if (num < 0) num = 0;
                    thisUl.animate({
                        "left": -num * thisWidth
                    }, speed, "swing", function() {
                        onOff = true;
                    });
                }

                navNum--;
                if (navNum < 0) {
                    if (loop) {
                        navNum = thisLenght - 1;
                    } else {
                        navNum = 0;
                    }

                }
                silderNav(navNum);
            }

            function silderNav(idx) {
                if (showSidebar) thisMenu.eq(idx).addClass("active").siblings().removeClass("active");
            }


            function autoRun() {

                clearInterval(timer);
                timer = setInterval(function() {
                    toNext();
                }, intervalTime);

                thisObj.hover(function() {
                    clearInterval(timer);
                }, function() {
                    clearInterval(timer);
                    timer = setInterval(function() {
                        toNext();
                    }, intervalTime);
                })
            }
        })

        return this;
    }

    //选项卡
    jQuery.fn.tab = function(options) {

        var defaults = {
            "method": "click", //按钮执行方式 click | mouseover
            "moveType": "animate", //normal | animate;
            "speed": 800, //运动速度；
            "intervalTime": 3000, //运动速度；
            "autoPlay": false
        }

        var opts = jQuery.extend(defaults, options);
        this.each(function() {
            var thisObj = jQuery(this);
            var tabNav = thisObj.children("div").eq(0);
            var tabNav_a = tabNav.find("a");
            var len = tabNav_a.length;
            var w = thisObj.width();
            var tabCont = thisObj.children("div").eq(1);
            var scroll = tabCont.find("div");
            var tabUl = scroll.find("ul");
            var num = 0;
            var navNum = 0;
            var timer = null;

            var method = defaults["method"];
            var moveType = defaults["moveType"];
            var speed = defaults["speed"];
            var intervalTime = defaults["intervalTime"];
            var autoPlay = defaults["autoPlay"];

            scroll.css("width", len * w);

            switch (method) {
                case "click":
                    clickType(moveType);
                    break;
                case "mouseover":
                    mouseType(moveType);
                    break;
            }

            if (autoPlay) {
                autoRun();
            }

            function clickType(moveType) {

                tabNav_a.index();
                tabNav_a.click(function() {
                    num = jQuery(this).index();
                    jQuery(this).addClass("active").siblings().removeClass("active");

                    switch (moveType) {
                        case "normal":
                            normal(num);
                            break;
                        case "animate":
                            animate(num);
                            break;
                    }

                });
            };

            function mouseType(moveType) {

                tabNav_a.index();
                tabNav_a.mouseover(function() {
                    num = jQuery(this).index();
                    jQuery(this).addClass("active").siblings().removeClass("active");

                    switch (moveType) {
                        case "normal":
                            normal(num);
                            break;
                        case "animate":
                            animate(num);
                            break;
                    }

                });
            };

            function normal(idx) {
                tabUl.eq(idx).show().siblings().hide();
            }

            function animate(idx) {
                scroll.stop(true, true).animate({
                    "left": -idx * w
                }, speed, "swing");
            }

            function autoRun() {
                timer = setInterval(function() {
                    if (num == len - 1) {
                        tabUl.eq(0).css({
                            "position": "relative",
                            "left": len * w
                        })
                    }

                    num++;
                    scroll.animate({
                        "left": -num * w
                    }, speed, "swing", function() {
                        if (num == len) {
                            tabUl.css({
                                "position": "static"
                            });
                            scroll.css({
                                "left": 0
                            });
                            num = 0;
                        }
                    });

                    navNum++;
                    if (navNum > len - 1) navNum = 0;
                    tabNav_a.eq(navNum).addClass("active").siblings().removeClass("active");


                }, intervalTime)

                thisObj.mouseover(function() {
                    clearInterval(timer)
                })

                thisObj.mouseout(function() {
                    timer = setInterval(function() {
                        num++;
                        if (num > len - 1) num = 0;
                        tabNav_a.eq(num).addClass("active").siblings().removeClass("active");
                        scroll.animate({
                            "left": -num * w
                        }, speed, "swing");
                    }, intervalTime)
                })
            }

        })

        return this;
    };

    //无缝滚动；
    jQuery.fn.InfiScroll = function(options) {
        var defaults = {
            "initNum": 3,
            "speed": 500,
            "inervalTime": 1000,
            "hoverStop":true
        }

        var options = jQuery.extend(defaults, options);
        this.each(function() {

            var thisObj = jQuery(this);
            var thisUl = thisObj.find("ul");
            var thisLi = thisUl.find("li");
            var boundary = thisLi.length;
            var h = thisLi.height();
            var str = "";
            var num = 0;
            var timer = null;

            var initNum = defaults["initNum"];
            var inervalTime = defaults["inervalTime"];
            var hoverStop = defaults["hoverStop"];
            var speed = defaults["speed"];

            if (boundary > initNum) {

                str = thisUl.html();
                thisUl.html(str + str);
                thisLen = thisUl.find("li").length;
                doSroll();

                if(hoverStop){
                    hoverFn();
                }

            }

            function doSroll(){
                clearInterval(timer);
                timer = setInterval(function() {
                    num++;
                    thisUl.animate({"top":-num*h},speed,function(){
                        if(num>=thisLen/2){
                            thisUl.css({"top":0});
                            num = 0;
                        }
                    })
                }, inervalTime)
            }

            function hoverFn(){
                thisObj.hover(function(){
                    clearInterval(timer);
                },function(){
                    doSroll();
                })
            }

        })

        return this;
    };



})(jQuery)