// -----------------------------------------------------------------------------
//   Ambient.Impact - UX - Tooltip events component
// -----------------------------------------------------------------------------

AmbientImpact.onGlobals(['tippy.setDefaultProps'], function() {
AmbientImpact.addComponent(
  'tooltipEvents',
function(aiTooltipEvents, $) {

  'use strict';

  /**
   * Trigger a specified event for a tooltip.
   *
   * @param {String} eventName
   *   The event name to trigger.
   *
   * @param {Object} instance
   *   The Tippy.js instance to trigger the event for.
   *
   * @param {Object|undefined} data
   *   Additional event data to pass to event subscribers as an object of key/
   *   value pairs, or undefined.
   *
   * @param {true|undefined} cancellable
   *   Either true if the event can be cancelled (see Tippy.js documentation),
   *   or undefined if not.
   *
   * @return {bool|undefined}
   *   A boolean true or false from event.isDefaultPrevented() if the event is
   *   cancellable; if the event is not cancellable, does not return a value.
   */
  function triggerEvent(eventName, instance, data, cancellable) {

    if (!$.isPlainObject(data)) {
      data = {};
    }

    data.instance = instance;

    /**
     * The event object we'll trigger.
     *
     * @type {jQuery.Event}
     *
     * @see https://api.jquery.com/category/events/event-object/
     */
    const event = $.Event(eventName, data);

    // The event is triggered on the reference element rather than the tooltip
    // because the tooltip isn't always attached to the DOM and so the event
    // won't bubble, meaning that you wouldn't be able to bind an event to a
    // container element and have it reliably trigger for all events.
    $(instance.reference).trigger(event);

    if (cancellable === true) {
      return event.isDefaultPrevented();
    }

  }

  /**
   * Event Tippy.js plug-in; triggers events for all hooks.
   *
   * This maps all the known Tippy.js lifecycle hooks to events that are
   * triggered on the reference element. Events are triggered on the reference
   * element rather than the tooltip because for many of these, the tooltip
   * element is not attached to the DOM at the time the hook is invoked and so
   * it wouldn't be possible to rely on event bubbling via listening on a
   * container element.
   *
   * @type {Object}
   *
   * @see https://atomiks.github.io/tippyjs/v6/all-props/
   *   Lists all lifecycle hooks, what additional data they provide, and which
   *   are cancellable.
   */
  this.eventsPlugin = {
    name: 'events',
    defaultValue: true,
    fn: function(instance) {

      if (!instance.props.events) {
        return {};
      }

      return {
        onAfterUpdate: function(instance, partialProps) {
          triggerEvent('tooltipAfterUpdate', instance, {
            partialProps: partialProps,
          });
        },
        onBeforeUpdate: function(instance, partialProps) {
          triggerEvent('tooltipBeforeUpdate', instance, {
            partialProps: partialProps,
          });
        },
        onClickOutside: function(instance, event) {
          triggerEvent('tooltipClickOutside', instance, {
            originalEvent: event,
          });
        },
        onCreate: function(instance) {
          triggerEvent('tooltipCreate', instance);
        },
        onDestroy: function(instance) {
          triggerEvent('tooltipDestroy', instance);
        },
        onHidden: function(instance) {
          triggerEvent('tooltipHidden', instance);
        },
        onHide: function(instance) {
          return triggerEvent('tooltipHide', instance, {}, true);
        },
        onMount: function(instance) {
          triggerEvent('tooltipMount', instance);
        },
        onShow: function(instance) {
          return triggerEvent('tooltipShow', instance, {}, true);
        },
        onShown: function(instance) {
          triggerEvent('tooltipShown', instance);
        },
        onTrigger: function(instance, event) {
          triggerEvent('tooltipTrigger', instance, {
            originalEvent: event,
          });
        },
        onUntrigger: function(instance, event) {
          triggerEvent('tooltipUntrigger', instance, {
            originalEvent: event,
          });
        },
      };

    },
  };

  // Always push onto the existing plug-ins so we don't remove existing ones.
  tippy.defaultProps.plugins.push(this.eventsPlugin);

  // Tippy.js needs to be informed of the changes.
  tippy.setDefaultProps({plugins: tippy.defaultProps.plugins});

});
});
