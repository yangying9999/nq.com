/*
 * Marquee v1.6
 *
 * Date: 2012 - 05 - 02
 *
 */
;
var Marquee = function() {};

Marquee.prototype = {
	init : function(option) {
		var option = option || {};
		
		this.$mrq = option.mrq || {};
		this.findName = option.findName || "_mrq";
		this.showName = option.showName || "show";
		this.cttName = option.cttName || "ctt";
		this.panelName = option.panelName || "panel";
		this.navName = option.navName || "nav";
		this.navBtnName = option.navBtnName || "btn";
		this.prevName = option.prevName || "prev";
		this.nextName = option.nextName || "next";
		this.showNum = option.showNum || 1;
		this.initId = option.initId || 0;
		this.plmin = option.plmin || 1;
		this.duration = option.duration || 600;
		this.timeout = option.timeout || 3400;
		this.ease = option.ease || this.tween.easeOutQuad;
		
		this.$show = this.$mrq.find("div[" + this.findName + " = '" + this.showName + "']");
		this.$ctt = this.$show.find("div[" + this.findName + " = '" + this.cttName + "']");
		this.$panel = this.$ctt.find("div[" + this.findName + " = '" + this.panelName + "']");
		if(this.$panel.length % this.showNum != 0) {
			for(var i = 0; i < this.showNum - this.$panel.length % this.showNum; i++) {
				$('<div ' + this.findName + '="' + this.panelName + '" class="blank"></div>').clone().appendTo(this.$ctt);
			}
		}
		this.$panel = this.$ctt.find("div[" + this.findName + " = '" + this.panelName + "']");
		this.$selected = this.$panel.eq(this.initId);
		this.resetPos();
		if(this.getRltvPos(this.$panel.eq(1), this.$panel.eq(0)).left == 0) {
			this.basePos = {
				left : 0,
				top : parseInt(this.$ctt.css("height"))
			};
		} else if(this.getRltvPos(this.$panel.eq(1), this.$panel.eq(0)).top == 0) {
			this.basePos = {
				left : parseInt(this.$ctt.css("width")),
				top : 0
			};
		}
		
		this.$nav = this.$mrq.find("div[" + this.findName + " = '" + this.navName + "']");
		this.$navBtn = this.$nav.find("a[" + this.findName + " = '" + this.navBtnName + "']");
		this.$navBtn.removeClass("cur");
		this.$navBtn.eq(this.initId).addClass("cur");
		
		this.$prev = this.$mrq.find("a[" + this.findName + " = '" + this.prevName + "']");
		this.$next = this.$mrq.find("a[" + this.findName + " = '" + this.nextName + "']");
		
		this.events();
		this.timer();
	},
	
	events : function() {
		var ctx = this;
		
		this.$ctt.bind({
			"mouseover" : function() {
				clearTimeout(ctx.outFlag);
				clearTimeout(ctx.navFlag);
				clearTimeout(ctx.timerFlag);
				ctx.timerFlag = false;
			},
			"mouseout" : function() {
				ctx.outFlag = setTimeout(function() {
					ctx.timer();
				}, 20);
			}
		});
		this.$navBtn.live({
			"mouseover" : function() {
				clearTimeout(ctx.outFlag);
				clearTimeout(ctx.navFlag);
				clearTimeout(ctx.timerFlag);
				if(ctx.$panel.index(ctx.$selected) != $(this).index()) {
					var _index = $(this).index();
					ctx.navFlag = setTimeout(function() {
						clearTimeout(ctx.moveFlag);
						ctx.move({
							obj : ctx.$ctt,
							pos : ctx.getNextPos(_index),
							duration : ctx.duration,
							ease : ctx.ease
						});
					}, 200);
				}
			},
			"mouseout" : function() {
				ctx.outFlag = setTimeout(function() {
					clearTimeout(ctx.navFlag);
					ctx.timer();
				}, 20);
			}
		});
		this.$prev.live("click", function() {
			clearTimeout(ctx.outFlag);
			clearTimeout(ctx.navFlag);
			clearTimeout(ctx.timerFlag);
			clearTimeout(ctx.moveFlag);
			ctx.move({
				obj : ctx.$ctt,
				pos : ctx.getNextPos(ctx.$panel.index(ctx.$selected) - ctx.plmin * ctx.showNum),
				duration : ctx.duration,
				ease : ctx.ease
			});
		});
		this.$next.live("click", function() {
			clearTimeout(ctx.outFlag);
			clearTimeout(ctx.navFlag);
			clearTimeout(ctx.timerFlag);
			clearTimeout(ctx.moveFlag);
			ctx.move({
				obj : ctx.$ctt,
				pos : ctx.getNextPos(ctx.$panel.index(ctx.$selected) + ctx.plmin * ctx.showNum),
				duration : ctx.duration,
				ease : ctx.ease
			});
		});
	},
	
	timer : function() {
		var ctx = this;
		
		this.timerFlag = setTimeout(function() {
			ctx.move({
				obj : ctx.$ctt,
				pos : ctx.getNextPos(ctx.$panel.index(ctx.$selected) + ctx.plmin * ctx.showNum),
				duration : ctx.duration,
				ease : ctx.ease,
				fn : function() {
					if(ctx.timerFlag) {
						clearTimeout(ctx.outFlag);
						clearTimeout(ctx.navFlag);
						clearTimeout(ctx.timerFlag);
						ctx.timer();
					}
				}
			});
		}, this.timeout);
	},
	
	move : function(option) {
		var ctx = this;
		
		var option = option || {};
		var obj = option.obj || {};
		var pos = option.pos || {};
		var duration = option.duration || this.duration;
		var ease = option.ease || this.ease;
		var fn = option.fn || this.refls;
		var ftp = 50;
		var i = 1000 / ftp;
		var delta;
		var changeLeft = pos.endLeft - pos.beginLeft;
		var changeTop = pos.endTop - pos.beginTop;
		
		this.moveFlag = setTimeout(function() {
			if(i <= duration) {
                delta = ease(i / duration);
                if(changeLeft != 0) {
            		$(obj).css("left", Math.ceil(pos.beginLeft + delta * changeLeft));
                }
                if(changeTop != 0) {
            		$(obj).css("top", Math.ceil(pos.beginTop + delta * changeTop));
                }
				i += 1000 / ftp;
				ctx.moveFlag = setTimeout(arguments.callee, 1000 / ftp);
			} else {
				clearTimeout(ctx.moveFlag);
				ctx.moveFlag = false;
				fn();
			}
		}, 1000 / ftp);
	},
	
	getRltvPos : function(obj, rltvObj) {
		return {
			left : $(obj).offset().left - $(rltvObj).offset().left,
			top : $(obj).offset().top - $(rltvObj).offset().top
		}
	},
	
	getNextPos : function(nextId) {
		var ctx = this;
		var beginLeft, beginTop,
			endLeft, endTop;
		
		if(nextId > this.$panel.length - this.showNum) {
			nextId = 0 ;
		} else if(nextId < 0) {
			nextId = this.$panel.length - this.showNum;
		}
		
		this.$panel.removeAttr("style");
		if(this.$panel.index(this.$selected) == this.$panel.length - this.showNum) {
			this.resetPos();
			if(nextId == 0) {
				for(var i = 0; i < this.showNum; i++) {
					this.$panel.eq(i).css({
						"position" : "relative",
						"left" : this.basePos.left,
						"top" : this.basePos.top
					});
				}
			}
		} else if(this.$panel.index(this.$selected) == 0) {
			this.resetPos();
			if(nextId == this.$panel.length - this.showNum) {
				for(var i = this.$panel.length - this.showNum; i < this.$panel.length; i++) {
					this.$panel.eq(i).css({
						"position" : "relative",
						"left" : - this.basePos.left,
						"top" : - this.basePos.top
					});
				}
			}
		}
		beginLeft = this.getRltvPos(this.$ctt, this.$show).left,
		beginTop = this.getRltvPos(this.$ctt, this.$show).top,
		endLeft = - this.getRltvPos(this.$panel.eq(nextId), this.$ctt).left,
		endTop = - this.getRltvPos(this.$panel.eq(nextId), this.$ctt).top
		if(beginLeft == endLeft && beginTop == endTop) {
			return false;
		}
		
		this.$selected = this.$panel.eq(nextId);
		
		this.$navBtn.removeClass("cur");
		this.$navBtn.eq(nextId).addClass("cur");
		
		return {
			beginLeft : beginLeft,
			beginTop : beginTop,
			endLeft : endLeft,
			endTop : endTop
		}
	},
	
	resetPos : function() {
		this.$ctt.css({
			"left" : - this.getRltvPos(this.$selected, this.$ctt).left,
			"top" : - this.getRltvPos(this.$selected, this.$ctt).top
		});
	},
	
	tween : {
		easeOutQuad : function(pos) {
			return - (Math.pow((pos - 1), 2) - 1);
		}
	},
	
	refls : function() {
		return false;
	}
};

