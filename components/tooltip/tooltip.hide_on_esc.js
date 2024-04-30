// -----------------------------------------------------------------------------
//   Ambient.Impact - UX - Tooltip hide on ESC component
// -----------------------------------------------------------------------------

AmbientImpact.onGlobals([
  'ally.when.key',
  'tippy.setDefaultProps',
], function() {
AmbientImpact.addComponent('tooltipHideOnEsc', function(aiTooltipHideOnEsc, $) {

  'use strict';

  /**
   * Hide on ESC Tippy.js plug-in.
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

  // Always push onto the existing plug-ins so we don't remove existing ones.
  tippy.defaultProps.plugins.push(this.hideOnEscPlugin);

  // Tippy.js needs to be informed of the changes.
  tippy.setDefaultProps({plugins: tippy.defaultProps.plugins});

});
});
