/*
 * Section v1.6
 *
 * Date: 2012 - 04 - 06
 *
 */
;
var Section = function() {};

Section.prototype = {
	init : function(option) {
		var option = option || {};
		var context = this;
		
		this.$menu = option.menu;
		this.$menuTop = option.menuTop;
		this.$menuBottom = option.menuBottom;
		this.$content = option.content;
		this.secName = option.secName || "_section";
		this.subSecName = option.subSecName || "_subsection";
		this.linkSecName = option.linkSecName || "_linksection";
		this.selectedName = option.selectedName || "_selected";
		this.$menuMain = $("a[" + this.secName + "]", this.$menuTop);
		this.$menuSub = $("a[" + this.subSecName + "]", this.$menuBottom);
		this.$menuLink = $("a[" + this.linkSecName + "]");
		this.$subList = $("div[" + this.secName + "]", this.$menuBottom);
		this.$section = $("div[" + this.secName + "]", this.$content);
		this.$selected = this.$section.eq(0);
		this.$clear = $('<cite class="clear"></cite>');
		this.$latPrev = $('<span id="latprev" class="latprev"></span>');
		this.$latNext = $('<span id="latnext" class="latnext"></span>');
		this.url = this.getSec(window.location.href).url;
		
		this.$content.append(this.$clear).css("width", 10500);
		this.$selected.attr(this.selectedName, this.$selected.attr(this.secName));
		$("body").append(this.$latPrev).append(this.$latNext);
		if(!this.getEndPos(this.getSec(window.location.href))) {
			this.setUrl("#" + this.$selected.attr(this.secName));
		}
		this.$section.each(function() {
			$(this).addClass("columns");
		});
		this.$menuMain.each(function() {
			$(this).attr("href", "#" + $(this).attr(context.secName));
			if($(this).attr(context.secName) == context.$selected.attr(context.secName)) {
				context.showClass(context.$menuMain, this, "cur");
			}
		});
		this.$menuSub.each(function() {
			if(context.getParent(this, context.secName)[0]) {
				$(this).attr("href", "#" + context.getParent(this, context.secName).attr(context.secName) + ":" + $(this).attr(context.subSecName));
			}
		});
		this.$menuLink.each(function() {
			$(this).attr("href", "#" + $(this).attr(context.linkSecName));
		});
		
		this.colW = this.$section.width();
		this.colWOut = this.$section.outerWidth(true);
		this.winResize();
		this.events();
		this.doIt(this.getBeginPos(), this.getEndPos(this.getSec(window.location.href)));
	},
	
	winResize : function() {
		this.winW = $(window).width();
		this.winH = $(window).height();
		this.menuH = this.$menu.height();
		var _showH = this.winH - this.menuH;
		
		this.blankW = parseInt((this.winW - this.colW) / 2);
		if(this.winW <= this.colW) {
			this.blankW = 0;
		}
		this.$content.css({
			"padding-left" : this.blankW,
			"width" : this.colWOut * this.$section.length + this.blankW * 2
		});
		
		this.latW = this.blankW - (this.colWOut - this.colW);
		if(this.latW <= 25) {
			this.latW = 25;
		}
		this.$latPrev.css({
			"width" : this.latW,
			"height" : _showH
		});
		this.$latNext.css({
			"width" : this.latW,
			"height" : _showH
		});
	},
	
	winScroll : function() {
		var $subSec = this.getNear(this.$selected, $(window).scrollTop());
		if($subSec[0]) {
			this.setUrl("#" + this.$selected.attr(this.secName) + ":" + $subSec.attr(this.subSecName));
			this.showClass(this.$menuSub, $("[" + this.subSecName + " = '" + $subSec.attr(this.subSecName) + "']", $("div[" + this.secName + " = '" + this.$selected.attr(this.secName) + "']", this.$menuBottom)), "cur");
		}
		
		if($(window).scrollTop() > this.$selected.outerHeight(true) + this.menuH - $(window).height()) {
			this.move(window, "scrolltop", $(window).scrollTop(), this.$selected.outerHeight(true) + this.menuH - $(window).height(), 600, this.eases.outCirc);
		}
	},
	
	events : function() {
		var context = this;
		this.$menuMain.bind({
			"mouseover" : function() {
				context.clearTimer(context.menuFlag);
				context.showClass(context.$menuMain, this, "hover");
				context.showSub(context.$subList, this, context.secName);
			},
			"mouseout" : function() {
				context.menuFlag = setTimeout(function() {
					context.showClass(context.$menuMain, false, "hover");
					context.showSub(context.$subList, context.$selected, context.secName);
				}, 200);
			},
			"click" : function(e) {
				e.preventDefault();
				context.doIt(context.getBeginPos(), context.getEndPos(context.getSec($(this).attr("href"))));
			}
		});
		this.$menuBottom.bind({
			"mouseover" : function() {
				context.clearTimer(context.menuFlag);
			},
			"mouseout" : function() {
				context.menuFlag = setTimeout(function() {
					context.showClass(context.$menuMain, false, "hover");
					context.showSub(context.$subList, context.$selected, context.secName);
				}, 200);
			}
		});
		this.$menuSub.bind({
			"mouseover" : function() {
				context.clearTimer(context.menuFlag);
			},
			"click" : function(e) {
				e.preventDefault();
				context.doIt(context.getBeginPos(), context.getEndPos(context.getSec($(this).attr("href"))));
			}
		});
		this.$menuLink.bind("click", function(e) {
			e.preventDefault();
			context.doIt(context.getBeginPos(), context.getEndPos(context.getSec($(this).attr("href"))));
		});
		
		this.$latPrev.bind({
			"mouseover" : function() {
				context.clearTimer(context.latFlag);
				$(this).addClass("latprev_hover");
			},
			"mouseout" : function() {
				var _this = this;
				context.latFlag = setTimeout(function() {
					$(_this).removeClass("latprev_hover");
				}, 20);
			},
			"click" : function(e) {
				e.preventDefault();
				var $sec = context.$section.eq(context.$section.index(context.$selected) - 1);
				var $subSec = context.getNear($sec, $(window).scrollTop());
				var _end = context.getEndPos({
					section : $sec.attr(context.secName),
					subsection : $subSec.attr(context.subSecName)
				});
				context.doIt(context.getBeginPos(), _end);
			}
		});
		this.$latNext.bind({
			"mouseover" : function() {
				context.clearTimer(context.latFlag);
				$(this).addClass("latnext_hover");
			},
			"mouseout" : function() {
				var _this = this;
				context.latFlag = setTimeout(function() {
					$(_this).removeClass("latnext_hover");
				}, 20);
			},
			"click" : function(e) {
				e.preventDefault();
				var $sec = context.$section.eq(context.$section.index(context.$selected) + 1);
				var $subSec = context.getNear($sec, $(window).scrollTop());
				var _end = context.getEndPos({
					section : $sec.attr(context.secName),
					subsection : $subSec.attr(context.subSecName)
				});
				context.doIt(context.getBeginPos(), _end);
			}
		});
		
		$(window).bind({
			"resize" : function(event) {
				context.winResize();
			},
			"scroll" : function(e) {
				context.clearTimer(context.scrollFlag);
				context.scrollFlag = setTimeout(function() {
					context.winScroll();
				}, 200);
			}
		});
	},

	doIt : function(begin, end) {
		if(!end) {
			return false;
		}
		this.clearTimer(this.moveFlag);
		if(end.left - this.blankW != begin.left) {
			var context = this;
			this.clearTimer(this.doFlag);
			this.move(window, "scrollleft", begin.left, end.left - this.blankW, 600, this.eases.outCirc);
			if(end.top - this.menuH != begin.top) {
				this.doFlag = setTimeout(function() {
					if(!context.moveFlag) {
						context.move(window, "scrolltop", begin.top, end.top - context.menuH, 600, context.eases.outCirc);
					} else {
						context.doFlag = setTimeout(arguments.callee, 20);
					}
				}, 600);
			}
		} else if(end.top - this.menuH != begin.top) {
			this.clearTimer(this.doFlag);
			this.move(window, "scrolltop", begin.top, end.top - this.menuH, 600, this.eases.outCirc);
		}
	},
	
	move : function(obj, direction, begin, end, duration, eases) {
		var context = this;
		var _ftp = 50;
		var _i = 1000 / _ftp;
		var _delta;
		var _change = end - begin;
		
		this.moveFlag = setTimeout(function() {
			if(_i <= duration) {
				context.clearTimer(context.scrollFlag);
                _delta = eases(_i / duration);
                switch(direction) {
                	case "scrollleft" :
                		$(obj).scrollLeft(Math.ceil(begin + _delta * _change));
                		break;
                	case "scrolltop" :
                		$(obj).scrollTop(Math.ceil(begin + _delta * _change));
                		break;
                }
				_i += 1000 / _ftp;
				context.moveFlag = setTimeout(arguments.callee, 1000 / _ftp);
			} else {
				context.clearTimer(context.moveFlag);
				context.moveFlag = false;
			}
		}, 1000 / _ftp);
	},
	
	getEndPos : function(sec) {
		if($("div[" + this.secName + " = '"+ sec.section +"']", this.$content)[0]) {
			var context = this;
			var $sec = $("div[" + this.secName + " = '"+ sec.section +"']", this.$content);
			this.$section.each(function() {
				$(this).removeAttr(context.selectedName);
			});
			this.$selected = $sec;
			$sec.attr(this.selectedName, sec.section);
			var _left = $sec.offset().left - this.$content.offset().left;
			var _top = $sec.offset().top - this.$content.offset().top;
			
			var _secUrl = "#" + sec.section;
			var _subSecUrl = "";

			var $secCur = $("[" + this.secName + " = '" + sec.section + "']", this.$menuTop);
			var	$subCur;
			if($("div[" + this.secName + " = '" + sec.section + "']", this.$menuBottom)[0]) {
				$subCur = $("[" + this.subSecName + "]", $("div[" + this.secName + " = '" + sec.section + "']", this.$menuBottom)).eq(0);
			}
			
			if(sec.subsection && $("div[" + this.subSecName + " = '"+ sec.subsection +"']", $sec)[0]) {
				var $subSec = $("div[" + this.subSecName + " = '"+ sec.subsection +"']", $sec);
				
				_top = $subSec.offset().top - this.$content.offset().top;
				
				_subSecUrl = ":" + sec.subsection;
				
				$subCur = $("[" + this.subSecName + " = '" + sec.subsection + "']", $("div[" + this.secName + " = '" + sec.section + "']", this.$menuBottom));
			}
			
			this.setUrl(_secUrl + _subSecUrl);
			this.showClass(this.$menuMain, $secCur, "cur");
			this.showClass(this.$menuSub, $subCur, "cur");
			this.showSub(this.$subList, $sec, this.secName);
			
			if(this.$section.index($sec) == 0) {
				this.$latPrev.addClass("disn");
			} else {
				this.$latPrev.removeClass("disn");
			}
			if(this.$section.index($sec) == this.$section.length - 1) {
				this.$latNext.addClass("disn");
			} else {
				this.$latNext.removeClass("disn");
			}
			return {
				left : _left,
				top : _top
			};
		} else {
			return false;
		}
	},
	
	getBeginPos : function() {
		return {
			left : $(window).scrollLeft(),
			top : $(window).scrollTop()
		}
	},
	
	getSec : function(str) {
		var _arr = str.split("#");
		var _url = this.url || _arr[0];
		
		if(!_arr[1]) {
			return {
				section : this.$selected.attr(this.secName),
				subsection : false,
				url : _url
			};
		} else {
			_arr = _arr[1].split(":");
			if(!_arr[1]) {
				return {
					section : _arr[0],
					subsection : false,
					url : _url
				};
			} else {
				return {
					section : _arr[0],
					subsection : _arr[1],
					url : _url
				};
			}
		}
	},
	
	getParent : function(obj, name) {
		if($(obj).parent().attr(name)) {
			return $(obj).parent();
		} else if($(obj).parent() != $("body")) {
			this.getParent($(obj).parent()[0]);
		} else {
			return false;
		}
	},
	
	getNear : function(obj, pos) {
		if(!$("div[" + this.subSecName + "]", obj)) {
			return false;
		} else {
			var context = this;
			var $near = $("div[" + this.subSecName + "]", obj);
			var _near;
			var _numArr = new Array();
			$near.each(function(){
				_numArr.push(Math.abs($(this).offset().top - context.$content.offset().top - context.menuH - pos));
			});
			_numArr.sort(function(a, b) {
				return a - b;
			});
			$near.each(function(){
				if(Math.abs($(this).offset().top - context.$content.offset().top - context.menuH - pos) == _numArr[0]){
					_near = this;
				}
				if(_near) {
					return false;
				}
			});
			return $(_near);
		}
	},
	
	eases : {
		outCirc : function(pos) {
			return Math.sqrt(1 - Math.pow((pos - 1), 2));
		}
	},
	
	clearTimer : function(obj) {
		clearTimeout(obj);
	},
	
	showClass : function(obj, selected, name) {
		obj.each(function() {
			$(this).removeClass(name);
			if(this == $(selected)[0]) {
				$(this).addClass(name);
			}
		});
	},
	
	showSub : function(obj, selected, name) {
		var _sub = false;
		obj.each(function() {
			$(this).addClass("disn");
			if($(this).attr(name) == $(selected).attr(name)) {
				$(this).removeClass("disn");
				_sub = true;
			}
		});
		if(_sub == true) {
			this.$menuBottom.removeClass("disn");
		} else {
			this.$menuBottom.addClass("disn");
		}
	},
	
	setUrl : function(url) {
		if(window.location.href != this.url + url) {
			window.location.href = this.url + url;
		}
	}
};

