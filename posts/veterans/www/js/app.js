// Global state
var $nextPostTitle = null;
var $nextPostImage = null;
var $upNext = null;
var NAV_HEIGHT = 75;
var EVENT_CATEGORY = 'veterans';

var $w;
var $h;
var $slides;
var $primaryNav;
var $arrows;
var $startCardButton;
var mobileSuffix;
var isTouch = Modernizr.touch;
var aspectWidth = 16;
var aspectHeight = 9;
var optimalWidth;
var optimalHeight;
var w;
var h;
var hasTrackedKeyboardNav = false;
var hasTrackedSlideNav = false;
var slideStartTime = moment();
var completion = 0;

var	overlay = document.querySelector( 'div.overlay-menu' );
	var transEndEventNames = {
			'WebkitTransition': 'webkitTransitionEnd',
			'MozTransition': 'transitionend',
			'OTransition': 'oTransitionEnd',
			'msTransition': 'MSTransitionEnd',
			'transition': 'transitionend'
		};
var transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ];
var support = { transitions : Modernizr.csstransitions };

/*var onStartCardButtonClick = function() {
    $.fn.fullpage.moveSlideRight();
}*/

var resize = function() {

    $w = $(window).width();
    $h = $(window).height();

    $slides.width($w);

    optimalWidth = ($h * aspectWidth) / aspectHeight;
    optimalHeight = ($w * aspectHeight) / aspectWidth;

    w = $w;
    h = optimalHeight;

    if (optimalWidth > $w) {
        w = optimalWidth;
        h = $h;
    }
};

var setUpFullPage = function() {
    $.fn.fullpage({
        autoScrolling: false,
        verticalCentered: false,
        fixedElements: '.primary-navigation, #share-modal, .overlay-menu',
        resize: false,
        css3: true,
        loopHorizontal: false,
        afterRender: onPageLoad,
        afterSlideLoad: onAfterSlideLoad,
        onSlideLeave: onSlideLeave
    });
};


var onPageLoad = function() {
    setSlidesForLazyLoading(0)
    $('body').css('opacity', 1);
    showNavigation();
};

// after a new slide loads

var lazyLoad = function(anchorLink, index, slideAnchor, slideIndex) {
    setSlidesForLazyLoading(slideIndex);

    showNavigation();

    slideStartTime = moment();

    // Completion tracking
    how_far = (slideIndex + 1) / $slides.length;

    if (how_far >= completion + 0.25) {
        completion = how_far - (how_far % 0.25);

        _gaq.push(['_trackEvent', EVENT_CATEGORY, 'completion', completion.toString()]);
    }
};

var setSlidesForLazyLoading = function(slideIndex) {
    /*
    * Sets up a list of slides based on your position in the deck.
    * Lazy-loads images in future slides because of reasons.
    */

    var slides = [
        $slides[slideIndex - 2],
        $slides[slideIndex - 1],
        $slides[slideIndex],
        $slides[slideIndex + 1],
        $slides[slideIndex + 2]
    ];

    findImages(slides);

}

var findImages = function(slides) {
    /*
    * Set background images on slides.
    * Should get square images for mobile.
    */

    // Mobile suffix should be blank by default.
    mobileSuffix = '';

/* disabling mobile suffix while we're under development
    if ($w < 769) {
        mobileSuffix = '-sq';
    }
*/

    _.each($(slides), function(slide) {

        getBackgroundImage(slide);
        var containedImage = $(slide).find('.contained-image-container, .contained-image');
        getBackgroundImage(containedImage);
    });
};

var getBackgroundImage = function(container) {
    /*
    * Sets the background image on a div for our fancy slides.
    */
    if ($(container).data('bgimage')) {

        var image_filename = $(container).data('bgimage').split('.')[0];
        var image_extension = '.' + $(container).data('bgimage').split('.')[1];
        var image_path = 'assets/' + image_filename + mobileSuffix + image_extension;

        if ($(container).css('background-image') === 'none') {
            $(container).css('background-image', 'url(' + image_path + ')');
        }
        if ($(container).hasClass('contained-image-container')) {
            setImages($(container));
        }

     }
};

