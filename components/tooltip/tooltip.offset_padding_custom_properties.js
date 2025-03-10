// -----------------------------------------------------------------------------
//   Ambient.Impact - UX - Tooltip offset padding custom properties component
// -----------------------------------------------------------------------------

// This enables the use of CSS custom properties in Tippy's/Popper's offset
// padding, which normally only accepts pixel values.

AmbientImpact.onGlobals(['tippy.setDefaultProps'], () => {
AmbientImpact.on(['fastdom', 'propertyToPixelConverter'], (
  aiFastDom, propertyToPixelConverter,
) => {
AmbientImpact.addComponent('tooltipOffsetPaddingCustomProperties', (
  component, $,
) => {

  'use strict';

  /**
   * CSS custom property defining offset padding on the block axis.
   *
   * @type {String}
   */
  const blockPropName = '--tooltip-offset-padding-block';

  /**
   * CSS custom property defining offset padding on the inline axis.
   *
   * @type {String}
   */
  const inlinePropName = '--tooltip-offset-padding-inline';

  /**
   * FastDom instance.
   *
   * @type {FastDom}
   */
  const fastdom = aiFastDom.getInstance();

  component.tippyPlugin = {
    name: 'offsetPaddingCustomProperties',
    defaultValue: true,
    fn: (instance) => {

      if (!instance.props.offsetPaddingCustomProperties) {
        return {};
      }

      const alterPopperValues = async (instance) => {

        const definedProperties = await fastdom.measure(() => {

          const computedStyle = getComputedStyle(instance.popper);

          const values = {};

          for (const propertyName of [blockPropName, inlinePropName]) {
            values[propertyName] = (computedStyle.getPropertyValue(
              propertyName,
            ) !== '');
          }

          return values;

        });

        const converter = propertyToPixelConverter.create($(instance.popper), [
          blockPropName,
          inlinePropName,
        ].filter((prop) => definedProperties[prop]));

        const values = await converter.getValues();

        const modifier = {
          name: 'preventOverflow',
          options: {
            padding: {},
          },
        };

        if (definedProperties[blockPropName] === true) {

          modifier.options.padding.top = Math.round(values[blockPropName]);

          modifier.options.padding.bottom = Math.round(values[blockPropName]);

        }

        if (definedProperties[inlinePropName] === true) {

          modifier.options.padding.left = Math.round(values[inlinePropName]);

          modifier.options.padding.right = Math.round(values[inlinePropName]);

        }

        instance.props.popperOptions.modifiers.push(modifier);

        instance.setProps(instance.props);

      };

      return {
        onMount: alterPopperValues,
      };

    },

  };

  // Always push onto the existing plug-ins so we don't remove existing ones.
  tippy.defaultProps.plugins.push(component.tippyPlugin);

  // Tippy.js needs to be informed of the changes.
  tippy.setDefaultProps({plugins: tippy.defaultProps.plugins});

});
});
});