var Menu = function() {}

Menu.prototype = $.extend({}, Section.prototype, {
	
	addE : function(option) {
		var option = option || {};
		var context = this;
		
		this.$menu = option.menu;
		this.$menuTop = option.menuTop;
		this.$menuBottom = option.menuBottom;
		this.$content = option.content;
		this.secName = option.secName || "_section";
		this.subSecName = option.subSecName || "_subsection";
		this.linkSecName = option.linkSecName || "_linksection";
		this.selectedName = option.selectedName || "_selected";
		this.$menuMain = $("a[" + this.secName + "]", this.$menuTop);
		this.$menuSub = $("a[" + this.subSecName + "]", this.$menuBottom);
		this.$menuLink = $("a[" + this.linkSecName + "]");
		this.$subList = $("div[" + this.secName + "]", this.$menuBottom);
		
		this.addevents();
	},
	
	addevents : function() {
		var context = this;
		
		this.$menuMain.bind({
			"mouseover" : function() {
				context.clearTimer(context.menuFlag);
				context.showClass(context.$menuMain, this, "hover");
				context.showSub(context.$subList, this, context.secName);
			},
			"mouseout" : function() {
				context.menuFlag = setTimeout(function() {
					context.showClass(context.$menuMain, false, "hover");
					context.showSub(context.$subList, context.$selected, context.secName);
				}, 200);
			}
		});
		this.$menuBottom.bind({
			"mouseover" : function() {
				context.clearTimer(context.menuFlag);
			},
			"mouseout" : function() {
				context.menuFlag = setTimeout(function() {
					context.showClass(context.$menuMain, false, "hover");
					context.showSub(context.$subList, context.$selected, context.secName);
				}, 200);
			}
		});
		this.$menuSub.bind({
			"mouseover" : function() {
				context.clearTimer(context.menuFlag);
			}
		});
	}
});

$(function(){
	if($.browser.msie && $.browser.version == 6.0) {
		var menu = new Menu();
		menu.addE({
			menu : $("#menu"),
			menuTop : $("#menu_top"),
			menuBottom : $("#menu_bottom"),
			content : $("#content")
		});
		return false;
	}
	
	var section = new Section();
	section.init({
		menu : $("#menu"),
		menuTop : $("#menu_top"),
		menuBottom : $("#menu_bottom"),
		content : $("#content")
	});
});