var showNavigation = function() {
    /*
    * Nav doesn't exist by default.
    * This function loads it up.
    */

    if ($slides.first().hasClass('active')) {
        if (!$arrows.hasClass('active')) {
            animateArrows();
        }

        var $prevArrow = $arrows.filter('.prev');

        $prevArrow.removeClass('active');
        $prevArrow.css({
            //'opacity': 0,
            'display': 'none'
        });

        $('body').addClass('titlecard-nav');

        //$primaryNav.css('opacity', '1');
    }

    else if ($slides.last().hasClass('active')) {
        /*
        * Last card gets no next arrow but does have the nav.
        */
        if (!$arrows.hasClass('active')) {
            animateArrows();
        }

        var $nextArrow = $arrows.filter('.next');

        $nextArrow.removeClass('active');
        $nextArrow.css({
            //'opacity': 0,
            'display': 'none'
        });

        //$primaryNav.css('opacity', '1');
    } else {
        /*
        * All of the other cards? Arrows and navs.
        */
        if ($arrows.filter('active').length != $arrows.length) {
            animateArrows();
        }

        $('body').removeClass('titlecard-nav');

        //$primaryNav.css('opacity', '1');
    }
}

var animateArrows = function() {
    /*
    * Everything looks better faded. Hair; jeans; arrows.
    */
    $arrows.addClass('active');

    if ($arrows.hasClass('active')) {
        $arrows.css('display', 'block');
        fadeInArrows();
    }
};

var fadeInArrows = _.debounce(function() {
    /*
    * Debounce makes you do crazy things.
    */
    //$arrows.css('opacity', 1)
}, 1);


var setImages = function(container) {
    /*
    * Image resizer from the Wolves lightbox + sets background image on a div.
    */

    // Grab Wes's properly sized width.
    var imageWidth = w;

    // Sometimes, this is wider than the window, shich is bad.
    if (imageWidth > $w) {
        imageWidth = $w;
    }

    // Set the hight as a proportion of the image width.
    var imageHeight = ((imageWidth * aspectHeight) / aspectWidth);

    // Sometimes the lightbox width is greater than the window height.
    // Center it vertically.
    if (imageWidth > $h) {
        imageTop = (imageHeight - $h) / 2;
    }

    // Sometimes the lightbox height is greater than the window height.
    // Resize the image to fit.
    if (imageHeight > $h) {
        imageWidth = ($h * aspectWidth) / aspectHeight;
        imageHeight = $h;
    }

    // Sometimes the lightbox width is greater than the window width.
    // Resize the image to fit.
    if (imageWidth > $w) {
        imageHeight = ($w * aspectHeight) / aspectWidth;
        imageWidth = $w;
    }

    // Set the top and left offsets. Image bottom includes offset for navigation
    var imageBottom = ($h - imageHeight) / 2 + 70;
    var imageLeft = ($w - imageWidth) / 2;

    // Set styles on the map images.
    $(container).css({
        'width': imageWidth + 'px',
        'height': imageHeight + 'px',
        'bottom': imageBottom + 'px',
        'left': imageLeft + 'px',
    });

};

var onAfterSlideLoad = function(anchorLink, index, slideAnchor, slideIndex) {
    /*
     * Fired after the slide changes.
     */

    var $currentSlide = $($slides[slideIndex]);
    lazyLoad(null, null, null, slideIndex);

    if ($currentSlide.hasClass('filmstrip')){
        var images = $currentSlide.data('filmstrip');
        var length = parseInt($currentSlide.data('filmstrip-length'));
        setupFilmstrip($currentSlide, images, length);
    }
};

