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

  this.Details = class {

    #$details;

    #$summary;

    #$content;

    #animation = null;

    #isClosing = false;

    #isOpening = false;

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

      this.#bindEventHandlers();

    }

    /**
     * Destroy this instance.
     *
     * @return {Promise}
     *   A Promise that resolves when various DOM tasks are complete.
     */
    destroy() {

      this.#unbindEventHandlers();

      return fastdom.mutate(function() {

      });

    }

    /**
     * Bind all of our event handlers.
     *
     * @see this~#unbindEventHandlers()
     */
    #bindEventHandlers() {
    }

    /**
     * Unbind all of our event handlers.
     *
     * @see this~#bindEventHandlers()
     */
    #unbindEventHandlers() {
    }

    #clickHandler(event) {}

    #startOpening() {}

    #startClosing() {}

    open() {}

    close() {}

  };

});
});
});
