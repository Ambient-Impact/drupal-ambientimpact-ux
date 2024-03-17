// -----------------------------------------------------------------------------
//   Ambient.Impact - UX - Details component
// -----------------------------------------------------------------------------

AmbientImpact.onGlobals([
  'ally.maintain.disabled',
  'document.documentElement.animate',
  'Motion.animate',
  'ResizeObserver',
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
   * The BEM modifier class for when the details is open and not animating.
   *
   * @type {String}
   */
  const openClass = `${baseClass}--open`;

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
   * BEM element class for the cloned content.
   *
   * @type {String}
   */
  const contentCloneClass = `${baseClass}__content-clone`;

  /**
   * Content element height CSS custom property name.
   *
   * @type {String}
   */
  const contentHeightProperty = '--details-content-height';

  /**
   * Summary element height CSS custom property name.
   *
   * @type {String}
   */
  const summaryHeightProperty = '--details-summary-height';

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
     * The cloned content element wrapped in a jQuery collection.
     *
     * @type {jQuery}
     */
    #$contentClone;

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
     * Whether the details is currently fully open and not opening or closing.
     *
     * @type {Boolean}
     */
    #isOpen;

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
     * ally.maintain.disabled() handle.
     *
     * @type {Object|undefined}
     *
     * @see https://allyjs.io/api/maintain/disabled.html
     *   ally.maintain.disabled() documentation.
     */
    #allyMaintainDisabled;

    /**
     * ResizeObserver instance to notify us of summary and content size changes.
     *
     * @type {ResizeObserver}
     */
    #resizeObserver;

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

      this.#isOpen = this.#$details.prop('open');

      fastdom.mutate(function() {

        that.#$details.addClass(baseClass);

        if (that.#isOpen === true) {
          that.#$details.addClass(openClass);
        }

        that.#$contentClone = that.#$content.clone();

        that.#$contentClone.removeClass('details-wrapper').addClass(
          contentCloneClass,
        ).attr({
          'hidden':       true,
          'aria-hidden':  true,
        }).appendTo(that.#$summary);

        // If the browser supports the 'inert' attribute, use that rather than
        // ally.js to disable all interaction with the cloned content.
        if (typeof that.#$contentClone.prop('inert') !== 'undefined') {

          that.#$contentClone.prop('inert', true);

        } else {

          that.#allyMaintainDisabled = ally.maintain.disabled({
            context: that.#$contentClone,
          });

        }

      }).then(function() {

        return that.#setHeightProperties();

      }).then(function() {

        return that.#setInlineHeight();

      }).then(function() {

        that.#bindEventHandlers();

        that.#resizeObserver = new ResizeObserver(function(entries) {
          that.#resizeObserverHandler(entries);
        });

        that.#resizeObserver.observe(that.#$summary[0]);

        that.#resizeObserver.observe(that.#$contentClone[0]);

      });

    }

    /**
     * Destroy this instance.
     *
     * @return {Promise}
     *   A Promise that resolves when various DOM tasks are complete.
     */
    destroy() {

      this.#resizeObserver.disconnect();

      this.#unbindEventHandlers();

      /**
       * Reference to the current instance.
       *
       * @type {this}
       */
      const that = this;

      return fastdom.mutate(function() {

        if (typeof that.#allyMaintainDisabled !== 'undefined') {
          that.#allyMaintainDisabled.disengage();
        }

        that.#$contentClone.remove();

        that.#$details.removeClass([baseClass, openingClass, closingClass]);

      }).then(function() {

        return that.#unsetHeightProperties();

      });

    }

    /**
     * Bind all of our event handlers.
     *
     * @see this~#unbindEventHandlers()
     */
    #bindEventHandlers() {

      this.#$details.on(`toggle.${eventNamespace}`, {
        // Pass the current instance to the event handler because 'this' will be
        // the clicked element in that context.
        that: this,
      }, this.#toggleHandler);

    }

    /**
     * Unbind all of our event handlers.
     *
     * @see this~#bindEventHandlers()
     */
    #unbindEventHandlers() {

      this.#$details.off(`toggle.${eventNamespace}`, this.#toggleHandler);

    }

    /**
     * ResizeObserver handler to update inline height properties.
     *
     * @param {ResizeObserverEntry} entries
     */
    #resizeObserverHandler(entries) {

      // Don't do anything if we're currently animating. The animation shouldn't
      // trigger the ResizeObserver since we specifically only observe the
      // summary and content clone elements, but we can potentially interfere
      // with the animation if something else triggers the ResizeObserver while
      // the animation is running, e.g. window resize or font size change.
      if (this.#animation !== null) {
        return;
      }

      /**
       * Reference to the current instance.
       *
       * @type {this}
       */
      const that = this;

      this.#setHeightProperties().then(function() {

        // Note passing 'false' as the parameter to have this method use the
        // actual height of the summary and cloned content rather than the
        // current details height, the latter of which would effectively result
        // in no change in the inline style.
        that.#setInlineHeight(false);

      });

    }

    /**
     * Summary toggle event handler.
     *
     * @param {jQuery.Event} event
     *   The event object.
     */
    #toggleHandler(event) {

      event.data.that.toggle();

    }

    /**
     * Set or update the height custom properties.
     *
     * @return {Promise}
     *   A Promise that resolves when various DOM tasks are complete.
     *
     * @todo Can we potentially optimize this to allow passing already
     *   read heights if they're available so we don't have to do it twice? Is
     *   that over/prematurely optimizing?
     */
    #setHeightProperties() {

      /**
       * Reference to the current instance.
       *
       * @type {this}
       */
      const that = this;

      return fastdom.measure(function() {

        return {
          'summary': that.#$summary.outerHeight(),
          'content': that.#$contentClone.outerHeight(),
        };

      }).then(function(heights) { return fastdom.mutate(function() {

        /**
         * Style declaration for the details element.
         *
         * @type {CSSStyleDeclaration}
         */
        const style = that.#$details.prop('style');

        style.setProperty(summaryHeightProperty, `${heights.summary}px`);
        style.setProperty(contentHeightProperty, `${heights.content}px`);

      }) });

    }

    /**
     * Unset the height custom properties.
     *
     * @return {Promise}
     *   A Promise that resolves when various DOM tasks are complete.
     */
    #unsetHeightProperties() {

      return fastdom.mutate(function() {

        /**
         * Style declaration for the details element.
         *
         * @type {CSSStyleDeclaration}
         */
        const style = that.#$details.prop('style');

        style.removeProperty(summaryHeightProperty);
        style.removeProperty(contentHeightProperty);

      });

    }

    /**
     * Set the current height of the details as inline style.
     *
     * @param {Boolean} useDetailsHeight
     *   Whether to use the current details element height or build it from the
     *   summary and content clone heights.
     *
     * @return {Promise}
     *   A Promise that resolves when various DOM tasks are complete.
     */
    #setInlineHeight(useDetailsHeight) {

      /**
       * Reference to the current instance.
       *
       * @type {this}
       */
      const that = this;

      return fastdom.measure(function() {

        if (useDetailsHeight !== false) {
          return that.#$details.innerHeight();
        }

        // If currently closed, use just the summary outer height.
        if (that.#isOpen === false) {
          return that.#$summary.outerHeight();
        }

        // If open, use the combined summary and content clone outer heights.
        return that.#$summary.outerHeight() + that.#$contentClone.outerHeight();

      }).then(function(detailsHeight) { return fastdom.mutate(function() {

        that.#$details.css('height', `${detailsHeight}px`);

      }) });

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

        that.#animation = null;

        that.#isOpening = false;

        that.#isClosing = false;

        that.#isOpen = that.#$details.prop('open');

        that.#$details.removeClass([
          openingClass, closingClass,
        ]);

        if (open === true) {
          that.#$details.addClass(openClass);
        } else {
          // Only remove the inline height when having closed.
          that.#$details.removeClass(openClass).css('height', '');
        }

      }).then(function() {

        return that.#setHeightProperties();

      }).then(function() {

        // Don't set inline height if closed at this point.
        if (open === false) {
          return;
        }

        return that.#setInlineHeight();

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

      return this.#setInlineHeight().then(function() {

        return that.#setOpening();

      }).then(function() { return fastdom.measure(function() {

        return {
          'details': that.#$details.outerHeight(),
          'summary': that.#$summary.outerHeight(),
          'content': that.#$contentClone.outerHeight(),
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

      return this.#setHeightProperties().then(function() {

        return fastdom.measure(function() {

          return {
            'details': that.#$details.innerHeight(),
            'summary': that.#$summary.outerHeight(),
            'content': that.#$contentClone.outerHeight(),
          };

        });

      }).then(function(heights) {

        return that.#setClosing().then(function() {

          return heights;

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
          `${heights.details - heights.content}px`,
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

        that.#$details.addClass(closingClass).removeClass([openingClass, openClass]);

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
        // If already in the process of opening, we can't double open, can we?
        this.#isOpening === false && (
          this.#isClosing === true || this.#isOpen === false
        )
      );

    }

    /**
     * Determine if we can close.
     *
     * @return {Boolean}
     *   True if currently opening or opened and false otherwise.
     */
    #canClose() {

      return (
        // If already closing, we can't close harder, no matter how hard we try.
        this.#isClosing === false && (
          this.#isOpening === true || this.#isOpen === true
        )
      );

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

});
});
});
