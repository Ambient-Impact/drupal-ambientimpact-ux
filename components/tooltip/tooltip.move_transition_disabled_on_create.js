// -----------------------------------------------------------------------------
//   Ambient.Impact - UX - Tooltip move transition disabled on create component
// -----------------------------------------------------------------------------

AmbientImpact.onGlobals(['tippy.setDefaultProps'], function() {
AmbientImpact.addComponent('tooltipMoveTransitionDisabledOnCreate', function(
  aiTooltipMoveTransitionDisabledOnCreate, $,
) {

  'use strict';

  /**
   * Move transition disable on create Tippy.js plug-in.
   *
   * This works around an issue with the moveTransition property which can
   * cause it to be applied when first creating the tooltip. We fix that by
   * removing the property (if it's set) on create, and then restoring it once
   * the tooltip has been shown and all transforms are applied.
   *
   * @type {Object}
   *
   * @see https://github.com/atomiks/tippyjs/issues/1133
   *   Bug describing a similar issue but only when minifying.
   *
   * @see https://github.com/atomiks/tippyjs/issues/168
   *   Old issue from the 2.x series also describing a similar issue.
   *
   * @todo Can this first check if the transition contains 'transform' and avoid
   *   doing anything if it doesn't? Right now it assumes the transition is
   *   applied to the transform style property.
   */
  this.moveTransitionDisabledOnCreatePlugin = {
    name: 'moveTransitionDisabledOnCreate',
    defaultValue: true,
    fn: function(instance) {

      if (
        // Don't do anything if the instance is a singleton since it doesn't
        // need fixing and will actually break it if we try to.
        instance.props.isSingleton ||
        !instance.props.moveTransitionDisabledOnCreate ||
        // If there's no move transition set, there's no point in registering
        // callbacks.
        instance.props.moveTransition === ''
      ) {
        return {};
      }

      /**
       * The original moveTransition property when created.
       *
       * @type {String}
       */
      let originalMoveTransition;

      /**
       * Whether we need to restore the stored movedTransition.
       *
       * @type {Boolean}
       */
      let needsRestore = true;

      async function restore(event) {

        // Wait for a frame to be painted before restoring the moveTransition.
        // This is necessary so that any changes to transform are already made
        // to avoid the transition kicking in. Also note that we have to
        // request twice because the first time only queues to the start of the
        // next frame, but that frame will not have been painted yet, so we
        // have to request a second time to wait until the start of the next
        // frame after that.
        await new Promise(requestAnimationFrame);
        await new Promise(requestAnimationFrame);

        // This is literally all Tippy.js does when originally setting it.
        instance.popper.style.transition = originalMoveTransition;

      };

      function onCreate() {

        originalMoveTransition = instance.props.moveTransition;

        instance.setProps({moveTransition: ''});

      };

      function onShown() {

        if (needsRestore === false) {
          return;
        }

        // Note that this doesn't set the style property until the next time the
        // tooltip is shown, so...
        instance.setProps({moveTransition: originalMoveTransition});

        // ...we have to restore it manually just this once, but we have to wait
        // until transitions have finished to avoid triggering a new transition.
        instance.popper.addEventListener(
          'transitionend', restore, {once: true},
        );

        needsRestore = false;

      }

      return {
        onCreate: onCreate,
        onShown: onShown,
      };

    },

  };

  // Always push onto the existing plug-ins so we don't remove existing ones.
  tippy.defaultProps.plugins.push(this.moveTransitionDisabledOnCreatePlugin);

  // Tippy.js needs to be informed of the changes.
  tippy.setDefaultProps({plugins: tippy.defaultProps.plugins});

});
});
