// -----------------------------------------------------------------------------
//   Ambient.Impact - UX - To top component
// -----------------------------------------------------------------------------

// This creates a floating button that scrolls to the top of the screen when
// activated. The button (technically a link to #top) will only show if
// scrolling up, the viewport has been scrolled down enough to merit it, and no
// text field is focused (to avoid blocking one on narrow screens).

AmbientImpact.onGlobals(['Headroom', 'ally.get.activeElement'], function() {
AmbientImpact.on(['fastdom', 'icon', 'jquery', 'mediaQuery'], function(
  aiFastDom, aiIcon, aijQuery, aiMediaQuery,
) {
AmbientImpact.addComponent('toTop', function(aiToTop, $) {

  'use strict';

  /**
   * The base BEM class for the container and all child/state classes.
   *
   * @type {String}
   */
  const baseClass = 'to-top';

  /**
   * The BEM modifier class for the container when it's hidden.
   *
   * @type {String}
   */
  const hiddenClass = `${baseClass}--hidden`;

  /**
   * The BEM descendent class for the link.
   *
   * @type {String}
   */
  const linkClass = `${baseClass}__link`;

  /**
   * Our event namespace.
   *
   * @type {String}
   */
  const eventNamespace = 'aiToTop';

  /**
   * FastDom instance.
   *
   * @type {FastDom}
   */
  const fastdom = aiFastDom.getInstance();

  /**
   * Upward scroll ignore factor.
   *
   * This multiplier is used to determine the area within which to not show the
   * container as it would result in showing and then immediately hiding on
   * upward scroll. See ToTopContainer~updateVisibility().
   *
   * @type {Number}
   */
  const scrollShowIgnoreFactor = 1.5;

  /**
   * To top container class.
   *
   * This contains the actual logic for determining when to show or hide.
   */
  class ToTopContainer {

    /**
     * The container element wrapped in a jQuery collection.
     *
     * @type {jQuery}
     */
    #$element;

    /**
     * The currently initialized Headroom.js instance for this container.
     *
     * @type {Headroom}
     */
    #headroom;

    /**
     * The threshold in pixels that must be scrolled from top to show this.
     *
     * This defaults to the current viewport height when checking downward
     * scroll, and when scrolling up, the viewport multiplied by the
     * scrollShowIgnoreFactor constant.
     *
     * @type {Number}
     *
     * @see scrollShowIgnoreFactor
     */
    #scrollShowThreshold;

    /**
     * The current scroll direction.
     *
     * Will be one of 'up' or 'down'; starts as 'down'.
     *
     * @type {String}
     */
    #scrollDirection = 'down';

    constructor() {

      /**
       * Reference to the current instance.
       *
       * @type {ToTopContainer}
       */
      const that = this;

      this.#$element = $('<div></div>').addClass(baseClass);

      // Evaluate visibility immediately on construct.
      this.updateVisibility()
      // Then immediately evaluate whether the hidden attribute should be set so
      // that the container is instantly hidden without any visible transition.
      .then(function() {
        return that.#setHiddenAttr();
      // Then initialize the Headroom.js instance.
      }).then(function() {
        return that.#initHeadroom();
      // And lastly, bind all our event handlers once all of the above are
      // complete.
      }).then(function() {
        that.#bindEventHandlers();
      });

    }

    /**
     * Destroy this instance.
     *
     * Destroys the Headroom.js instance, unbinds all event handlers, and
     * detaches the container element from the DOM.
     *
     * @return {Promise}
     *   A Promise that resolves when various DOM tasks are complete.
     */
    destroy() {

      this.#unbindEventHandlers();

      /**
       * Reference to the current instance.
       *
       * @type {ToTopContainer}
       */
      const that = this;

      return fastdom.mutate(function() {

        if (that.#headroom && 'destroy' in that.#headroom) {
          that.#headroom.destroy();
        }

        that.#$element.detach();

      });

    }

    /**
     * Bind all of our event handlers.
     *
     * @see this~#unbindEventHandlers()
     */
    #bindEventHandlers() {

      /**
       * Reference to the current instance.
       *
       * @type {ToTopContainer}
       */
      const that = this;

      this.#$element.on(`transitionend.${eventNamespace}`, function(event) {
        that.#setHiddenAttr();
      });

      // Handle visibility on text input focus/blur.
      $('body').on([
        `focus.${eventNamespace}`,
        `blur.${eventNamespace}`,
      ].join(' '), 'input:textall, textarea', function(event) {

        // Use a timeout to delay checking the active element. This ensures we
        // don't incorrectly show the widget when the user blurs on text field
        // by focusing another one.
        setTimeout(function() {
          that.updateVisibility();
        });

      });

      // Hide unconditionally on immerseEnter.
      $(document).on(`immerseEnter.${eventNamespace}`, function(
        event, element,
      ) {
        that.hide();

      // Show if allowed on immerseExit.
      }).on(`immerseExit.${eventNamespace}`, function(event, element) {
        that.updateVisibility();
      });

      $(window).on([
        `lazyResize.${eventNamespace}`,
        `orientationchange.${eventNamespace}`,
      ].join(' '), function(event) {
        that.#initHeadroom();
      });

    }

    /**
     * Unbind all of our event handlers.
     *
     * @see this~#bindEventHandlers()
     */
    #unbindEventHandlers() {

      this.#$element.off(`transitionend.${eventNamespace}`);

      $('body').off([
        `focus.${eventNamespace}`,
        `blur.${eventNamespace}`,
      ].join(' '), 'input:textall, textarea');

      $(document).off([
        `immerseEnter.${eventNamespace}`,
        `immerseExit.${eventNamespace}`,
      ].join(' '));

      $(window).off([
        `lazyResize.${eventNamespace}`,
        `orientationchange.${eventNamespace}`,
      ].join(' '));

    }

    /**
     * Get the container element jQuery collection.
     *
     * @return {jQuery}
     */
    get $element() {
      return this.#$element;
    }

    /**
     * Get our Headroom.js options object.
     *
     * @param {Number} threshold
     *   Threshold in pixels to use for the Headroom.js 'offset' option.
     *
     * @return {Object}
     *
     * @see https://wicky.nillia.ms/headroom.js/
     */
    #getHeadroomOptions(threshold) {

      /**
       * Reference to the current instance.
       *
       * @type {ToTopContainer}
       */
      const that = this;

      return {

        // This is the threshold from the top of the window/parent that
        // determines if we're considered at the top or not. Above this fires
        // the onTop handler.
        offset: threshold,
        // This gives the scrolling a slight margin of error so that scrolling
        // up or down less than this (usually by accident) does not cause a
        // state change.
        tolerance: 5,

        // Specify our own classes so we don't inherit the headroom component
        // styles.
        classes: {
          initial:    baseClass,
          pinned:     `${baseClass}--pinned`,
          unpinned:   `${baseClass}--unpinned`,
          top:        `${baseClass}--top`,
          notTop:     `${baseClass}--not-top`,
          bottom:     `${baseClass}--bottom`,
          notBottom:  `${baseClass}--not-bottom`,
        },

        // When Headroom says we're pinned and thus going up, record the
        // direction and execute show if other conditions are met.
        onPin: function() {

          that.#scrollDirection = 'up';
          that.updateVisibility();

        },
        // When Headroom says we're unpinned and thus going down, record the
        // direction and hide if not already hidden.
        onUnpin: function() {

          that.#scrollDirection = 'down';
          that.updateVisibility();

        },
        // When Headroom says we're at the top, i.e. above the 'offset' setting,
        // hide if not already hidden.
        onTop: function() {

          that.updateVisibility();

        },
        // When Headroom says we've hit the bottom, set the scroll direction to
        // 'up' and show the container if possible. This automatically shows the
        // container at the bottom, which makes a certain intuitive sense.
        onBottom: function() {

          that.#scrollDirection = 'up';
          that.updateVisibility();

        },

      };

    }

    /**
     * Initialize our Headroom.js instance, destroying any previous instance.
     *
     * This (re-)initializes our Headroom.js instance, updating the scroll
     * threshold before it does so, to account for viewport size changes.
     *
     * @return {Promise}
     *   A Promise that resolves when various DOM tasks are complete.
     */
    #initHeadroom() {

      /**
       * Reference to the current instance.
       *
       * @type {ToTopContainer}
       */
      const that = this;

      return fastdom.measure(function() {

        return $(window).height();

      }).then(function(threshold) { return fastdom.mutate(function() {

        // Update the currently stored threshold based on the current window
        // height. This allows for resizing or changing the display orientation.
        that.#scrollShowThreshold = threshold;

        if (that.#headroom && 'destroy' in that.#headroom) {
          that.#headroom.destroy();
        }

        // Initialize Headroom instance to act on scroll direction and to detect
        // when we pass the scroll threshold.
        that.#headroom = new Headroom(
          that.#$element[0], that.#getHeadroomOptions(threshold),
        );

        that.#headroom.init();

      })});

    };

    /**
     * Show the container without any visibility checks.
     *
     * @return {Promise}
     *   A Promise that resolves when various DOM tasks are complete.
     *
     * @see this~updateVisibility()
     *   This method should be used in most cases rather than show().
     */
    show() {

      /**
       * Reference to the current instance.
       *
       * @type {ToTopContainer}
       */
      const that = this;

      return fastdom.mutate(function() {

        // Remove the hidden attribute.
        that.#$element.removeAttr('hidden');

        // We need to delay the removal of the class until the next paint, so
        // that the browser has a chance to paint the container as unhidden,
        // otherwise transitions won't run.

        // At this point we haven't painted a new frame yet.
        window.requestAnimationFrame(function(timestamp) {
          // Now we have, so we remove on the next frame.
          window.requestAnimationFrame(function(timestamp) {
            that.#$element.removeClass(hiddenClass);
          });
        });

      });

    }

    /**
     * Hide the container without any visibility checks.
      *
     * @return {Promise}
     *   A Promise that resolves when various DOM tasks are complete.
    *
     * @see this~updateVisibility()
     *   This method should be used in most cases rather than hide().
     */
    hide() {

      /**
       * Reference to the current instance.
       *
       * @type {ToTopContainer}
       */
      const that = this;

      return fastdom.mutate(function() {
        that.#$element.addClass(hiddenClass);
      });

    }

    /**
     * Set the hidden attribute on the container if the hidden class is set.
     *
     * This is primarily called once on construct and thereafter in the
     * transitionend event once all visual transitions have completed to hide
     * the container from assistive technology like screen readers.
     *
     * @return {Promise}
     *   A Promise that resolves when various DOM tasks are complete.
     */
    #setHiddenAttr() {

      /**
       * Reference to the current instance.
       *
       * @type {ToTopContainer}
       */
      const that = this;

      return fastdom.measure(function() {

        return that.#$element.is(`.${hiddenClass}`);

      }).then(function(hasHiddenClass) {

        if (hasHiddenClass === false) {
          return Promise.resolve();
        }

        return fastdom.mutate(function() {
          that.#$element.attr('hidden', 'hidden');
        });

      });

    }

    /**
     * Show or hide the container after evaluating scroll direction, distance.
     *
     * @return {Promise}
     *   A Promise that resolves when various DOM tasks are complete.
     */
    updateVisibility() {

      /**
       * Reference to the current instance.
       *
       * @type {ToTopContainer}
       */
      const that = this;

      return fastdom.measure(function() {

        return {
          scrollTop:      $(window).scrollTop(),
          scrollIgnore:   that.#scrollShowThreshold * scrollShowIgnoreFactor,
          direction:      that.#scrollDirection,
          isTextFocused:  $(ally.get.activeElement()).is(
            'input:textall, textarea',
          ),
        }

      }).then(function(data) {

        // Should we show the container?
        if (
          // Are we scrolling up?
          data.direction === 'up' &&
          // Is the scroll position outside of the ignore area?
          data.scrollTop > data.scrollIgnore &&
          // Is there no text input currently focused?
          data.isTextFocused === false
        ) {
          return that.show();

        // If not, hide the container.
        } else {
          return that.hide();
        }

      });

    }

  }

  /**
   * To top link class.
   *
   * This encapsulates just the link, its click handler, and logic for whether
   * or not scrolling should be smooth or instantaneous based on the
   * prefers-reduced-motion media query.
   */
  class ToTopLink {

    /**
     * The link element wrapped in a jQuery collection.
     *
     * @type {jQuery}
     */
    #$element;

    constructor() {

      this.#$element = $('<a></a>')
        .attr('href', `#${aiToTop.settings.topAnchorID}`)
        .attr('title', Drupal.t('Go to the top'))
        .addClass(linkClass)
        .text(Drupal.t('Top'))
        .wrapTextWithIcon('arrow-up', {
          bundle:       'core',
          textDisplay:  'visuallyHidden',
        })
        .on(`click.${eventNamespace}`, {
          // Pass the current instance to the event handler because 'this' will
          // be the link element in that context.
          that: this,
        }, this.#click);

    }

    /**
     * Destroy this instance.
     *
     * Unbinds all event handlers and detaches the link element from the DOM.
     *
     * @return {Promise}
     *   A Promise that resolves when various DOM tasks are complete.
     */
    destroy() {

      /**
       * Reference to the current instance.
       *
       * @type {ToTopLink}
       */
      const that = this;

      this.#$element.off(`click.${eventNamespace}`, this.#click);

      return fastdom.mutate(function() {

        that.#$element.detach();

      });

    }

    /**
     * Get the link element jQuery collection.
     *
     * @return {jQuery}
     */
    get $element() {
      return this.#$element;
    }

    /**
     * Get the scroll options object.
     *
     * @return {Object}
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/scroll
     */
    #getScrollObject() {

      /**
       * The options object passed to window.scroll().
       *
       * @type {Object}
       */
      let scrollObject = {top: 0};

      // Only smoothly scroll if the browser doesn't indicate the user prefers
      // reduced motion.
      //
      // @see https://ambientimpact.com/web/snippets/the-reduced-motion-media-query
      if (!aiMediaQuery.matches('(prefers-reduced-motion)')) {
        scrollObject.behavior = 'smooth';
      }

      return scrollObject;

    }

    /**
     * Link click event handler.
     *
     * @param {jQuery.Event} event
     */
    #click(event) {

      // Remove the hash when scrolling up, in case a jump-to-section link was
      // used.
      //
      // @see http://stackoverflow.com/a/5298684
      if (window.location.hash) {
        history.pushState(
          '',
          document.title,
          window.location.pathname + window.location.search
        );
      }

      window.scroll(event.data.that.#getScrollObject());

      // The link has #top as the href, but we're going to prevent that being
      // added to the URL to keep the URL clean.
      event.preventDefault();

    }

  }

  /**
   * The to top class; encapsulates the link and container classes.
   */
  class ToTop {

    /**
     * The to top container class instance.
     *
     * @type {ToTopContainer}
     */
    #container;

    /**
     * The to top link class instance.
     *
     * @type {ToTopLink}
     */
    #link;

    constructor(target) {

      this.#container = new ToTopContainer();

      this.#link = new ToTopLink();

      /**
       * Reference to the current instance.
       *
       * @type {ToTop}
       */
      const that = this;

      fastdom.mutate(function() {

        that.#link.$element.appendTo(that.#container.$element);

        that.#container.$element.appendTo(target);

      });

    }

    /**
     * Destroy this instance.
     *
     * This wraps the container and link instances destroy() methods.
     *
     * @return {Promise}
     *   A Promise that resolves when various DOM tasks are complete.
     *
     * @see ToTopContainer~destroy()
     *
     * @see ToTopLink~destroy()
     */
    destroy() {

      return Promise.all([

        this.#container.destroy(),
        this.#link.destroy(),

      ]);

    }

  }

  this.addBehaviour(
    'AmbientImpactToTop',
    'ambientimpact-to-top',
    'body',
    function(context, settings) {

      $(this).prop('aiToTop', new ToTop(this));

    },
    function(context, settings, trigger) {

      /**
       * Reference to the HTML element being detached from.
       *
       * @type {HTMLElement}
       */
      const that = this;

      $(this).prop('aiToTop').destroy().then(function() {

        $(that).removeProp('aiToTop');

      });

    }
  );

});
});
});
