// -----------------------------------------------------------------------------
//   Ambient.Impact - UX - Tooltip hide on out of bounds component
// -----------------------------------------------------------------------------

AmbientImpact.onGlobals(['tippy.setDefaultProps'], function() {
AmbientImpact.addComponent(
  'tooltipHideOnOutOfBounds',
function(aiTooltipHideOnOutOfBounds, $) {

  'use strict';

  /**
   * Hide on out of bounds Tippy.js plug-in.
   *
   * If enabled, this hides the tooltip if the reference element - i.e. the
   * trigger - is scrolled out of view while the tooltip is open.
   *
   * @type {Object}
   *
   * @see https://popper.js.org/docs/v2/modifiers/hide/
   *
   * @todo Is there a Popper event or other internal thing we can listen to
   *   instead of using a MutationObserver?
   */
  this.hideOnOutOfBoundsPlugin = {
    name: 'hideOnOutOfBounds',
    defaultValue: true,
    fn: function() {

      /**
       * A MutationObserver to watch for the reference hidden attribute.
       *
       * @type {MutationObserver}
       */
      let observer;

      /**
       * The attribute name to watch for.
       *
       * Tippy.js/Popper adds this when the reference is out of view
       * to .tippy-box
       *
       * @type {String}
       */
      const attributeName = 'data-reference-hidden';

      function watch(instance) {

        if (!instance.props.hideOnOutOfBounds) {
          return;
        }

        /**
         * The .tippy-box element wrapped in a jQuery collection.
         *
         * @type {jQuery}
         */
        const $tippyBox = $(instance.popper).find('.tippy-box');

        observer = new MutationObserver(function(mutations) {

          // If the attribute doesn't exist, it'll be undefined; if it does
          // exist, it won't be undefined but an empty string.
          if (typeof $tippyBox.attr(attributeName) !== 'undefined') {
            instance.hide();
          }

        });

        observer.observe($tippyBox[0], {
          attributes:       true,
          attributeFilter:  [attributeName],
        });

      };

      function unwatch(instance) {

        if (
          !instance.props.hideOnOutOfBounds ||
          typeof observer === 'undefined'
        ) {
          return;
        }

        observer.disconnect();

      };

      return {
        onShow: watch,
        onHide: unwatch,
        // In the unlikely case the tooltip is still open on destroy, this
        // ensures we clean up after ourselves by disconnecting the
        // MutationObserver.
        onDestroy: unwatch,
      };

    },

  };

  // Always push onto the existing plug-ins so we don't remove existing ones.
  tippy.defaultProps.plugins.push(this.hideOnOutOfBoundsPlugin);

  // Tippy.js needs to be informed of the changes.
  tippy.setDefaultProps({plugins: tippy.defaultProps.plugins});

});
});
