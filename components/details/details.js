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

  const baseClass = 'details-animated';

  const openingClass = `${baseClass}--opening`;

  const closingClass = `${baseClass}--closing`;

  this.Details = class {

    #$details;

    #$summary;

    #$content;

    #animation = null;

    #isClosing = false;

    #isOpening = false;

    #animationDuration = 0.2;

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

      this.#$summary = this.#$details.find('> summary');

      // Drupal adds a wrapper around the content for us. Thanks Drupal!
      this.#$content = this.#$details.find('> .details-wrapper');

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

    // #animationStartTasks() {

    //   /**
    //    * Reference to the current instance.
    //    *
    //    * @type {this}
    //    */
    //   const that = this;

    //   return fastdom.mutate(function() {

    //     that.#$details.css('overflow', 'hidden');

    //   });

    // }

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

        that.#$details.css({
          height:   '',
          // overflow: '',
        }).removeClass([openingClass, closingClass]);

        // console.debug('#animationEndTasks()');

      });

    }

    #openTasks() {

      /**
       * Reference to the current instance.
       *
       * @type {this}
       */
      const that = this;

      // this.#isOpening = true;

      return this.#setOpening().then(function() {

        return fastdom.measure(function() {

          return that.#$details.outerHeight();

        });

      })/*;

      return fastdom.measure(function() {

        return that.#$details.outerHeight();

      })*/.then(function(detailsHeight) { return fastdom.mutate(function() {

        that.#$details.css({
          height:   `${detailsHeight}px`,
          // overflow: 'hidden',
        });

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

        // console.debug(heights);

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

          // console.debug('Open:', animations);

          if (typeof animations !== 'undefined') {
            return that.#animationEndTasks(true);
          }

          // console.debug('Open cancelled');

          return fastdom.mutate(function() {

            that.#isOpening = false;

            that.#$details.removeClass(openingClass);

          });

        });

      }) });

    }

    #closeTasks() {

      /**
       * Reference to the current instance.
       *
       * @type {this}
       */
      const that = this;

      // this.#isClosing = true;

      return this.#setClosing().then(function() {

        return fastdom.measure(function() {

          return {
            'details': that.#$details.outerHeight(),
            'summary': that.#$summary.outerHeight(),
          };

        });

      })/*;

      return fastdom.measure(function() {

        return {
          'details': that.#$details.outerHeight(),
          'summary': that.#$summary.outerHeight(),
        };

      })*/.then(function(heights) { return fastdom.mutate(function() {

        // Stop any existing animation.
        if (that.#animation !== null) {
          that.#animation.stop();
        }

        // that.#$details.css({
        //   overflow: 'hidden',
        // });

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

          // console.debug('Close:', animations);

          if (typeof animations !== 'undefined') {
            return that.#animationEndTasks(false);
          }

          // console.debug('Close cancelled');

          // that.#isClosing = false;

          return fastdom.mutate(function() {

            that.#isClosing = false;

            that.#$details.removeClass(closingClass);

          });

        });

      }) });

    }

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

    #canOpen() {

      return (
        this.#isClosing === true || this.#$details.prop('open') === false
      );

    }

    #canClose() {

      return (this.#isOpening === true || this.#$details.prop('open') === true);

    }

    toggle() {

      if (this.#canOpen() === true) {

        return this.#openTasks();

      } else if (this.#canClose() === true) {

        return this.#closeTasks();

      }

      return Promise.resolve();

    }

    open() {

      // Return an already resolved Promise and do nothing if the element is
      // already in the process of opening or open.
      if (this.#canOpen() === false) {
        // console.debug('Cannot open');
        return Promise.resolve();
      }

      return this.#openTasks();

    }

    close() {

      // Return an already resolved Promise and do nothing if the element is
      // already in the process of closing or closed.
      if (this.#canClose() === false) {
        // console.debug('Cannot close');
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
