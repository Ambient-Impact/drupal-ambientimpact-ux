// -----------------------------------------------------------------------------
//   Ambient.Impact - UX - Details component
// -----------------------------------------------------------------------------

// @see https://css-tricks.com/how-to-animate-the-details-element/
//
// @see https://codepen.io/chriscoyier/pen/XWNqxyY
//   Adapted from this.

AmbientImpact.onGlobals([
  'document.documentElement.animate',
  'Motion.animate',
], function() {
AmbientImpact.on(['fastdom'], function(aiFastDom) {
AmbientImpact.addComponent('details', function(aiDetails, $) {

  'use strict';

  /**
   * Event namespace name.
   *
   * @type {String}
   */
  const eventNamespace = this.getName();

  /**
   * FastDom instance.
   *
   * @type {FastDom}
   */
  const fastdom = aiFastDom.getInstance();

  /**
   * The base BEM class for the details element and all child/state classes.
   *
   * @type {String}
   */
  const baseClass = 'details-animated';

  /**
   * The BEM modifier class for when the details is in the process of opening.
   *
   * @type {String}
   */
  const openingClass = `${baseClass}--opening`;

  /**
   * The BEM modifier class for when the details is in the process of closing.
   *
   * @type {String}
   */
  const closingClass = `${baseClass}--closing`;

  /**
   * Represents a <details> element.
   */
  this.Details = class {

    /**
     * The details element wrapped in a jQuery collection.
     *
     * @type {jQuery}
     */
    #$details;

    /**
     * The summary element wrapped in a jQuery collection.
     *
     * @type {jQuery}
     */
    #$summary;

    /**
     * The content wrapper element wrapped in a jQuery collection.
     *
     * @type {jQuery}
     */
    #$content;

    /**
     * Currently running animation controls or null if none is running.
     *
     * @type {AnimationControls|null}
     *
     * @see https://motion.dev/dom/controls
     */
    #animation = null;

    /**
     * Whether the details is currently in the process of closing.
     *
     * @type {Boolean}
     */
    #isClosing = false;

    /**
     * Whether the details is currently in the process of opening.
     *
     * @type {Boolean}
     */
    #isOpening = false;

    /**
     * Open and close animation duration in seconds.
     *
     * @type {Number}
     *
     * @see https://motion.dev/guides/waapi-improvements#durations-as-seconds
     */
    #animationDuration = 0.2;

    /**
     * Open and close animation easing.
     *
     * @type {String}
     *
     * @see https://motion.dev/dom/animate#easing
     */
    #animationEasing = 'ease-out';

    /**
     * Constructor.
     *
     * @param {jQuery|HTMLElement} $details
     *   A single <details> element wrapped in a jQuery collection or as an
     *   HTMLElement.
     */
    constructor($details) {

      this.#$details = $($details).first();

      this.#$summary = this.#$details.find('> summary').first();

      // Drupal adds a wrapper around the content for us. Thanks Drupal!
      this.#$content = this.#$details.find('> .details-wrapper').first();

      /**
       * Reference to the current instance.
       *
       * @type {this}
       */
      const that = this;

      fastdom.mutate(function() {

        that.#$details.addClass(baseClass);

      }).then(function() {

        that.#bindEventHandlers();

      });

    }

    /**
     * Destroy this instance.
     *
     * @return {Promise}
     *   A Promise that resolves when various DOM tasks are complete.
     */
    destroy() {

      this.#unbindEventHandlers();

      /**
       * Reference to the current instance.
       *
       * @type {this}
       */
      const that = this;

      return fastdom.mutate(function() {

        that.#$details.removeClass([baseClass, openingClass, closingClass]);

      });

    }

    /**
     * Bind all of our event handlers.
     *
     * @see this~#unbindEventHandlers()
     */
    #bindEventHandlers() {

      this.#$summary.on(`click.${eventNamespace}`, {
        // Pass the current instance to the event handler because 'this' will be
        // the clicked element in that context.
        that: this,
      }, this.#clickHandler);

    }

    /**
     * Unbind all of our event handlers.
     *
     * @see this~#bindEventHandlers()
     */
    #unbindEventHandlers() {

      this.#$summary.off(`click.${eventNamespace}`, this.#clickHandler);

    }

    /**
     * Summary click event handler.
     *
     * @param {jQuery.Event} event
     *   The event object.
     *
     * @throws If there was an error in the toggle() method.
     */
    #clickHandler(event) {

      try {

        event.data.that.toggle();

      // If there was an error, re-throw it here to halt execution so we don't
      // prevent the default browser behaviour.
      } catch (error) {
        throw error;
      }

      event.preventDefault();

    }

    /**
     * Perform tasks when an open or close animation has finished successfully.
     *
     * @param {Boolean} open
     *   Value to set the 'open' property (not attribute) on the details element
     *   to.
     *
     * @return {Promise}
     *   A Promise that resolves when various DOM tasks are complete.
     */
    #animationEndTasks(open) {

      /**
       * Reference to the current instance.
       *
       * @type {this}
       */
      const that = this;

      return fastdom.mutate(function() {

        if (that.#isOpening === true) {

          that.#$details.prop('open', true);

        } else if (that.#isClosing === true) {

          that.#$details.prop('open', false);

        }

        that.#animation = null;

        that.#isOpening = false;

        that.#isClosing = false;

        that.#$details.css('height', '').removeClass([
          openingClass, closingClass,
        ]);

      });

    }

    /**
     * Perform tasks to start opening the details element.
     *
     * @return {Promise}
     *   A Promise that resolves when various DOM tasks are complete.
     */
    #openTasks() {

      /**
       * Reference to the current instance.
       *
       * @type {this}
       */
      const that = this;

      return this.#setOpening().then(function() {

        return fastdom.measure(function() {

          return that.#$details.outerHeight();

        });

      }).then(function(detailsHeight) { return fastdom.mutate(function() {

        that.#$details.css('height', `${detailsHeight}px`);

        that.#$details.prop('open', true);

        // We need to delay reading the heights until the browser has had a
        // chance to start rendering the content element, because at this point
        // it doesn't yet have any height so will return zero.
        //
        // @see https://stackoverflow.com/questions/61017477/requestanimationframe-inside-a-promise#61020604
        //   Describes how to Promise-ify requestAnimationFrame.
        return new Promise(requestAnimationFrame);

      }) }).then(function() { return fastdom.measure(function() {

        return {
          'details': that.#$details.outerHeight(),
          'summary': that.#$summary.outerHeight(),
          'content': that.#$content.outerHeight(),
        };

      }) }).then(function(heights) { return fastdom.mutate(function() {

        const keyframes = [
          // Start height.
          `${heights.details}px`,
          // End height.
          `${heights.summary + heights.content}px`,
        ];

        // Stop any existing animation.
        if (that.#animation !== null) {
          that.#animation.stop();
        }

        that.#animation = Motion.animate(that.#$details[0], {
          height: keyframes,
        }, {
          duration: that.#animationDuration,
          easing:   that.#animationEasing,
        });

        return that.#animation.finished.then(function(animations) {

          // If the Promise was resolved with an array of Animation instances,
          // the animation finished successfully.
          if (typeof animations !== 'undefined') {
            return that.#animationEndTasks(true);
          }

          // Otherwise, if the parameter is undefined, the animation was
          // cancelled so clean up state.
          return fastdom.mutate(function() {

            that.#isOpening = false;

            that.#$details.removeClass(openingClass);

          });

        });

      }) });

    }

    /**
     * Perform tasks to start closing the details element.
     *
     * @return {Promise}
     *   A Promise that resolves when various DOM tasks are complete.
     */
    #closeTasks() {

      /**
       * Reference to the current instance.
       *
       * @type {this}
       */
      const that = this;

      return this.#setClosing().then(function() {

        return fastdom.measure(function() {

          return {
            'details': that.#$details.outerHeight(),
            'summary': that.#$summary.outerHeight(),
          };

        });

      }).then(function(heights) { return fastdom.mutate(function() {

        // Stop any existing animation.
        if (that.#animation !== null) {
          that.#animation.stop();
        }

        const keyframes = [
          // Start height.
          `${heights.details}px`,
          // End height.
          `${heights.summary}px`,
        ];

        that.#animation = Motion.animate(that.#$details[0], {
          height: keyframes,
        }, {
          duration: that.#animationDuration,
          easing:   that.#animationEasing,
        });

        return that.#animation.finished.then(function(animations) {

          // If the Promise was resolved with an array of Animation instances,
          // the animation finished successfully.
          if (typeof animations !== 'undefined') {
            return that.#animationEndTasks(false);
          }

          // Otherwise, if the parameter is undefined, the animation was
          // cancelled so clean up state.
          return fastdom.mutate(function() {

            that.#isClosing = false;

            that.#$details.removeClass(closingClass);

          });

        });

      }) });

    }

    /**
     * Set the current state to opening.
     *
     * @return {Promise}
     *   A Promise that resolves when various DOM tasks are complete.
     */
    #setOpening() {

      /**
       * Reference to the current instance.
       *
       * @type {this}
       */
      const that = this;

      return fastdom.mutate(function() {

        that.#$details.addClass(openingClass).removeClass(closingClass);

        that.#isClosing = false;

        that.#isOpening = true;

      });

    }

    /**
     * Set the current state to closing.
     *
     * @return {Promise}
     *   A Promise that resolves when various DOM tasks are complete.
     */
    #setClosing() {

      /**
       * Reference to the current instance.
       *
       * @type {this}
       */
      const that = this;

      return fastdom.mutate(function() {

        that.#$details.addClass(closingClass).removeClass(openingClass);

        that.#isClosing = true;

        that.#isOpening = false;

      });

    }

    /**
     * Determine if we can open.
     *
     * @return {Boolean}
     *   True if currently closing or closed and false otherwise.
     */
    #canOpen() {

      return (
        this.#isClosing === true || this.#$details.prop('open') === false
      );

    }

    /**
     * Determine if we can close.
     *
     * @return {Boolean}
     *   True if currently opening or opened and false otherwise.
     */
    #canClose() {

      return (this.#isOpening === true || this.#$details.prop('open') === true);

    }

    /**
     * Toggle the current state from closed to open or vice versa.
     *
     * @return {Promise}
     *   A Promise that resolves when various DOM tasks are complete.
     */
    toggle() {

      if (this.#canOpen() === true) {

        return this.#openTasks();

      } else if (this.#canClose() === true) {

        return this.#closeTasks();

      }

      return Promise.resolve();

    }

    /**
     * Open if not already opening or open.
     *
     * @return {Promise}
     *   A Promise that resolves when various DOM tasks are complete.
     */
    open() {

      // Return an already resolved Promise and do nothing if the element is
      // already in the process of opening or open.
      if (this.#canOpen() === false) {
        return Promise.resolve();
      }

      return this.#openTasks();

    }

    /**
     * Close if not already closing or closed.
     *
     * @return {Promise}
     *   A Promise that resolves when various DOM tasks are complete.
     */
    close() {

      // Return an already resolved Promise and do nothing if the element is
      // already in the process of closing or closed.
      if (this.#canClose() === false) {
        return Promise.resolve();
      }

      return this.#closeTasks();

    }

  };

  this.addBehaviour(
    'AmbientImpactDetails',
    'ambientimpact-details',
    'details',
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
});
