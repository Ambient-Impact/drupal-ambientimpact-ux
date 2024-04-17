// -----------------------------------------------------------------------------
//   Ambient.Impact - UX - Tooltip component
// -----------------------------------------------------------------------------

AmbientImpact.onGlobals([
  'ally.when.key',
  'tippy.delegate',
], function() {
AmbientImpact.on(['fastdom'], function(aiFastDom) {
AmbientImpact.addComponent('tooltip', function(aiTooltip, $) {

  'use strict';

  /**
   * FastDom instance.
   *
   * @type {FastDom}
   */
  const fastdom = aiFastDom.getInstance();

  /**
   * Modified version of tippy.roundArrow to add a 2 pixel bleed at the bottom.
   *
   * This is intended to fix sub-pixel rendering issues where gaps can show up
   * due to the various transforms used.
   *
   * @type {String}
   */
  const arrow = '<svg width="16" height="8" xmlns="http://www.w3.org/2000/svg"><path d="M 8 0 C 6.9300011 0.005999994 5.8509207 0.89976711 4.6699219 2.3847656 C 1.7959247 5.986762 0 6 0 6 L 0 8 L 16 8 L 16 6 C 16 6 14.233747 6.004762 11.34375 2.3847656 C 10.148751 0.88676712 9.0699989 -0.005999994 8 0 z "></svg>';

  /**
   * Debug Tippy.js plug-in.
   *
   * This will override several properties to force the tooltips to remain
   * open after clicking away/losing focus. This is especially useful when
   * developing new themes for the tooltips, as trying to inspect them in the
   * browser dev tools would otherwise cause them to disappear and be removed
   * from the DOM before you could do so.
   *
   * @type {Object}
   *
   * @see https://atomiks.github.io/tippyjs/v6/themes/#browser-devtools
   *   Loosely based on this.
   */
  this.debugPlugin = {
    name: 'debug',
    defaultValue: false,
    fn: function() { return {

      onCreate: function(instance) {

        if (!instance.props.debug) {
          return;
        }

        instance.setProps({
          hideOnClick:  false,
          trigger:      'click',
        });

      },

    }}
  };

  /**
   * Hide on escape Tippy.js plug-in.
   *
   * @type {Object}
   *
   * @see https://atomiks.github.io/tippyjs/v6/plugins/#hideonesc
   *   Loosely based on this but modified to use ally.js.
   *
   * @see https://allyjs.io/api/when/key.html
   */
  this.hideOnEscPlugin = {
    name: 'hideOnEsc',
    defaultValue: true,
    fn: function() {

      let handle;

      function watch(instance) {

        if (!instance.props.hideOnEsc) {
          return;
        }

        handle = ally.when.key({
          escape: function(event, disengage) {

            instance.hide();

            disengage();

          },
          // Using instance.popper or instance.reference won't work if the
          // tooltip doesn't contain anything focusable or if the reference
          // element is not itself focusable, respectively.
          context: document,
        });

      };

      function unwatch(instance) {

        if (
          !instance.props.hideOnEsc ||
          typeof handle === 'undefined'
        ) {
          return;
        }

        handle.disengage();

      };

      return {
        onShow: watch,
        onHide: unwatch,
        // In the unlikely case the tooltip is still open on destroy, this
        // ensures we clean up after ourselves by disengaging the handle.
        onDestroy: unwatch,
      };
    },
  };

  // /**
  //  * Hide on blur Tippy.js plug-in.
  //  *
  //  * @type {Object}
  //  *
  //  * @see https://atomiks.github.io/tippyjs/v6/plugins/#hideonpopperblur
  //  *   Loosely based on this.
  //  */
  // this.hideOnBlurPlugin = {
  //   name: 'hideOnBlur',
  //   defaultValue: true,
  //   fn: function() { return {
  //     // @todo
  //   }}
  // };

  // this.hideOnOutOfBoundsPlugin = {
  //   name: 'hideOnOutOfBounds',
  //   defaultValue: true,
  //   fn: function() { return {
  //     // @todo
  //   }}
  // };

  /**
   * Placement fallback Tippy.js plug-in.
   *
   * @type {Object}
   *
   * @see https://github.com/atomiks/tippyjs/blob/master/MIGRATION_GUIDE.md#if-you-were-using-flip-flipbehavior-or-fliponupdate
   *
   * @todo The Popper options don't see to take effect; maybe this is too late
   *   in the initialization? Try to get working.
   */
  this.placementFallbackPlugin = {
    name: 'placementFallback',
    defaultValue: false,
    fn: function() { return {

      onCreate: function(instance) {

        if (!instance.props.placementFallback) {
          return;
        }

        let fallbacks;

        if (typeof instance.props.placementFallback === 'string') {

          fallbacks = [instance.props.placementFallback];

        } else if (Array.isArray(instance.props.placementFallback)) {

          fallbacks = instance.props.placementFallback;

        } else {
          return;
        }

        instance.setProps($.extend(true, {}, instance.props, {
          popperOptions: {
            modifiers: [
              {
                name: 'flip',
                options: {fallbackPlacements: fallbacks},
              },
            ],
          },
        }));

      },

    }},
  };

  /**
   * Title attribute Tippy.js plug-in.
   *
   * @type {Object}
   *
   * @see https://atomiks.github.io/tippyjs/v6/faq/#can-i-use-the-attribute
   *   Loosely based on this, but adapted to use FastDom and jQuery.
   */
  this.titleAttributePlugin = {
    name: 'titleAttribute',
    defaultValue: true,
    fn: function() { return {
      onCreate: async function(instance) {

        if (!instance.props.titleAttribute) {
          return;
        }

        const $target = $(instance.reference);

        const title = await fastdom.measure(function() {
          return $target.attr('title');
        });

        if (typeof title === 'undefined') {
          return;
        }

        instance.setContent(title);

        await fastdom.mutate(function() {

          $target.attr('data-original-title', title).removeAttr('title');

        });

      },
      onDestroy: async function(instance) {

        if (!instance.props.titleAttribute) {
          return;
        }

        const $target = $(instance.reference);

        const title = await fastdom.measure(function() {
          return $target.attr('data-original-title');
        });

        if (typeof title === 'undefined') {
          return;
        }

        await fastdom.mutate(function() {

          $target.attr('title', title).removeAttr('data-original-title');

        });

      },
    };
  }};

  /**
   * Represents a delegated group of Tippy.js tooltips.
   */
  this.Tooltips = class {

    /**
     * The container or parent element wrapped in a jQuery collection.
     *
     * @type {jQuery}
     */
    #$container;

    /**
     * Tippy.js delegate instance we create.
     *
     * @type {Object}
     */
    #delegateInstance;

    /**
     * Tippy.js properties passed to its constructor.
     *
     * @type {Object}
     *
     * @see https://atomiks.github.io/tippyjs/v6/all-props/
     */
    #properties = {
      animation: 'shift-away',
      arrow: arrow,
      // Adding a slight delay helps to prevent the tooltips opening when moving
      // the pointer quickly over elements that are tooltip triggers unless the
      // pointer lingers/stops there. It's not a perfect solution as it doesn't
      // take pointer momentum into account like hoverIntent does, but it's
      // better than nothing.
      delay: [50, 0],
      inlinePositioning: true,
      // Similar to hoverIntent, these prevent interactive tooltips from hiding
      // if the pointer leaves the tooltip briefly. Note that unlike
      // hoverIntent, Tippy.js seems to consider any pointer movement outside
      // of the tooltip as contributing to the debounce, even if it's several
      // seconds, and will only stop the debounce once the pointer stops.
      interactiveBorder: 10, // px
      plugins: [
        aiTooltip.debugPlugin,
        aiTooltip.hideOnEscPlugin,
        aiTooltip.placementFallbackPlugin,
        aiTooltip.titleAttributePlugin,
      ],
      target: '[title]',
      placement: 'top',
      placementFallback: ['bottom', 'left', 'right'],
    };

    /**
     * Constructor.
     *
     * @param {jQuery|HTMLElement} $container
     *   A jQuery collection containing a single container element.
     *
     * @param {Object} properties
     *   Tippy.js properties to pass to its constructor. Merged on top of our
     *   defaults.
     */
    constructor($container, properties) {

      // Ensure this is a jQuery collection and that it contains only the first
      // element if passed a collection containing multiple elements.
      this.#$container = $($container).first();

      $.extend(true, this.#properties, properties);

      this.#delegateInstance = tippy.delegate(
        this.#$container[0], this.#properties,
      );

    }

    /**
     * Destroy this instance.
     */
    destroy() {

      this.#delegateInstance.destroy();

    }

    /**
     * Getter for the Tippy.js instance we create.
     *
     * @return {Object}
     */
    get tippy() {
      return this.#delegateInstance;
    }

  };

});
});
});
