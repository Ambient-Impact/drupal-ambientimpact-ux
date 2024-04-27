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
        new aiTooltip.Tooltips(this, {target: '[title]'}),
      );

      $(this).prop('AmbientImpactTooltipsHtml', new aiTooltip.Tooltips(
        this, {target: '[data-tippy-htmlContentAttribute]'},
      ));

    },
    function(context, settings, trigger) {

      $(this).prop('AmbientImpactTooltipsHtml').destroy();

      $(this).removeProp('AmbientImpactTooltipsHtml');

      $(this).prop('AmbientImpactTooltips').destroy();

      $(this).removeProp('AmbientImpactTooltips');

    }
  );

});
});
