/* PAGE.js */



	var _p = {

		g : {
			so : $.browser.webkit ? $('body') : $('html')
		},

		init : function(){

			$(window).scroll(function(){
				_p.onscroll();
			});

			$('body').setBlank();
		},
	
		onscroll : function(){

			$('.leaves').css({
				'margin-top' : - ( _p.g.so.scrollTop() / 2 ) + 'px'
			});
		}
	};

	$(document).ready(function(){

		_p.init();		
		$('#layerslider').layerSlider({
			skin : 'defaultskin',
			skinsPath : '/static/layerslider/skins/',
			durationTimeIn : 1500,
			durationTimeOut : 1500
		});
	});
