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

AmbientImpact.onGlobals(['tippy.setDefaultProps'], function() {
AmbientImpact.on(['fastdom'], function(aiFastDom) {
AmbientImpact.addComponent('tooltipShrinkwrap', function(component, $) {

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

  this.shrinkwrapPlugin = {
    name: 'shrinkwrap',
    defaultValue: true,
    fn: function(instance) {

      if (!instance.props.shrinkwrap) {
        return;
      }

      async function modify(instance) {

        const originalMoveTransition = instance.props.moveTransition;

        instance.setProps({moveTransition: ''});

        // Wait for a frame to be painted before proceeding to reduce the
        // chances of a move transition kicking in when we update the width.
        await new Promise(requestAnimationFrame);
        await new Promise(requestAnimationFrame);

        const $content = $(instance.popper).find('.tippy-content');

        const childNodes = $content[0].childNodes;

        // Return if we find more than one child node or the child node is not
        // a text node, as we don't yet support more complex use-cases.
        if (childNodes.length !== 1 || childNodes[0].nodeName !== '#text') {
          return;
        }

        const $textNode = $(childNodes[0]);

        await fastdom.mutate(function() {

          // Text nodes don't seem to support getBoundingClientRect() so we need
          // to wrap the text in an inline element that does support it.
          $textNode.wrap(`<span class="${measureElementClass}"></span>`);

        });

        const $measure = $textNode.parent();

        const measuredWidth = await fastdom.measure(function() {
          // Note that we always want to round up because rounding down will
          // cause additional wrapping in some cases, which we want to avoid.
          return Math.ceil($measure[0].getBoundingClientRect().width);
        });

        $content.width(measuredWidth);

        // Instruct Popper to update now rather than after the show transition
        // has finished. This fixes incorrect positioning due our resizing
        // during the show transition which then snaps to the correct
        // positioning when the transition finishes.
        //
        // @see https://popper.js.org/docs/v2/lifecycle/#manual-update
        instance.popperInstance.update();

        // Wait for a frame to be painted before restoring the original move
        // transition to hopefully avoid it kicking in.
        await new Promise(requestAnimationFrame);
        await new Promise(requestAnimationFrame);

        // This is literally all Tippy.js does when originally setting it.
        instance.popper.style.transition = originalMoveTransition;

      }

      async function unmodify(instance) {

        const $measure = $(instance.popper).find(`.${measureElementClass}`);

        if ($measure.length === 0) {
          return;
        }

        await fastdom.mutate(function() {

          $($measure[0].childNodes).unwrap();

          // Remove the explicit width.
          $(instance.popper).find('.tippy-content').css('width', '');

        });


      }

      return {
        onShow: async function(instance) {

          // Failsafe to undo our changes if there's any error while trying to
          // shrink-wrap. This significantly reduces the chances of broken
          // tooltips.
          try {
            await modify(instance);
          } catch (error) {

            await unmodify(instance);

            throw error;

          }

        },
        onHidden: unmodify,
      };

    },

  };

  // Always push onto the existing plug-ins so we don't remove existing ones.
  tippy.defaultProps.plugins.push(this.shrinkwrapPlugin);

  // Tippy.js needs to be informed of the changes.
  tippy.setDefaultProps({plugins: tippy.defaultProps.plugins});

});
});
});
