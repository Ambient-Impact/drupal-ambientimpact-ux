// -----------------------------------------------------------------------------
//   Ambient.Impact - UX - Details element component with animation
// -----------------------------------------------------------------------------

AmbientImpact.onGlobals([
  'ally.maintain.disabled',
  'document.documentElement.animate',
  'Motion.animate',
  'ResizeObserver',
], function() {
AmbientImpact.on(['fastdom'], function(aiFastDom) {
AmbientImpact.addComponent('detailsAnimated', function(aiDetailsAnimated, $) {

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
   * BEM element class for the cloned content inner wrapper.
   *
   * @type {String}
   */
  const contentCloneInnerClass = `${baseClass}__content-clone-inner`;

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
   * Open animation duration custom property name.
   *
   * @type {String}
   */
  const openDurationProperty = '--details-open-duration';

  /**
   * Open animation easing custom property name.
   *
   * @type {String}
   */
  const openEasingProperty = '--details-open-easing';

  /**
   * Close animation duration custom property name.
   *
   * @type {String}
   */
  const closeDurationProperty = '--details-close-duration';

  /**
   * Close animation easing custom property name.
   *
   * @type {String}
   */
  const closeEasingProperty = '--details-close-easing';

  /**
   * Content update event triggered on the details element.
   *
   * The class also listens to this event, allowing parent or ancestor details
   * elements to update their content when a child or descendent's changes.
   *
   * @type {String}
   */
  const contentUpdateEvent = 'detailscontentupdate';

  /**
   * Represents an animated <details> element.
   */
  this.DetailsAnimated = class {

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
     * The cloned content element inner wrapper wrapped in a jQuery collection.
     *
     * While seemingly unnecessary, this allows us to use the content clone
     * as a overflow: hidden; so that the inner wrapper can slide within this
     * view hole while also being correctly clipped and not requiring more
     * complex clipping on the summary element as that would interfere with the
     * focus outline, etc.
     *
     * @type {jQuery}
     */
    #$contentCloneInner;

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

        that.#$contentClone = $('<div></div>').addClass(contentCloneClass).attr(
          'hidden', true,
        ).appendTo(that.#$summary);

        that.#$contentCloneInner = $('<div></div>').addClass(
          contentCloneInnerClass,
        ).appendTo(that.#$contentClone);

        // If the browser supports the 'inert' attribute and property, use that
        // rather than ally.js to disable all interaction with the cloned
        // content.
        if (typeof that.#$contentClone.prop('inert') !== 'undefined') {

          that.#$contentClone.prop('inert', true);

        } else {

          // The inert attribute also hides the element from the accessibility
          // tree, so this should only be neccessary if the browser doesn't
          // support inert.
          that.#$contentClone.attr('aria-hidden', true);

          that.#allyMaintainDisabled = ally.maintain.disabled({
            context: that.#$contentClone,
          });

        }

      }).then(function() {

        return that.#buildClonedContent();

      }).then(function() {

        return that.#setHeightProperties();

      }).then(function() {

        that.#bindEventHandlers();

        that.#resizeObserver = new ResizeObserver(function(entries) {
          that.#resizeObserverHandler(entries);
        });

        that.#resizeObserver.observe(that.#$summary[0]);

        that.#resizeObserver.observe(that.#$contentCloneInner[0]);

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

      this.#$details.on({
        // @see https://stackoverflow.com/questions/33194138/template-string-as-object-property-name#67722507
        [`toggle.${eventNamespace}`]:                this.#toggleHandler,
        [`${contentUpdateEvent}.${eventNamespace}`]: this.#contentUpdateHandler,
      }, {
        // Pass the current instance to the event handlers because 'this' will
        // be the triggering element in that context.
        that: this,
      });

    }

    /**
     * Unbind all of our event handlers.
     *
     * @see this~#bindEventHandlers()
     */
    #unbindEventHandlers() {

      this.#$details.off({
        // @see https://stackoverflow.com/questions/33194138/template-string-as-object-property-name#67722507
        [`toggle.${eventNamespace}`]:                this.#toggleHandler,
        [`${contentUpdateEvent}.${eventNamespace}`]: this.#contentUpdateHandler,
      });

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

      this.#setHeightProperties();

    }

    /**
     * Build or rebuild the cloned content.
     *
     * @return {Promise}
     *   A Promise that resolves when various DOM tasks are complete.
     */
    #buildClonedContent() {

      /**
       * Reference to the current instance.
       *
       * @type {this}
       */
      const that = this;

      return fastdom.mutate(function() {

        const $cloned = that.#$content.contents().clone();

        // Remove any nested cloned content within this cloned content (wow so
        // meta) because that way madness lies (it'll break stuff, result in
        // wrong height measurements, etc.).
        $cloned.find(`.${contentCloneClass}`).remove();

        that.#$contentCloneInner.empty().append($cloned);

      });

    }

    /**
     * Toggle event handler.
     *
     * @param {jQuery.Event} event
     *   The event object.
     */
    #toggleHandler(event) {

      event.data.that.toggle();

    }

    /**
     * Content update event handler.
     *
     * @param {jQuery.Event} event
     *   The event object.
     */
    #contentUpdateHandler(event) {

      // Only update our cloned content if the triggering element is not ours.
      // This allows child/descendent details elements to inform parent/ancestor
      // details that they've opened or closed without this instance causing
      // itself to update content unnecessarily.
      if (event.data.that.#$details.is(event.target) === true) {
        return;
      }

      event.data.that.#buildClonedContent();

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
          'content': that.#$contentCloneInner.outerHeight(),
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
     * Parse easing custom property value into a format Motion understands.
     *
     * @param {String} cssValue
     *   The raw computed CSS custom property value.
     *
     * @return {Number[]}
     *   Array of parsed number values.
     *
     * @see https://motion.dev/dom/animate#easing
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function
     *
     * @todo Also support keywords like 'ease-in-out', etc.
     */
    #parseEasing(cssValue) {

      /**
       * Custom property with cubic-bezier() removed, leaving only its contents.
       *
       * @type {String}
       */
      const stripped = cssValue.replace(/cubic-bezier\(([^)]+)\)/, '$1');

      if (cssValue === stripped) {

        throw new Error(
          'Could not parse easing property value! Got: ' + cssValue,
        );

      }

      const numericValues = stripped.split(',').map(function(value) {

        const parsed = parseFloat(value);

        if (isNaN(parsed)) {
          throw new Error('Could not parse easing index value! Got: ' + value);
        }

        return parsed;

      });

      return numericValues;

    }

    /**
     * Parse duration custom property value into a format Motion understands.
     *
     * @param {String} cssValue
     *   The raw computed CSS custom property value.
     *
     * @return {Number}
     *   The parsed duration as a unitless number. This will always be in
     *   seconds and will be converted to such from milliseconds if needed.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/time
     *   At the time of writing, only seconds and milliseconds are defined as
     *   valid units of time in CSS.
     *
     * @see https://motion.dev/guides/waapi-improvements#durations-as-seconds
     *
     * @todo Can we build in a failsafe to return zero if the unit can't be
     *   determined?
     */
    #parseDuration(cssValue) {

      /**
       * Parsed CSS value as a float.
       *
       * @type {Number}
       */
      const numericValue = parseFloat(cssValue);

      // If this looks like it's in milliseconds, convert it to seconds.
      if (cssValue.search(`${numericValue}ms`) > -1) {
        return numericValue / 1000;
      }

      return numericValue;

    }

    /**
     * Read the animation custom properties for the details element.
     *
     * @param {Boolean} open
     *   If true, reads open animation values; if false, reads close animation
     *   values.
     *
     * @return {Promise}
     *   A Promise that resolves with an object containing 'duration' and
     *   'easing' keys.
     */
    #getAnimationPropertyValues(open) {

      /**
       * Reference to the current instance.
       *
       * @type {this}
       */
      const that = this;

      return fastdom.measure(function() {

        /**
         * Computed style declaration for the details element.
         *
         * @type {CSSStyleDeclaration}
         */
        const style = getComputedStyle(that.#$details[0]);

        return {
          'duration': that.#parseDuration(style.getPropertyValue(
            open === true ? openDurationProperty : closeDurationProperty,
          )),
          'easing':   that.#parseEasing(
            style.getPropertyValue(
              open === true ? openEasingProperty : closeEasingProperty
            ),
          )
        };

      });

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
        ]).css('height', '');

        if (open === true) {
          that.#$details.addClass(openClass);
        } else {
          that.#$details.removeClass(openClass);
        }

        return that.#buildClonedContent();

      }).then(function() {

        return that.#setHeightProperties();

      }).then(function() {
        that.#$details.trigger(contentUpdateEvent);
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

      // Trigger the event once before we begin animating.
      //
      // @todo Figure out why this can't be done just at the end of the
      //   animation but also needed before to fix nesting updates.
      this.#$details.trigger(contentUpdateEvent);

      return this.#setOpening().then(function() {

        return that.#getAnimationPropertyValues(true);

      }).then(function(options) { return fastdom.measure(function() {

        return {
          'keyframes': [
            // Start height.
            `${that.#$details.outerHeight()}px`,
            // End height.
            `${
              that.#$summary.outerHeight() +
              that.#$contentCloneInner.outerHeight()
            }px`,
          ],
          'options': options,
        };

      }) }).then(function(animationParams) { return fastdom.mutate(function() {

        // Stop any existing animation.
        if (that.#animation !== null) {
          that.#animation.stop();
        }

        that.#animation = Motion.animate(that.#$details[0], {
          height: animationParams.keyframes,
        }, {
          duration: animationParams.options.duration,
          easing:   animationParams.options.easing,
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

      // Trigger the event once before we begin animating.
      //
      // @todo Figure out why this can't be done just at the end of the
      //   animation but also needed before to fix nesting updates.
      this.#$details.trigger(contentUpdateEvent);

      return this.#setHeightProperties().then(function() {

        return that.#getAnimationPropertyValues(false);

      }).then(function(options) { return fastdom.measure(function() {

        return {
          'keyframes': [
            // Start height.
            `${that.#$details.innerHeight()}px`,
            // End height.
            `${that.#$summary.outerHeight()}px`,
          ],
          'options': options,
        };

      }) }).then(function(animationParams) {

        return that.#setClosing().then(function() {

          return animationParams;

        });

      }).then(function(animationParams) { return fastdom.mutate(function() {

        // Stop any existing animation.
        if (that.#animation !== null) {
          that.#animation.stop();
        }

        that.#animation = Motion.animate(that.#$details[0], {
          height: animationParams.keyframes,
        }, {
          duration: animationParams.options.duration,
          easing:   animationParams.options.easing,
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
