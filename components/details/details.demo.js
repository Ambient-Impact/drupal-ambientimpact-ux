// -----------------------------------------------------------------------------
//   Ambient.Impact - UX - Details component demo
// -----------------------------------------------------------------------------

AmbientImpact.on(['details'], function(aiDetails) {
AmbientImpact.addComponent('detailsDemo', function(aiDetailsDemo, $) {

  'use strict';

  this.addBehaviour(
    'AmbientImpactDetailsDemo',
    // Themes should use this same once() name to avoid attaching this twice.
    'ambientimpact-details-animated',
    '.ambientimpact-component-demo details:not(.details--demo-not-animated)',
    function(context, settings) {

      $(this).prop('AmbientImpactDetails', new aiDetails.Details(this));

    },
    function(context, settings, trigger) {

      /**
       * Reference to the HTML element being detached from.
       *
       * @type {HTMLElement}
       */
      const that = this;

      $(this).prop('AmbientImpactDetails').destroy().then(function() {

        $(that).removeProp('AmbientImpactDetails');

      });

    }
  );

});
});
