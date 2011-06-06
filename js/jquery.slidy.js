/**
 * jQuery Slidy - A Transition Plugin - http://wbotelhos.com/slidy
 * ---------------------------------------------------------------------------------
 *
 * jQuery Slidy is a plugin that generates a customizable transitions automatically.
 *
 * Licensed under The MIT License
 *
 * @version         0.2.0
 * @since           11.16.2010
 * @author          Washington Botelho dos Santos
 * @documentation   wbotelhos.com/slidy
 * @twitter         twitter.com/wbotelhos
 * @license         opensource.org/licenses/mit-license.php MIT
 * @package         jQuery Plugins
 *
 * Usage with default values:
 * ---------------------------------------------------------------------------------
 * $('#banner').slidy();
 *
 * <div id="banner">
 *   <img src="image-1.jpg"/>
 *   <img src="image-2.jpg"/>
 *   <img src="image-3.jpg"/>
 * </div>
 *
 */

;(function($) {

	$.fn.slidy = function(settings) {

		if (this.length == 0) {
			debug('Selector invalid or missing!');
			return;
		} else if (this.length > 1) {
			return this.each(function() {
				$.fn.slidy.apply($(this), [settings]);
			});
		}

		var opt			= $.extend({}, $.fn.slidy.defaults, settings),
			$this		= $(this),
			id			= this.attr('id'),
			elements	= $this.children(opt.children),
			quantity	= elements.length,
			images		= (opt.children == 'img') ? elements : elements.find('img'),
			timer		= 0,
			isAnimate	= false;

		if (id === undefined) {
			id = 'slidy-' + $this.index();
			$this.attr('id', id); 
		}

		$this
		.data('options', opt)
		.css({
			'cursor':	opt.cursor,
			'height':	opt.height + 'px',
			'overflow':	'hidden',
			'position':	'relative',
			'width':	opt.width + 'px'
		});

		elements.each(function(i) {
			$(this)
			.css({ 'position': 'absolute', 'z-index': quantity - i })
			.attr('id', $this.attr('id') + '-' + (i + 1));
		});

		images.attr({ height: opt.height, width: opt.width }).css('border', '0');

		if (opt.children == 'a' && opt.target != '') {
			elements.attr('target',	opt.target);
		}

		elements.hide().first().show();

		if (opt.menu) {
			$menu = $('<ul/>', { id: id + '-slidy-menu', 'class': 'slidy-menu' }).insertAfter($this);
		}

		var stop = function() {
			clearTimeout(timer);
		}, overBanner = function() {
			stop();
		}, overMenu = function(thiz) {
			stop();

			var $this		= $(this),
				index		= $this.index(),
				$current	= $this.parent().children('.slidy-link-selected'),
				last		= $current.index();

			if (index != last) {
				$current.removeClass('slidy-link-selected');
				$this.addClass('slidy-link-selected');

				change(last, index);
			}
		}, outBanner = function(thiz) {
			go($(thiz.target).parent('a').index());
		}, outMenu = function() {
			var $this		= $(this),
				index		= $this.index(),
				$current	= $this.parent().children('.slidy-link-selected'),
				last		= $current.index();

			go(last);
		}, clickMenu = function(thiz) {
			stop();

			var $this		= $(this),
				index		= $this.index(),
				$current	= $this.parent().children('.slidy-link-selected'),
				last		= $current.index();

			if (index != last) {
				$current.removeClass('slidy-link-selected');
				$this.addClass('slidy-link-selected');
			}

			go(index);
		};

		if (opt.menu) {
			var target	= (opt.target != '') ? 'target="' + opt.target + '"' : '',
				menu	= '',
				parent,
				img;

			images.each(function() {
				img		= $(this);
				parent	= img.parent(opt.children);

				menu += '<li><a href="' + parent.attr(parent.is('a') ? 'href' : 'title') + '" ' + target + '>' + img.attr('title') + '</a></li>';
			});

			$menu.html(menu);

			var	space	= parseInt((opt.width / quantity) + (quantity - 1)),
				diff	= opt.width - (space * quantity),
				links	= $menu.children('li');

			if (opt.action == 'mouseenter') {
				links.mouseenter(overMenu).mouseleave(outMenu);	
			} else if (opt.action == 'click') {
				links.click(clickMenu);
			} else {
				debug('action attribute must to be "click" or "mouseenter"!');
				return;
			}

			links.css('width', space)
				.first().addClass('slidy-link-selected')
			.end()
				.last().css({ 'border-right': '0', 'width': (space + diff) - (quantity - 1) });
			
			if (opt.animation == 'slide' || opt.animation == 'fade') {
				links.mousemove(function() {
					var $this = $(this);

					if (!$this.hasClass('slidy-link-selected')) {
						$this.mouseenter();
					}
				});
			}
		}

		go(0);

		if (opt.pause) {
			$this.mouseenter(overBanner).mouseleave(outBanner);
		}

		function go(index) {
			var total	= quantity - 1,
				last	= null;

			if (index > total) {
				index = 0;
				last = total;
			} else if (index <= 0) {
				index = 0;
				last = total;
			} else {
				last = index - 1;
			}

			change(last, index);

			timer =	setTimeout(function() {
					go(++index);
				}, opt.time);
		}

		function change(last, index) {
			if (!isAnimate) {
				isAnimate = true;

				if (opt.animation == 'fade') {
					elements
						.eq(last).fadeOut(opt.speed)
					.end()
						.eq(index).fadeIn(opt.speed, function() {
							selectMenu(index);
							isAnimate = false;
						});
				} else if (opt.animation == 'slide') {
					elements.css('z-index', 0)
						.eq(index).css('z-index', quantity).slideDown(opt.speed, function() {
							elements.eq(last).hide();
							selectMenu(index);
							isAnimate = false;
						});
				} else {
					elements
					.eq(last).hide()
					.end()
					.eq(index).show(0, function() {
						selectMenu(index);
						isAnimate = false;
					});
				}
			}
		};

		function selectMenu(index) {
			if (opt.menu) {
				$this
					.next('ul.slidy-menu')
						.children().removeClass('slidy-link-selected')
							.eq(index).addClass('slidy-link-selected');
			}
		};

		return $this;
	};

	function debug(message) {
		if (window.console && window.console.log) {
			window.console.log(message);
		}
	};

	$.fn.slidy.defaults = {
		action:		'mouseenter',
		animation:	'normal',
		children:	'img',
		cursor:		'default',
		height:		200,
		menu:		false,
		pause:		false,
		speed:		600,
		target:		'',
		time:		3600,
		width:		500
	};

})(jQuery);