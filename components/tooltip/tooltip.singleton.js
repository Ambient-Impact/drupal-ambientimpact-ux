// -----------------------------------------------------------------------------
//   Ambient.Impact - UX - Tooltip singleton component
// -----------------------------------------------------------------------------

AmbientImpact.onGlobals([
  'tippy.createSingleton',
  'tippy.setDefaultProps',
], function() {
AmbientImpact.addComponent('tooltipSingleton', function(aiTooltipSingleton, $) {

  'use strict';

  tippy.setDefaultProps({
    // Flag indicating whether the current instance is a singleton.
    isSingleton: false,
  });

  /**
   * The original (real) tippy.createSingleton().
   *
   * @type {Function}
   */
  const originalCreateSingleton = tippy.createSingleton;

  /**
   * Override tippy.createSingleton() so we can mark the instance as singleton.
   *
   * While there are a few ways we could infer an instance is a singleton in
   * a custom plug-in, there's no guarantee those heuristics won't change
   * without warning and break our detection. While not an ideal solution,
   * replacing tippy.createSingleton() with our own function allows us to know
   * exactly when an instance is a singleton, and mark all others as not a
   * singleton with certainty.
   *
   * @param {Object[]} instances
   *
   * @param {Object|undefined} properties
   *
   * @return {Object}
   */
  tippy.createSingleton = function(instances, properties) {

    if (typeof properties !== 'object') {
      properties = {};
    }

    // Always set the property before creating the singleton as doing so after
    // creating may foil plug-ins' attempts at knowing whether this is a
    // singleton if they do their check during their 'fn' function.
    properties.isSingleton = true;

    // For whatever reason, singleton breaks with inline positioning on, so
    // ensure it's off for the singleton itself.
    properties.inlinePositioning = false;

    return originalCreateSingleton(instances, properties);

  };

});
});