var Show = function() {}

Show.prototype = $.extend({}, Marquee.prototype, {
	addE : function(option) {
		var option = option || {};
		
		this.rowName = option.rowName || "_row";
		this.maskName = option.maskName || "mask";
	
		this.$mrq.find("div[" + this.rowName + "] a")
			.append('<span ' + this.findName + '="' + this.maskName + '" class="' + this.maskName + '"></span>');
		this.$mask = this.$mrq.find("span[" + this.findName + " = '" + this.maskName + "']");
		
		this.addevents();
	},
	
	addevents : function() {
		var ctx = this;
		
		this.$ctt.unbind("mouseout");
		this.$ctt.bind("mouseout", function() {
			ctx.outFlag = setTimeout(function() {
				ctx.timer();
				ctx.mask();
			}, 20);
		});
		
		this.$navBtn.die("mouseover");
		this.$navBtn.live("mouseover", function() {
			clearTimeout(ctx.outFlag);
			clearTimeout(ctx.navFlag);
			clearTimeout(ctx.timerFlag);
			ctx.mask();
			if(ctx.$panel.index(ctx.$selected) != $(this).index()) {
				var _index = $(this).index();
				ctx.navFlag = setTimeout(function() {
					clearTimeout(ctx.moveFlag);
					ctx.move({
						obj : ctx.$ctt,
						pos : ctx.getNextPos(_index),
						duration : ctx.duration,
						ease : ctx.ease
					});
				}, 200);
			}
		});
		
		this.$mask.bind("mouseover", function() {
			ctx.mask(this);
		});
	},
	
	mask : function(obj) {
		if(obj) {
			this.$mask.stop().animate({"opacity" : "0.45"}, 200);
			$(obj).stop().animate({"opacity" : "0"}, 200);
		} else {
			this.$mask.stop().animate({"opacity" : "0"}, 200);
		}
	}
});

$(function(){
	var show = new Show();
	show.init({
		mrq : $("#marquee")
	})
	show.addE();
});