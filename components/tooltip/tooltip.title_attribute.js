// -----------------------------------------------------------------------------
//   Ambient.Impact - UX - Tooltip title attribute component
// -----------------------------------------------------------------------------

AmbientImpact.onGlobals(['tippy.setDefaultProps'], function() {
AmbientImpact.on(['fastdom'], function(aiFastDom) {
AmbientImpact.addComponent('tooltipTitleAttribute', function(
  aiTooltipTitleAttribute, $,
) {

  'use strict';

  /**
   * FastDom instance.
   *
   * @type {FastDom}
   */
  const fastdom = aiFastDom.getInstance();

  /**
   * Title attribute Tippy.js plug-in.
   *
   * @type {Object}
   *
   * @see https://atomiks.github.io/tippyjs/v6/faq/#can-i-use-the-attribute
   *   Loosely based on this, but adapted to use FastDom and jQuery.
   */
  this.titleAttributePlugin = {
    name: 'titleAttribute',
    defaultValue: true,
    fn: function() { return {
      onCreate: async function(instance) {

        if (!instance.props.titleAttribute) {
          return;
        }

        const $target = $(instance.reference);

        const title = await fastdom.measure(function() {
          return $target.attr('title');
        });

        if (typeof title === 'undefined') {
          return;
        }

        instance.setContent(title);

        await fastdom.mutate(function() {

          $target.attr('data-original-title', title).removeAttr('title');

        });

      },
      onDestroy: async function(instance) {

        if (!instance.props.titleAttribute) {
          return;
        }

        const $target = $(instance.reference);

        const title = await fastdom.measure(function() {
          return $target.attr('data-original-title');
        });

        if (typeof title === 'undefined') {
          return;
        }

        await fastdom.mutate(function() {

          $target.attr('title', title).removeAttr('data-original-title');

        });

      },
    };
  }};

  // Always push onto the existing plug-ins so we don't remove existing ones.
  tippy.defaultProps.plugins.push(this.titleAttributePlugin);

  // Tippy.js needs to be informed of the changes.
  tippy.setDefaultProps({plugins: tippy.defaultProps.plugins});

});
});
});
