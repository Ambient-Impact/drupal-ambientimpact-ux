// -----------------------------------------------------------------------------
//   Ambient.Impact - UX - Tooltip component demo
// -----------------------------------------------------------------------------

AmbientImpact.on(['tooltip'], function(aiTooltip) {
AmbientImpact.addComponent('tooltipDemo', function(aiTooltipDemo, $) {

  'use strict';

  this.addBehaviour(
    'AmbientImpactTooltipDemo',
    'ambientimpact-tooltip-demo',
    '.ambientimpact-component-demo__content',
    function(context, settings) {

      $(this).prop(
        'AmbientImpactTooltips',
        new aiTooltip.Tooltips(this),
      );

    },
    function(context, settings, trigger) {

      $(this).prop('AmbientImpactTooltips').destroy();

      $(this).removeProp('AmbientImpactTooltips');

    }
  );

});
});