var onSlideLeave = function(anchorLink, index, slideIndex, direction) {
    /*
    * Called when leaving a slide.
    */

    var now = moment();
    var timeOnSlide = (now - slideStartTime);
    var $currentSlide = $($slides[slideIndex]);

    if ($currentSlide.hasClass('filmstrip')){
        $currentSlide.find('.grid-face').empty();
    }

    _gaq.push(['_trackEvent', EVENT_CATEGORY, 'slide-exit', slideIndex.toString(), timeOnSlide]);
}

var onResize = function(e) {
    if ($('.slide.active').hasClass('image-split')) {
        setImages($('.slide.active').find('.contained-image-container')[0]);
    }
}

var onDocumentKeyDown = function(e) {
    if (hasTrackedKeyboardNav) {
        return true;
    }

    switch (e.which) {

        //left
        case 37:

        //right
        case 39:
            _gaq.push(['_trackEvent', EVENT_CATEGORY, 'keyboard-nav']);
            hasTrackedKeyboardNav = true;
            break;

        // escape
        case 27:
            break;

    }

    // jquery.fullpage handles actual scrolling
    return true;
}

var onSlideClick = function(e) {
    if (isTouch) {
        $.fn.fullpage.moveSlideRight();
    }

    return true;
}

var onNextPostClick = function(e) {
    window.top.location = NEXT_POST_URL;

    _gaq.push(['_trackEvent', EVENT_CATEGORY, 'next-post']);

    return true;
}

var receiveMessage = function(e) {
    var head = e.data.substr(0, 5);
    var tail = e.data.substr(5, e.data.length);
    if (head == 'post-') {
        var post = JSON.parse(tail);

        $nextPostTitle.text(post.title);
        $nextPostImage.attr('src', post.image);
        $nextPostURL.attr('href', post.url);
    }
}

var setupFilmstrip = function(slide, images, length){
    //velocity filmstrip to be extended to work for image sequences and contact sheets.
    
   
    /*
    $.Velocity.RegisterUI("transition.filmic", {
        defaultDuration: 0,
        calls: [ 
            [ {opacity: 1} ]
        ]
    });
    */
   
    
    
    var $filmstrip = slide.find('.filmstrip-container');
    var filmstripType = slide.data('filmstrip-type');
    var transitionGridIn = "transition.fadeIn";
    var transitionGridOut = "transition.fadeOut";
    
    var transitionTitlesIn = "transition.flipYIn";
    var transitionTitlesOut = "transition.flipYOut";

    var renderFrames = function(options) {
        var frame = "<div class='frame'><img src='1.jpg'></div>";

        $filmstrip.empty();

        for (var i = 0; i < length; i++){
            $filmstrip.append($(frame));
        }

        loadImages();
    }

    var loadImages = function() {
        var imageRoot = "assets/" + images + '/';

        $filmstrip.find('.frame').each(function(i) {
            $(this).find('img').attr('src', imageRoot + i + '.jpg');

            if (filmstripType === 'animated') {
                $(this).css('background-image', 'url(' + imageRoot + i + '.jpg)');
            }
        });

        // Clone filmstrip frames to fill canvas
        if (filmstripType === 'contact-sheet') {
            $filmstrip.find('img').one('load', function(){
                var $frames = $filmstrip.find('.frame');
                var rows = Math.ceil($(window).height() / $(this).parent().height());
                var columns = Math.floor($(window).width() / $(this).parent().width());
                var framesNeeded = rows * columns;
                var fillFrames = framesNeeded - $frames.length;

                if (fillFrames > 0){
                    for (var i = 0; i < fillFrames; i++) {
                        $($frames[i]).clone().appendTo($filmstrip);
                    }
                }
            })
        }

        $filmstrip.find('.frame').last().find('img').one('load', function() {
            if (filmstripType === 'animated') {
                sequenceInOut(0, transitionGridIn, false, 0, 0);
            }

            if (filmstripType === 'contact-sheet') {
                sequenceInOut(0, transitionGridIn, false, 800, 2700, transitionTitlesIn, 2500);
            }
        });
    };

    var sequenceInOut = function(delaygrid, easegrid, backgrid, durationgrid) {
        $filmstrip.find('.frame').delay(delaygrid).velocity(easegrid, {
            stagger: filmstripType === 'animated' ? 900 : 0,
            duration: durationgrid,
            backwards: backgrid,
            drag: false
        });
    };

    renderFrames();
}

