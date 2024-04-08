// -----------------------------------------------------------------------------
//   Ambient.Impact - UX - Scroll proxy component
// -----------------------------------------------------------------------------

// @todo Refactor as a JavaScript class; make fully object-oriented.

// @todo Add a configurable direction so that this can be applied to the
//   vertical axis instead if needed.

AmbientImpact.onGlobals([
  'Motion.animate',
  'Motion.scroll',
], function() {
AmbientImpact.on(['fastdom'], function(aiFastDom) {
AmbientImpact.addComponent('scrollProxy', function(aiScrollProxy, $) {

  'use strict';

  /**
   * Name of the data object for the detach callback.
   *
   * @type {String}
   */
  const dataObjectName = 'aiScrollProxy';

  /**
   * Our event namespace.
   *
   * @type {String}
   */
  const eventNamespace = 'aiScrollProxy';

  /**
   * FastDom instance.
   *
   * @type {FastDom}
   */
  const fastdom = aiFastDom.getInstance();

  /**
   * Name of the data attribute identifying a scroll proxy item.
   *
   * @type {String}
   */
  const itemAttributeName = 'data-scroll-proxy-item';

  /**
   * The scroll proxy item width property name.
   *
   * @type {String}
   */
  const itemWidthPropertyName = '--scroll-proxy-item-width';

  /**
   * Sentinel element class.
   *
   * @type {String}
   */
  const sentinelClass = 'scroll-proxy-sentinel';

  /**
   * The sentinel element intersect property name.
   *
   * @type {String}
   */
  const sentinelIntersectPropertyName =
    '--scroll-proxy-sentinel-intersect-amount';

  /**
   * Name of the data attribute on an item indicating the sentienal container.
   *
   * The value of this is expected to be a selector to be passed to
   * jQuery().closest().
   *
   * @type {String}
   */
  const sentinelContainerAttributeName = 'data-scroll-proxy-sentinel-container';

  /**
   * The scroll proxy on/off property name.
   *
   * This is set to 'true' in the CSS if the element is to use the scroll proxy
   * and 'false' otherwise. This allows the functionality to be enabled per-
   * element and also change on an element based on screen sizes, dynamically
   * turning it on and off as needed.
   *
   * @type {String}
   */
  const useScrollProxyPropertyName = '--use-scroll-proxy';

  /**
   * Construct a new scroll proxy item.
   *
   * @param {HTMLElement} item
   *   An element to attach to.
   *
   * @constructor
   */
  this.scrollProxyItem = function(item) {

    /**
     * Reference to the current instance for use in callbacks.
     *
     * @type {Object}
     */
    let instance = this;

    /**
     * The scroll proxy item we're attaching to.
     *
     * @type {jQuery}
     */
    let $item = $(item);

    /**
     * The sentinel container.
     *
     * @type {jQuery}
     */
    let $sentinelContainer = $();

    /**
     * The sentinel container selector.
     *
     * @type {String|undefined}
     */
    let sentinelContainerSelector = $item.attr(
      sentinelContainerAttributeName
    );

    if (typeof sentinelContainerSelector === 'string') {

      /**
       * Temporary sentinel container collection.
       *
       * @type {jQuery}
       */
      let $container = $item.closest(sentinelContainerSelector);

      // If a container was found, use it.
      if ($container.length > 0) {

        $sentinelContainer = $container;

      // Otherwise output a warning that the selector didn't match anything.
      } else {

        console.warn(
          'Couldn\'t find the specified sentinel container:',
          sentinelContainerSelector
        );

      }

    }

    // If a sentinel container wasn't set, use the item's parent element.
    if ($sentinelContainer.length === 0) {
      $sentinelContainer = $item.parent();
    }

    /**
     * The sentinel element for this item.
     *
     * @type {jQuery}
     */
    let $sentinel = $('<span></span>').addClass(sentinelClass);

    /**
     * Motion Controls object for the current animation, if any.
     *
     * @type {Object|undefined}
     *
     * @see https://motion.dev/dom/controls
     */
    let animationControls;

    /**
     * Start observing scroll.
     */
    function startObserving() {

      /**
       * Motion.scroll() options object.
       *
       * @type {Object}
       *
       * @see https://motion.dev/dom/scroll
       */
      const scrollOptions = {
        target: $sentinel[0],
        offset: ['start end', 'end end'],
      };

      animationControls = Motion.animate(function(value) {

        if (value === lastValue) {
          return;
        }

        fastdom.mutate(function() {

          $item[0].style.setProperty(
            sentinelIntersectPropertyName,
            value,
          );

          lastValue = value;

        });
      }, {});

      // Pause the animation so it doesn't progress except by being scrubbed on
      // scroll. This is the same thing that Motion.scroll() does internally
      // when it creates an animation if you don't pass it an existing
      // animation.
      animationControls.pause();

      Motion.scroll(animationControls, scrollOptions);

    };

    /**
     * Stop observing scroll.
     */
    function stopObserving() {

      animationControls.cancel();

      animationControls = undefined;

    };

    /**
     * Whether we're currently observing.
     *
     * @type {Boolean}
     */
    let isObserving = false;

    /**
     * The last measured viewport width in pixels.
     *
     * @type {Number}
     */
    let lastViewportWidth = 0;

    /**
     * The last value observed, to avoid unnecessary DOM operations.
     *
     * @type {Number}
     */
    let lastValue = 0;

    fastdom.measure(function() {
      lastViewportWidth = $(window).width();

    }).then(function() {
      return instance.updateWidthProperty();

    }).then(function() {

      return fastdom.mutate(function() {
        $sentinel.prependTo($sentinelContainer);
      });

    }).then(function() {

      startObserving();

      isObserving = true;

      $(window).on([
        'lazyResize.' + eventNamespace,
        'drupalViewportOffsetChange.' + eventNamespace
      ].join(' '), instance.update);

    });

    /**
     * Determine if the item is currently set to use scroll proxy.
     *
     * @return {Promise}
     *   Promise returned by FastDom that resolves with either true or false.
     */
    this.useScrollProxy = function() {

      // Attempt to read and parse the CSS custom property.
      return fastdom.measure(function() {

        /** @type {String} Either a string value or an empty string if not defined. */
        let propertyValue = getComputedStyle($item[0]).getPropertyValue(
          useScrollProxyPropertyName
        ).trim();

        return propertyValue === 'true';

      });

    };

    /**
     * Update the item width custom property.
     *
     * @return {Promise}
     *   The Promise returned by FastDom resolved once the update is complete.
     */
    this.updateWidthProperty = function() {

      return fastdom.measure(function() {

        return $item.width();

      }).then(function(width) {

        return fastdom.mutate(function() {
          $item[0].style.setProperty(itemWidthPropertyName, width + 'px');
        });

      });

    }

    /**
     * Update various properties and start/stop observing if needed.
     *
     * @return {Promise}
     *   The Promise returned by FastDom resolved when all updates are complete.
     */
    this.update = function() {

      return fastdom.measure(function() {

        let viewportWidth = $(window).width();

        if (lastViewportWidth === viewportWidth) {
          return false;
        }

        // Update the stored viewport width.
        lastViewportWidth = viewportWidth;

        return instance.useScrollProxy().then(function(shouldObserve) {

          if (shouldObserve === false && isObserving === true) {

            startObserving();

            isObserving = false;

          }

          return shouldObserve;

        });

      }).then(function(shouldUpdate) {

        if (shouldUpdate === false) {
          return;
        }

        return instance.updateWidthProperty().then(function() {

          if (isObserving === true) {
            return;
          }

          startObserving();

          isObserving = true;

        });

      });

    };

    this.detach = function() {

      $(window).off([
        'lazyResize.' + eventNamespace,
        'drupalViewportOffsetChange.' + eventNamespace
      ].join(' '), instance.update);

      stopObserving();

      return fastdom.mutate(function() {
        $sentinel.remove();

        $item[0].style.removeProperty(itemWidthPropertyName);
      });

    };

  };

  this.addBehaviour(
    'AmbientImpactScrollProxy',
    'ambientimpact-scroll-proxy',
    '[' + itemAttributeName + ']',
    function(context, settings) {

      this[dataObjectName] = new aiScrollProxy.scrollProxyItem(this);

    },
    function(context, settings, trigger) {

      this[dataObjectName].detach();

      delete this[dataObjectName];

    }

  );

});
});
});
