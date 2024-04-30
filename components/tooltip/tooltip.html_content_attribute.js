// -----------------------------------------------------------------------------
//   Ambient.Impact - UX - Tooltip HTML content from attribute component
// -----------------------------------------------------------------------------

AmbientImpact.onGlobals(['tippy.setDefaultProps'], function() {
AmbientImpact.on(['fastdom'], function(aiFastDom) {
AmbientImpact.addComponent(
  'tooltipHtmlContentAttribute',
function(aiTooltipHtmlContentAttribute, $) {

  'use strict';

  /**
   * FastDom instance.
   *
   * @type {FastDom}
   */
  const fastdom = aiFastDom.getInstance();

  /**
   * HTML content from attribute Tippy.js plug-in.
   *
   * This safely parses and unescapes HTML entities from a specified attribute
   * and sets it as the Tippy.js content, setting {allowHTML: true} once it's
   * done so.
   *
   * @type {Object}
   *
   * @see https://developer.mozilla.org/en-US/docs/Glossary/Cross-site_scripting
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString
   *
   * @see https://atomiks.github.io/tippyjs/v6/html-content/
   *
   * @see https://atomiks.github.io/tippyjs/v6/all-props/#allowhtml
   */
  this.htmlContentAttributePlugin = {
    name: 'htmlContentAttribute',
    defaultValue: false,
    fn: function(instance) {

      if (
        !instance.props.htmlContentAttribute ||
        typeof instance.props.htmlContentAttribute !== 'string' ||
        instance.props.htmlContentAttribute.length === 0
      ) {
        return {};
      }

      async function onCreate() {

        const $target = $(instance.reference);

        const attributeValue = await fastdom.measure(function() {
          return $target.attr(instance.props.htmlContentAttribute);
        });

        if (
          typeof attributeValue !== 'string' ||
          attributeValue.trim().length === 0
        ) {
          return;
        }

        const parsedDocument = new DOMParser().parseFromString(
          attributeValue, 'text/html',
        );

        const parsedHtml = $(parsedDocument).text();

        if (parsedHtml.trim().length === 0) {
          return;
        }

        // Only auto enable the allowHTML property if we've gotten this far and
        // determined that there's HTML content to be shown.
        instance.setProps({allowHTML: true});

        instance.setContent(parsedHtml);

      };

      return {
        onCreate: onCreate,
      };

    },
  };

  // Always push onto the existing plug-ins so we don't remove existing ones.
  tippy.defaultProps.plugins.push(this.htmlContentAttributePlugin);

  // Tippy.js needs to be informed of the changes.
  tippy.setDefaultProps({plugins: tippy.defaultProps.plugins});

});
});
});
