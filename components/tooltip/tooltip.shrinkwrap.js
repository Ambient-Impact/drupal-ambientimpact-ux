// -----------------------------------------------------------------------------
//   Ambient.Impact - UX - Tooltip shrink-wrap component
// -----------------------------------------------------------------------------

// This attempts to shrink the tooltip content container to the text bounding
// box to avoid empty space when text wraps. Because of how CSS calculates
// dimensions, a container doesn't know where its children wrap their text, so
// it doesn't seem possible at the time of writing to implement a CSS-only
// solution, even using CSS Grid Layout.
//
// Note that this currently only handles cases where a single text node is the
// only child node of the content container. Attempting to calculate the
// bounding boxes of more complex content is much more difficult. Additionally,
// the places where this problem is most pronounced is in cases with a short
// amount of text, such as in abbreviations; these also tend to be a few words
// of plain text.
//
// @see https://stackoverflow.com/a/37413580

AmbientImpact.onGlobals(['tippy.setDefaultProps'], () => {
AmbientImpact.on(['fastdom'], (aiFastDom) => {
AmbientImpact.addComponent('tooltipShrinkwrap', (component, $) => {

  'use strict';

  /**
   * FastDom instance.
   *
   * @type {FastDom}
   */
  const fastdom = aiFastDom.getInstance();

  /**
   * Class identifying the measure element that wraps text nodes.
   *
   * @type {String}
   */
  const measureElementClass = 'tippy-shrink-wrap-measure';

  component.shrinkwrapPlugin = {
    name: 'shrinkwrap',
    defaultValue: true,
    fn: (instance) => {

      if (
        !instance.props.shrinkwrap ||
        // We don't currently support singletons because the current
        // implementation ends up setting the inline width only when the
        // singleton is shown and keeps that same fixed width when it moves to
        // another trigger. Even if we adapt this to update on moving, it may
        // be potentially difficult to have it transition to new shrink-wrapped
        // width from a previous one.
        instance.props.isSingleton === true
      ) {
        return {};
      }

      /**
       * Prevents visible transitions or layout jumps on the Popper element.
       *
       * This is necessary when making changes during the show phase because
       * we aren't always able to prevent a frame or two being painted before
       * we make our changes, resulting in the tooltip visibly moving.
       *
       * @param {Tippy} instance
       */
      const lock = async (instance) => {

        await fastdom.mutate(() => {

          $(instance.popper).css({
            'opacity': 0,
            '--tooltip-move-transition': 'none',
          });

        });

      }

      /**
       * Unlock transitions and opacity on the Popper element.
       *
       * @param {Tippy} instance
       */
      const unlock = async (instance) => {

        await fastdom.mutate(() => {

          $(instance.popper).css({
            'opacity': '',
            '--tooltip-move-transition': '',
          });

        });

      }

      const modify = async (instance) => {

        await lock(instance);

        /**
         * .tippy-box clone for measuring without transforms applied.
         *
         * We need a clone that doesn't have transforms applied from animations
         * to get accurate dimensions. Certain animations - especially the
         * 'extreme' variants - result in measurements that are wildly off
         * because we're reading the actual dimensions relative to the viewport
         * with transforms at that point in time.
         *
         * @type {jQuery}
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
         *   Note "information about the size of an element and its position
         *   relative to the viewport."
         */
        const $boxClone = $(instance.popper).find('> .tippy-box').clone();

        $boxClone
        .attr({
          'data-animation': 'none',
          'data-state':     'hidden',
        })
        .css({
          'position':             'absolute',
          'transition-duration':  '0s',
          'transition-property':  'none',
        });

        const $content = $(instance.popper).find('.tippy-content');

        const childNodes = $boxClone.find('.tippy-content')[0].childNodes;

        // Return if we find more than one child node or the child node is not
        // a text node, as we don't yet support more complex use-cases.
        if (childNodes.length !== 1 || childNodes[0].nodeName !== '#text') {

          await unlock(instance);

          return;

        }

        await fastdom.mutate(() => {
          $(instance.popper).append($boxClone);
        });

        const $textNode = $(childNodes[0]);

        await fastdom.mutate(() => {

          // Text nodes don't seem to support getBoundingClientRect() so we need
          // to wrap the text in an inline element that does support it.
          $textNode.wrap(`<span class="${measureElementClass}"></span>`);

        });

        const $measure = $textNode.parent();

        const measuredWidth = await fastdom.measure(() => {
          // Note that we always want to round up because rounding down will
          // cause additional wrapping in some cases, which we want to avoid.
          return Math.ceil($measure[0].getBoundingClientRect().width);
        });

        await fastdom.mutate(() => {

          $boxClone.remove();

          $content.width(measuredWidth);

        });

        // Instruct Popper to update now rather than after the show transition
        // has finished. This fixes incorrect positioning due our resizing
        // during the show transition which then snaps to the correct
        // positioning when the transition finishes.
        //
        // @see https://popper.js.org/docs/v2/lifecycle/#manual-update
        await instance.popperInstance.update();

        await unlock(instance);

      }

      const unmodify = async (instance) => {

        const $measure = $(instance.popper).find(`.${measureElementClass}`);

        // Unwrap if we can find the measure. Note that we have to continue past
        // this without returning here in case this is called to catch a failure
        // state where the content may have not have been wrapped but an inline
        // width was still applied.
        if ($measure.length > 0) {

          await fastdom.mutate(() => {
            $($measure[0].childNodes).unwrap();
          });

        }

        // Remove the explicit width if found.
        await fastdom.mutate(() => {
          $(instance.popper).find('.tippy-content').css('width', '');
        });

        await unlock(instance);

      }

      return {
        // This should catch any errors while modifying and undo modifications
        // before throwing the error that was received.
        //
        // A notable example of this is in rare cases when moving the pointer
        // rapidly across trigger elements, you'll get:
        //
        // TypeError: can't access property "update", instance.popperInstance is
        // null
        //
        // @see https://stackoverflow.com/questions/33562284/how-do-i-catch-thrown-errors-with-async-await
        onShow: (instance) => modify(instance).catch(async (reason) => {

          await unmodify(instance);

          throw reason;

        }),
        onHidden: unmodify,
      };

    },

  };

  // Always push onto the existing plug-ins so we don't remove existing ones.
  tippy.defaultProps.plugins.push(component.shrinkwrapPlugin);

  // Tippy.js needs to be informed of the changes.
  tippy.setDefaultProps({plugins: tippy.defaultProps.plugins});

});
});
});
