// -----------------------------------------------------------------------------
//   Ambient.Impact - UX - Tooltip hide on blur component
// -----------------------------------------------------------------------------

AmbientImpact.onGlobals(['tippy.setDefaultProps'], function() {
AmbientImpact.addComponent(
  'tooltipHideOnBlur',
function(aiTooltipHideOnBlur, $) {

  'use strict';

  /**
   * Hide on blur Tippy.js plug-in.
   *
   * This hides the tooltip if neither the reference element nor the tooltip
   * or any elements therein have focus on a focusout event.
   *
   * @type {Object}
   *
   * @see https://atomiks.github.io/tippyjs/v6/plugins/#hideonpopperblur
   *   Loosely based on this.
   */
  this.hideOnBlurPlugin = {
    name: 'hideOnBlur',
    defaultValue: true,
    fn: function(instance) {

      const $reference = $(instance.reference);

      const $tooltip = $(instance.popper);

      function focusOutHandler(event) {

        if (
          !instance.props.hideOnBlur ||
          $reference.is(event.relatedTarget) ||
          $reference.has(event.relatedTarget).length > 0 ||
          $tooltip.is(event.relatedTarget) ||
          $tooltip.has(event.relatedTarget).length > 0
        ) {
          return;
        }

        instance.hide();

      };

      return {
        onCreate: function() {

          $tooltip.on('focusout', focusOutHandler);

        },
        onDestroy: function() {

          // Probably not necessary but it's a good practice to clean up
          // handlers.
          $tooltip.off('focusout', focusOutHandler);

        },
      }
    }
  };

  // Always push onto the existing plug-ins so we don't remove existing ones.
  tippy.defaultProps.plugins.push(this.hideOnBlurPlugin);

  // Tippy.js needs to be informed of the changes.
  tippy.setDefaultProps({plugins: tippy.defaultProps.plugins});

});
});
