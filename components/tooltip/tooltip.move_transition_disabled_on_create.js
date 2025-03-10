// -----------------------------------------------------------------------------
//   Ambient.Impact - UX - Tooltip move transition disabled on create component
// -----------------------------------------------------------------------------

AmbientImpact.onGlobals(['tippy.setDefaultProps'], function() {
AmbientImpact.on(['fastdom'], function(aiFastDom) {
AmbientImpact.addComponent('tooltipMoveTransitionDisabledOnCreate', function(
  aiTooltipMoveTransitionDisabledOnCreate, $,
) {

  'use strict';

  /**
   * CSS custom property name for the move transition.
   *
   * @type {String}
   */
  const customPropName = '--tooltip-move-transition';

  /**
   * FastDom instance.
   *
   * @type {FastDom}
   */
  const fastdom = aiFastDom.getInstance();

  tippy.setDefaultProps({

    // Allows tooltip transitions to be defined via CSS. If this needs to be
    // overridden per-tooltip, setting --tooltip-move-transition based on a
    // class or theme in CSS is recommended rather than changing moveTransition
    // directly.
    moveTransition: `var(${customPropName})`,

  });

  /**
   * Move transition disable on create Tippy.js plug-in.
   *
   * This works around an issue with the moveTransition property which can
   * cause it to be applied when first creating the tooltip. We fix that by
   * setting the custom property value to 'none' on create, and then removing it
   * once the tooltip has been shown and all transforms are applied.
   *
   * @type {Object}
   *
   * @see https://github.com/atomiks/tippyjs/issues/1133
   *   Bug describing a similar issue but only when minifying.
   *
   * @see https://github.com/atomiks/tippyjs/issues/168
   *   Old issue from the 2.x series also describing a similar issue.
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
       * Whether we need to remove our inline custom propertys.
       *
       * @type {Boolean}
       */
      let needsRestore = true;

      /**
       * Popper.js modifier to disable move transition as early as possible.
       *
       * @type {Object}
       *
       * @see https://popper.js.org/docs/v2/modifiers/#custom-modifiers
       */
      const modifier = {
        name:     'tooltipMoveTransitionDisabledOnCreate',
        enabled:  true,
        // Same phase as Popper's applyStyles modifier.
        //
        // @see https://github.com/floating-ui/floating-ui/blob/v2.x/src/modifiers/applyStyles.js
        phase:    'write',
        // Run after Popper's applyStyles modifier. While not completely
        // necessary, this could keep things more predictable.
        requires: ['applyStyles'],
        effect:   (modifierArgs) => {

          if (needsRestore === false) {
            return;
          }

          // Not using FastDom here as it's already in a write phase, albeit
          // Popper's.
          //
          // Also note that we're not relying directly on applyStyles applying
          // this for us because it doesn't seem to work as intended even if we
          // set it to modifierArgs.state.styles.popper along with
          // a 'beforeWrite' phase set, for some odd reason.
          $(modifierArgs.state.elements.popper).css(customPropName, 'none');

        },
        fn: (modifierArgs) => {},
      };

      async function onCreate() {

        if (!('modifiers' in instance.props.popperOptions)) {
          instance.props.popperOptions.modifiers = [];
        }

        instance.props.popperOptions.modifiers.push(modifier);

        instance.setProps(instance.props);

      };

      async function onShown() {

        if (needsRestore === false) {
          return;
        }

        // Wait for a frame to be painted before removing
        // --tooltip-move-transition. This is necessary so that any changes to
        // transform are already made to avoid the transition kicking in. Also
        // note that we have to request twice because the first time only
        // queues to the start of the next frame, but that frame will not have
        // been painted yet, so we have to request a second time to wait until
        // the start of the next frame after that.
        await new Promise(requestAnimationFrame);
        await new Promise(requestAnimationFrame);

        await fastdom.mutate(function() {

          $(instance.popper).css({
            '--tooltip-move-transition': '',
          });

        });

        needsRestore = false;

      }

      return {
        onCreate: onCreate,
        onShown:  onShown,
      };

    },

  };

  // Always push onto the existing plug-ins so we don't remove existing ones.
  tippy.defaultProps.plugins.push(this.moveTransitionDisabledOnCreatePlugin);

  // Tippy.js needs to be informed of the changes.
  tippy.setDefaultProps({plugins: tippy.defaultProps.plugins});

});
});
});
