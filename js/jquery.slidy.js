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
			.css({ 'position': 'absolute', 'z-index': elements.length - i })
			.attr('id', $this.attr('id') + '-' + (i + 1))
			.hide();
		});

		$this
			.find('img')
			.attr({ height: opt.height, width: opt.width });

		if (opt.children == 'a' && opt.target != '') {
			elements.attr('target',	opt.target);
		}

		elements
			.first().show()
		.end()
			.find('img').css('border', '0');

		go(elements, opt, 0);

		var stop = function() {
			var target = $(this),
				index,
				last;

			clearTimeout(timer);

			if (target.is('li')) {
				index	= target.index();
				last	= target.parent().children('.slidy-link-selected').index();
			} else {
				index	= $this.next('ul').children('.slidy-link-selected').index();
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
			var index	= $this.next('ul').children('.slidy-link-selected').index(),
				isBanner; // Avoid hover the same li again.

			// Is not used element.index() because the delay effect can be select another is not the same of cursor over.
			if (!$(this).is('li')) {
				isBanner = true;
			}

			go(elements, opt, index, isBanner);
		};

		if (opt.menu) {
			var imgs	= elements.find('img'),
				menu	= '',
				target	= (opt.target != '') ? 'target="' + opt.target + '"' : '',
				parent,
				img;

			imgs.each(function() {
				img		= $(this);
				parent	= img.parent(opt.children);

				menu += '<li><a href="' + parent.attr(parent.is('a') ? 'href' : 'title') + '" ' + target + '>' + img.attr('title') + '</a></li>';
			});

			$this.after('<ul class="slidy-menu">' + menu + '</ul>');

			var space	= parseInt((opt.width / imgs.length) + (imgs.length - 1)),
				diff	= opt.width - (space * imgs.length),
				links	= $('ul.slidy-menu').children('li');

			links
			.css('width', space)
			.hover(stop, start)
			.mousemove(stop) // To fix the delay of the effect and moviment of cursor. Avoid mouseout and mouseover again to change. Overhead?
				.first().addClass('slidy-link-selected')
			.end()
				.last().css({ 'border-right': '0', 'width': (space + diff) - (imgs.length - 1) });
		}

		if (opt.pause) {
			$this.hover(stop, start);
		}

		function go(elements, opt, index, isBanner) {
			change(elements, opt, index, index - 1);

			if (isBanner == undefined) {
				selectMenu(index);
			}

			index = (index < elements.length - 1) ? index + 1 : 0;

			timer =	setTimeout(function() {
						go(elements, opt, index);
					}, opt.time);
		};

		function change(elements, opt, index, last) {
			if (!isAnimate) {
				isAnimate = true;

				if (opt.animation == 'fade') {
					elements.eq(last).fadeOut(opt.speed);
					elements.eq(index).fadeIn(opt.speed, function() {
						selectMenu(index);
						isAnimate = false;
					});
				} else if (opt.animation == 'slide') {
					elements
					.css('z-index', 0)
						.eq(index)
						.css('z-index', elements.length)
						.slideDown(opt.speed, function() {
							elements.eq(last).hide();
							selectMenu(index);
							isAnimate = false;
						});
				} else {
					elements.eq(last).hide();
					elements.eq(index).show();
					isAnimate = false;
				}
			}
		};

		function selectMenu(index) {
			$this
				.next('ul')
					.children().removeClass('slidy-link-selected')
						.eq(index).addClass('slidy-link-selected');
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