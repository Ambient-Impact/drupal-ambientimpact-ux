// -----------------------------------------------------------------------------
//   Ambient.Impact - UX - Tooltip component demo
// -----------------------------------------------------------------------------

AmbientImpact.on(['tooltip'], function(aiTooltip) {
AmbientImpact.addComponent('tooltipDemo', function(aiTooltipDemo, $) {

  'use strict';

  this.addBehaviour(
    'AmbientImpactTooltipDemo',
    'ambientimpact-tooltip-demo',
    '.ambientimpact-component-demo',
    function(context, settings) {

      aiTooltip.create(this, {
        tippy: {
          target: '[title]',
        },
      });

    },
    function(context, settings, trigger) {

      aiTooltip.destroy(this);

    }
  );

});
});
