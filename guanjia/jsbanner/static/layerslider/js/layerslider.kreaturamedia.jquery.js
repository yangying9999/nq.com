(function (a) {
    a.fn.layerSlider = function (b) {
        if ((typeof b).match("object|undefined")) {
            return this.each(function (c) {
                new a.layerSlider(this, b)
            })
        } else {
            return this.each(function (c) {
                var d = a(this).data("LayerSlider");
                if (d) {
                    if (!d.g.isAnimating) {
                        if (typeof b == "number") {
                            if (b > 0 && b < d.g.layersNum + 1 && b != d.g.curLayerIndex) {
                                d.change(b)
                            }
                        } else {
                            switch (b) {
                            case "prev":
                                d.prev();
                                break;
                            case "next":
                                d.next();
                                break;
                            case "start":
                                if (!d.g.autoSlideshow) {
                                    d.start()
                                }
                                break
                            }
                        }
                    }
                    if (d.g.autoSlideshow && b == "stop") {
                        d.stop()
                    }
                }
            })
        }
    };
    a.layerSlider = function (b, c) {
        var d = this;
        d.e = a(b).addClass("ls-container");
        d.e.data("LayerSlider", d);
        d.init = function () {
            d.o = a.extend({}, a.layerSlider.options, c);
            d.g = a.extend({}, a.layerSlider.global);
            a(b).find('.ls-layer, *[class^="ls-s"]').each(function () {
                if (a(this).attr("style")) {
                    var b = a(this).attr("style").toLowerCase().split(";");
                    for (x = 0; x < b.length; x++) {
                        param = b[x].split(":");
                        if (param[0].indexOf("easing") != -1) {
                            param[1] = d.ieEasing(param[1])
                        }
                        a(this).data(a.trim(param[0]), a.trim(param[1]))
                    }
                }
            });
            d.g.layersNum = a(b).find(".ls-layer").length;
            d.o.firstLayer = d.o.firstLayer < d.g.layersNum + 1 ? d.o.firstLayer : 1;
            d.o.firstLayer = d.o.firstLayer < 1 ? 1 : d.o.firstLayer;
            d.g.curLayerIndex = d.o.firstLayer;
            d.g.curLayer = a(b).find(".ls-layer:eq(" + (d.g.curLayerIndex - 1) + ")");
            d.g.sliderWidth = a(b).width();
            d.g.sliderHeight = a(b).height();
            a(b).find(".ls-layer").wrapAll('<div class="ls-inner"></div>');
            if (a(b).css("position") == "static") {
                a(b).css("position", "relative")
            }
            a(b).find(".ls-inner, .ls-layer").css({
                width: d.g.sliderWidth,
                height: d.g.sliderHeight,
                overflow: "hidden"
            });
            a(b).find(".ls-inner").css({
                position: "relative"
            });
            a(b).find(".ls-layer").css({
                position: "absolute"
            });
            a(b).find(".ls-bg").css({
                marginLeft: -(d.g.sliderWidth / 2) + "px",
                marginTop: -(d.g.sliderHeight / 2) + "px"
            });
            if (d.o.navPrevNext) {
                a('<a class="ls-nav-prev" href="#" />').click(function (c) {
                    c.preventDefault();
                    a(b).layerSlider("prev")
                }).appendTo(a(b));
                a('<a class="ls-nav-next" href="#" />').click(function (c) {
                    c.preventDefault();
                    a(b).layerSlider("next")
                }).appendTo(a(b))
            }
            if (d.o.navStartStop || d.o.navButtons) {
                a('<div class="ls-bottom-nav-wrapper" />').appendTo(a(b));
                if (d.o.navButtons) {
                    a('<span class="ls-bottom-slidebuttons" />').appendTo(a(b).find(".ls-bottom-nav-wrapper"));
                    for (x = 1; x < d.g.layersNum + 1; x++) {
                        a('<a href="#"></a>').appendTo(a(b).find(".ls-bottom-slidebuttons")).click(function (c) {
                            c.preventDefault();
                            a(b).layerSlider(a(this).index() + 1)
                        })
                    }
                    a(b).find(".ls-bottom-slidebuttons a:eq(" + (d.o.firstLayer - 1) + ")").addClass("ls-nav-active")
                }
                if (d.o.navStartStop) {
                    a('<a class="ls-nav-start" href="#" />').click(function (c) {
                        c.preventDefault();
                        a(b).layerSlider("start")
                    }).prependTo(a(b).find(".ls-bottom-nav-wrapper"));
                    a('<a class="ls-nav-stop" href="#" />').click(function (c) {
                        c.preventDefault();
                        a(b).layerSlider("stop")
                    }).appendTo(a(b).find(".ls-bottom-nav-wrapper"))
                } else {
                    a('<span class="ls-nav-sides ls-nav-sideleft" />').prependTo(a(b).find(".ls-bottom-nav-wrapper"));
                    a('<span class="ls-nav-sides ls-nav-sideright" />').appendTo(a(b).find(".ls-bottom-nav-wrapper"))
                }
            }
            if (d.o.keybNav) {
                a("body").bind("keydown", function (a) {
                    if (!d.g.isAnimating) {
                        if (a.which == 37) {
                            d.prev()
                        } else if (a.which == 39) {
                            d.next()
                        }
                    }
                })
            }
            a(b).addClass("ls-" + d.o.skin);
            var e = d.o.skinsPath + d.o.skin + "/skin.css";
            if (document.createStyleSheet) {
                document.createStyleSheet(e)
            } else {
                a('<link rel="stylesheet" href="' + e + '" type="text/css" />').appendTo(a("head"))
            }
            d.imgPreload(d.g.curLayer, function () {
                d.g.curLayer.fadeIn(1e3).addClass("ls-active");
                if (d.o.autoStart) {
                    d.start()
                }
            })
        };
        d.start = function () {
            if (d.g.autoSlideshow) {
                if (d.g.prevNext == "prev" && d.o.twoWaySlideshow) {
                    d.prev()
                } else {
                    d.next()
                }
            } else {
                d.g.autoSlideshow = true;
                d.timer()
            }
        };
        d.timer = function () {
            var c = a(b).find(".ls-active").data("slidedelay") ? parseInt(a(b).find(".ls-active").data("slidedelay")) : d.o.slideDelay;
            clearTimeout(d.g.slideTimer);
            d.g.slideTimer = window.setTimeout(function () {
                d.start()
            }, c)
        };
        d.stop = function () {
            clearTimeout(d.g.slideTimer);
            d.g.autoSlideshow = false
        };
        d.ieEasing = function (a) {
            return a.replace("in", "In").replace("out", "Out").replace("quad", "Quad").replace("quart", "Quart").replace("cubic", "Cubic").replace("quint", "Quint").replace("sine", "Sine").replace("expo", "Expo").replace("circ", "Circ").replace("elastic", "Elastic").replace("back", "Back").replace("bounce", "Bounce")
        };
        d.prev = function () {
            var a = d.g.curLayerIndex < 2 ? d.g.layersNum : d.g.curLayerIndex - 1;
            d.g.prevNext = "prev";
            d.change(a)
        };
        d.next = function () {
            var a = d.g.curLayerIndex < d.g.layersNum ? d.g.curLayerIndex + 1 : 1;
            d.g.prevNext = "next";
            d.change(a)
        };
        d.change = function (c) {
            clearTimeout(d.g.slideTimer);
            d.g.nextLayerIndex = c;
            d.g.nextLayer = a(b).find(".ls-layer:eq(" + (d.g.nextLayerIndex - 1) + ")");
            d.imgPreload(d.g.nextLayer, function () {
                d.animate()
            })
        };
        d.imgPreload = function (b, c) {
            if (d.o.imgPreload) {
                var e = [];
                var f = 0;
                b.find("img").each(function () {
                    e.push(a(this).attr("src"))
                });
                b.find("*").each(function () {
                    if (a(this).css("background-image") != "none") {
                        var b = a(this).css("background-image");
                        b = b.match(/url\((.*)\)/)[1].replace(/"/gi, "");
                        e.push(b)
                    }
                });
                for (x = 0; x < e.length; x++) {
                    a("<img>").load(function () {
                        if (++f == e.length) {
                            c()
                        }
                    }).attr("src", e[x])
                }
            } else {
                c()
            }
        };
        d.animate = function () {
            d.g.isAnimating = true;
            var c = curLayerRight = curLayerTop = curLayerBottom = nextLayerLeft = nextLayerRight = nextLayerTop = nextLayerBottom = layerMarginLeft = layerMarginRight = layerMarginTop = layerMarginBottom = "auto";
            var e = nextLayerWidth = d.g.sliderWidth;
            var f = nextLayerHeight = d.g.sliderHeight;
            var g = d.g.prevNext == "prev" ? d.g.curLayer : d.g.nextLayer;
            var h = g.data("slidedirection") ? g.data("slidedirection") : d.o.slideDirection;
            var i = d.g.slideDirections[d.g.prevNext][h];
            if (i == "left" || i == "right") {
                e = curLayerTop = nextLayerWidth = nextLayerTop = 0;
                layerMarginTop = 0
            }
            if (i == "top" || i == "bottom") {
                f = c = nextLayerHeight = nextLayerLeft = 0;
                layerMarginLeft = 0
            }
            switch (i) {
            case "left":
                curLayerRight = nextLayerLeft = 0;
                layerMarginLeft = -d.g.sliderWidth;
                break;
            case "right":
                c = nextLayerRight = 0;
                layerMarginLeft = d.g.sliderWidth;
                break;
            case "top":
                curLayerBottom = nextLayerTop = 0;
                layerMarginTop = -d.g.sliderHeight;
                break;
            case "bottom":
                curLayerTop = nextLayerBottom = 0;
                layerMarginTop = d.g.sliderHeight;
                break
            }
            d.g.curLayer.css({
                left: c,
                right: curLayerRight,
                top: curLayerTop,
                bottom: curLayerBottom
            });
            d.g.nextLayer.css({
                width: nextLayerWidth,
                height: nextLayerHeight,
                left: nextLayerLeft,
                right: nextLayerRight,
                top: nextLayerTop,
                bottom: nextLayerBottom,
                display: "block"
            });
            var j = d.g.nextLayer.data("delayin") ? parseInt(d.g.nextLayer.data("delayin")) : d.o.delayIn;
            var k = d.g.nextLayer.data("durationin") ? parseInt(d.g.nextLayer.data("durationin")) : d.o.durationIn;
            var l = d.g.nextLayer.data("easingin") ? d.g.nextLayer.data("easingin") : d.o.easingIn;
            d.g.nextLayer.delay(j).animate({
                width: d.g.sliderWidth,
                height: d.g.sliderHeight
            }, k, l);
            d.g.nextLayer.find(' > *[class^="ls-s"]').each(function () {
                var b = d.g.nextLayer.data("parallaxin") ? parseInt(d.g.nextLayer.data("parallaxin")) : d.o.parallaxIn;
                var c = parseInt(a(this).attr("class").split("ls-s")[1]) * b;
                a(this).css({
                    marginLeft: layerMarginLeft * c,
                    marginTop: layerMarginTop * c
                });
                var e = a(this).data("delayin") ? parseInt(a(this).data("delayin")) : d.o.delayIn;
                var f = a(this).data("durationin") ? parseInt(a(this).data("durationin")) : d.o.durationIn;
                var g = a(this).data("easingin") ? a(this).data("easingin") : d.o.easingIn;
                a(this).stop().delay(e).animate({
                    marginLeft: 0,
                    marginTop: 0
                }, f, g)
            });
            d.g.curLayer.find(' > *[class^="ls-s"]').each(function () {
                var b = d.g.curLayer.data("parallaxout") ? parseInt(d.g.curLayer.data("parallaxout")) : d.o.parallaxOut;
                var c = parseInt(a(this).attr("class").split("ls-s")[1]) * b;
                var e = a(this).data("delayout") ? parseInt(a(this).data("delayout")) : d.o.delayOut;
                var f = a(this).data("durationout") ? parseInt(a(this).data("durationout")) : d.o.durationOut;
                var g = a(this).data("easingout") ? a(this).data("easingout") : d.o.easingOut;
                a(this).stop().delay(e).animate({
                    marginLeft: -layerMarginLeft * c,
                    marginTop: -layerMarginTop * c
                }, f, g)
            });
            var m = a(this).data("delayout") ? parseInt(a(this).data("delayout")) : d.o.delayOut;
            var n = a(this).data("durationout") ? parseInt(a(this).data("durationout")) : d.o.durationOut;
            var o = a(this).data("easingout") ? a(this).data("easingout") : d.o.easingOut;
            d.g.curLayer.delay(m).animate({
                width: e,
                height: f
            }, n, o, function () {
                d.g.curLayer = d.g.nextLayer;
                d.g.curLayerIndex = d.g.nextLayerIndex;
                a(b).find(".ls-layer").removeClass("ls-active");
                a(b).find(".ls-layer:eq(" + (d.g.curLayerIndex - 1) + ")").addClass("ls-active");
                a(b).find(".ls-bottom-slidebuttons a").removeClass("ls-nav-active");
                a(b).find(".ls-bottom-slidebuttons a:eq(" + (d.g.curLayerIndex - 1) + ")").addClass("ls-nav-active");
                d.g.isAnimating = false;
                if (d.g.autoSlideshow) {
                    d.timer()
                }
            })
        };
        d.init()
    };
    a.layerSlider.options = {
        autoStart: true,
        firstLayer: 1,
        twoWaySlideshow: false,
        keybNav: true,
        imgPreload: true,
        navPrevNext: true,
        navStartStop: true,
        navButtons: true,
        skin: "defaultskin",
        skinsPath: "/layerslider/skins/",
        slideDirection: "right",
        slideDelay: 4e3,
        parallaxIn: .45,
        parallaxOut: .45,
        durationIn: 1500,
        durationOut: 1500,
        easingIn: "easeInOutQuint",
        easingOut: "easeInOutQuint",
        delayIn: 0,
        delayOut: 0
    };
    a.layerSlider.global = {
        version: "1.0.20111126",
        autoSlideshow: false,
        isAnimating: false,
        layersNum: null,
        prevNext: "next",
        slideTimer: null,
        sliderWidth: null,
        sliderHeight: null,
        slideDirections: {
            prev: {
                left: "right",
                right: "left",
                top: "bottom",
                bottom: "top"
            },
            next: {
                left: "left",
                right: "right",
                top: "top",
                bottom: "bottom"
            }
        }
    }
})(jQuery)