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
 * $('#default').slidy();
 *
 * <div id="default">
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
			var target = $(this), index, last;

			clearTimeout(timer);

			if (target.is('li')) {
				index	= target.index();
				last	= target.parent().children('.slidy-link-selected').index();
			} else {
				index	= $menu.children('.slidy-link-selected').index();
				last	= index;
			}

			if (index != last) {
				target.addClass('slidy-link-selected')
					.parent()
						.children()
							.eq(last).removeClass('slidy-link-selected');

				change(elements, opt, index, last);
			}
		}, start = function() {
			var index	= $menu.children('.slidy-link-selected').index(),
				isBanner; // Avoid hover the same li again.

			// Is not used element.index() because the delay effect can be select another is not the same of cursor over.
			if (!$(this).is('li')) {
				isBanner = true;
			}

			go(elements, opt, index, isBanner);
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

			links
			.css('width', space)
			.hover(stop, start)
			.mousemove(stop) // To fix the delay of the effect and moviment of cursor. Avoid mouseout and mouseover again to change. Overhead?
				.first().addClass('slidy-link-selected')
			.end()
				.last().css({ 'border-right': '0', 'width': (space + diff) - (quantity - 1) });
		}

		go(elements, opt, 0);

		if (opt.pause) {
			$this.hover(stop, start);
		}

		function go(elements, opt, index, isBanner) {
			change(elements, opt, index, index - 1);

			if (isBanner == undefined) {
				selectMenu(index);
			}

			index = (index < quantity - 1) ? index + 1 : 0;

			timer =	setTimeout(function() {
						go(elements, opt, index);
					}, opt.time);
		};

		function change(elements, opt, index, last) {
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
					elements
					.css('z-index', 0)
						.eq(index)
						.css('z-index', quantity)
						.slideDown(opt.speed, function() {
							elements.eq(last).hide();
							selectMenu(index);
							isAnimate = false;
						});
				} else {
					elements
						.eq(last).hide()
					.end()
						.eq(index).show();
					isAnimate = false;
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