/*
 * Text copied to clipboard.
 */
var onClippyCopy = function(e) {
    alert('Copied to your clipboard!');

    _gaq.push(['_trackEvent', EVENT_CATEGORY, 'summary-copied']);
}

$(document).ready(function() {
    $w = $(window).width();
    $h = $(window).height();

    $slides = $('.slide');
    $navButton = $('.primary-navigation-btn');
    $primaryNav = $('.primary-navigation');
    //$startCardButton = $('.btn-go');
    $arrows = $('.controlArrow');

    $nextPostTitle = $('.next-post-title');
    $nextPostImage = $('.next-post-image');
    $upNext = $('.up-next');

    //$startCardButton.on('click', onStartCardButtonClick);
    $slides.on('click', onSlideClick);
    $upNext.on('click', onNextPostClick);

    setUpFullPage();
    resize();

    ZeroClipboard.config({ swfPath: 'js/lib/ZeroClipboard.swf' });
    var clippy = new ZeroClipboard($(".clippy"));
    clippy.on('ready', function(readyEvent) {
        clippy.on('aftercopy', onClippyCopy);
    });
    
    //section menu
    $( ".start-over" ).click(function() {
      $.fn.fullpage.moveTo(0, 0);
    });
    
    $( ".marcus-menu" ).click(function() {
      $.fn.fullpage.moveTo(0, 2);
    });
    
    $( ".vanessa-menu" ).click(function() {
      $.fn.fullpage.moveTo(0, 11);
    });
    
    $( ".leonardo-menu" ).click(function() {
      $.fn.fullpage.moveTo(0, 15);
    });
    
    $( ".kiki-menu" ).click(function() {
      $.fn.fullpage.moveTo(0, 19);
    });
    
    $( ".dolas-menu" ).click(function() {
      $.fn.fullpage.moveTo(0, 24);
    });
    
    $( ".melinda-menu" ).click(function() {
      $.fn.fullpage.moveTo(0, 29);
    });
    
    $( ".parks-menu" ).click(function() {
      $.fn.fullpage.moveTo(0, 34);
    });
    
    $( ".henry-menu" ).click(function() {
      $.fn.fullpage.moveTo(0, 39);
    });
    
    $( ".dan-menu" ).click(function() {
      $.fn.fullpage.moveTo(0, 43);
    });
    
	function toggleOverlay() {
		if( classie.has( overlay, 'open' ) ) {
			classie.remove( overlay, 'open' );
			classie.add( overlay, 'close' );
			var onEndTransitionFn = function( ev ) {
				if( support.transitions ) {
					if( ev.propertyName !== 'visibility' ) return;
					this.removeEventListener( transEndEventName, onEndTransitionFn );
				}
				classie.remove( overlay, 'close' );
			};
			if( support.transitions ) {
				overlay.addEventListener( transEndEventName, onEndTransitionFn );
			}
			else {
				onEndTransitionFn();
			}
		}
		else if( !classie.has( overlay, 'close' ) ) {
			classie.add( overlay, 'open' );
		}
	};
	
	$(".menu-toggle").click(function() {
      toggleOverlay();
    });
    
    //end section menu

    //$(".menu-items").velocity( { opacity: 1 }, 2000);
    
    // Redraw slides if the window resizes
    $(window).resize(resize);
    $(window).resize(onResize);
    $(document).keydown(onDocumentKeyDown);

    window.addEventListener('message', receiveMessage, false);

    window.top.postMessage('handshake', '*');
});
