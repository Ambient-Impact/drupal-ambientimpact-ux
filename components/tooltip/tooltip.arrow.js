// -----------------------------------------------------------------------------
//   Ambient.Impact - UX - Tooltip arrow component
// -----------------------------------------------------------------------------

AmbientImpact.onGlobals(['tippy.setDefaultProps'], () => {
AmbientImpact.addComponent('tooltipArrow', (component, $) => {

  'use strict';

  /**
   * Modified version of tippy.roundArrow to add a 6 pixel bleed at the bottom.
   *
   * This is intended to fix sub-pixel rendering issues where gaps can show up
   * due to the various transforms used.
   *
   * @type {String}
   */
  const arrow = '<svg width="16" height="12" xmlns="http://www.w3.org/2000/svg"><path d="M8 .19c-1.07.005-2.15.878-3.33 2.328C1.796 6.034 0 6.048 0 6.048V12h16V6.047s-1.766.005-4.656-3.53C10.149 1.056 9.07.185 8 .19Z"/></svg>';

  tippy.setDefaultProps({arrow: arrow});

});
});
