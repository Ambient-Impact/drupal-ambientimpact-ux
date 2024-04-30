// -----------------------------------------------------------------------------
//   Ambient.Impact - UX - Tooltip debug component
// -----------------------------------------------------------------------------

AmbientImpact.onGlobals(['tippy.setDefaultProps'], function() {
AmbientImpact.addComponent('tooltipDebug', function(aiTooltipDebug, $) {

  'use strict';

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
          hideOnBlur:   false,
          hideOnClick:  false,
          trigger:      'click',
        });

      },

    }}
  };

  // Always push onto the existing plug-ins so we don't remove existing ones.
  tippy.defaultProps.plugins.push(this.debugPlugin);

  // Tippy.js needs to be informed of the changes.
  tippy.setDefaultProps({plugins: tippy.defaultProps.plugins});

});
});
