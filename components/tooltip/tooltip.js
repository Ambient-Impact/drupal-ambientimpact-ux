// -----------------------------------------------------------------------------
//   Ambient.Impact - UX - Tooltip component
// -----------------------------------------------------------------------------

AmbientImpact.onGlobals([
  'tippy.delegate',
  'tippy.setDefaultProps',
], function() {
AmbientImpact.addComponent('tooltip', function(aiTooltip, $) {

  'use strict';

  /**
   * Modified version of tippy.roundArrow to add a 2 pixel bleed at the bottom.
   *
   * This is intended to fix sub-pixel rendering issues where gaps can show up
   * due to the various transforms used.
   *
   * @type {String}
   */
  const arrow = '<svg width="16" height="8" xmlns="http://www.w3.org/2000/svg"><path d="M 8 0 C 6.9300011 0.005999994 5.8509207 0.89976711 4.6699219 2.3847656 C 1.7959247 5.986762 0 6 0 6 L 0 8 L 16 8 L 16 6 C 16 6 14.233747 6.004762 11.34375 2.3847656 C 10.148751 0.88676712 9.0699989 -0.005999994 8 0 z "></svg>';

  tippy.setDefaultProps({
    arrow: arrow,
    // Adding a slight delay helps to prevent the tooltips opening when moving
    // the pointer quickly over elements that are tooltip triggers unless the
    // pointer lingers/stops there. It's not a perfect solution as it doesn't
    // take pointer momentum into account like hoverIntent does, but it's
    // better than nothing.
    delay: [50, 0],
    // This chooses the position of the tooltip based on the closest text
    // fragment when text wraps over more than one line.
    //
    // @see https://atomiks.github.io/tippyjs/v6/all-props/#inlinepositioning
    inlinePositioning: true,
    // Similar to hoverIntent, this and interactiveDebounce prevent interactive
    // tooltips from hiding if the pointer leaves the tooltip briefly. Note
    // that unlike hoverIntent, Tippy.js seems to consider any pointer movement
    // outside of the tooltip as contributing to the interactiveDebounce, even
    // if it's several seconds, and will only stop the debounce once the
    // pointer stops; because of that, the property is not currently used, with
    // just interactiveBorder used.
    interactiveBorder: 10, // px
  });

  /**
   * Represents a single, non-delegated Tippy.js instance.
   */
  this.Tooltip = class {

    /**
     * A jQuery collection containing one or more target elements.
     *
     * @type {jQuery}
     */
    #$targets;

    /**
     * Tippy.js instances we create.
     *
     * @type {Object[]}
     */
    #tippy;

    /**
     * Constructor.
     *
     * @param {jQuery|HTMLElement} $targets
     *   A jQuery collection containing one or more target elements.
     *
     * @param {Object} properties
     *   Tippy.js properties to pass to its constructor. Merged on top of our
     *   defaults.
     */
    constructor($targets, properties) {

      // Ensure this is a jQuery collection if passed an HTMLElement.
      this.#$targets = $($targets);

      this.#tippy = tippy(this.#$targets.toArray(), properties);

    }

    /**
     * Destroy this instance.
     */
    destroy() {

      this.#tippy.destroy();

    }

    /**
     * Getter for the Tippy.js instances we create.
     *
     * @return {Object[]}
     */
    get tippy() {
      return this.#tippy;
    }

  }

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

      this.#delegateInstance = tippy.delegate(
        this.#$container[0], properties,
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
