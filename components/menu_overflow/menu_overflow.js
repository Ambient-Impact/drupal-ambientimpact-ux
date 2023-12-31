// -----------------------------------------------------------------------------
//   Ambient.Impact - UX - Menu overflow component
// -----------------------------------------------------------------------------

// Priority+ navigation pattern; menu items that don't fit on a single line are
// displayed in an overflow menu.
//
// Note that the theme is expected to handle the actual drop-down layout and
// styling - the main function of this component is to manage which menu items
// are to be shown in the top-level menu and which are to be in the overflow
// menu.
//
// @see https://css-tricks.com/container-adapting-tabs-with-more-button/
//   Based on this article by Osvaldas Valutis.
//
// @todo Find out what the accessibility implications are of showing/hiding
// items entirely.

AmbientImpact.on([
  'fastdom', 'menuOverflowMeasure', 'menuOverflowMode',
  'menuOverflowOverflowMenu', 'menuOverflowShared', 'menuOverflowToggle',
], function(
  aiFastDom, aiMenuOverflowMeasure, aiMenuOverflowMode,
  aiMenuOverflowOverflowMenu, aiMenuOverflowShared, aiMenuOverflowToggle
) {
AmbientImpact.onGlobals('ally.maintain.disabled', function() {
AmbientImpact.addComponent('menuOverflow', function(aiMenuOverflow, $) {

  'use strict';

  /**
   * Our event namespace.
   *
   * @type {String}
   */
  const eventNamespace = 'aiMenuOverflow';

  /**
   * FastDom instance.
   *
   * @type {FastDom}
   */
  const fastdom = aiFastDom.getInstance();

  /**
   * Menu overflow element classes.
   *
   * @type {Object}
   */
  const classes = aiMenuOverflowShared.getClasses();

  /**
   * Menu overflow object.
   *
   * @param {jQuery} $menu
   *   A jQuery collection containing exactly one menu element.
   *
   * @constructor
   */
  function menuOverflow($menu) {

    /**
     * Reference to the current menu overflow instance.
     *
     * This is used when the value of 'this' is different, i.e. in callbacks.
     *
     * @type {Object}
     */
    let instance = this;

    /**
     * The viewport width of the last update in pixels.
     *
     * This is stored to ensure that we only run an update if the viewport width
     * has changed.
     *
     * @type {Number}
     */
    let lastUpdateViewportWidth = 0;

    /**
     * The top level menu to attach to.
     *
     * @type {HTMLElement}
     */
    let menu = $menu[0];

    /**
     * The top-level menu items of the menu to attach to.
     *
     * @type {jQuery}
     */
    let $menuItems = $menu.children('.' + classes.menuItemClass);

    /**
     * The cloned measure shadow menu.
     *
     * @type {jQuery}
     */
    let $menuMeasureShadow;

    /**
     * The minimum number of menu items visible to use partial/some overflow.
     *
     * If there are fewer than this number, all menu items will be placed in the
     * overflow menu.
     *
     * @type {Number}
     */
    this.minimumVisibleItems = 2;

    /**
     * Measure object.
     *
     * @type {Object}
     */
    let measure;

    /**
     * The overflow container which contains the toggle and overflow menu.
     *
     * @type {jQuery}
     */
    let $overflowContainer = $('<li></li>');

    /**
     * Overflow menu object.
     *
     * @type {Object}
     */
    let overflowMenu = aiMenuOverflowOverflowMenu.createOverflowMenu(
      $menuItems
    );

    /**
     * Overflow mode object.
     *
     * @type {Object}
     */
    let overflowMode = aiMenuOverflowMode.createOverflowMode();

    /**
     * Toggle object.
     *
     * @type {Object}
     */
    let toggle = aiMenuOverflowToggle.createToggle();

    $overflowContainer
      // Add classes to identify this as an expanded menu item, in addition to
      // our base class indicating this item contains the overflow menu.
      .addClass([
        classes.menuItemClass,
        classes.menuItemClass + '--expanded',
        classes.baseClass,
      ])
      .append(overflowMenu.getMenu());

    toggle.getToggle().insertBefore(overflowMenu.getMenu());

    fastdom.mutate(function() {

      $overflowContainer.appendTo($menu);

      $menu
        .addClass(classes.menuEnhancedClass)
        .trigger('menuOverflowAttached');

    });

    /**
     * Get the current overflow menu mode.
     *
     * @return {String}
     */
    this.getMode = function() {
      return overflowMode.getMode();
    }

    /**
     * Update viewport check callback.
     *
     * @param {Boolean} forceUpdate
     *   Whether to force an update even when the viewport width has not
     *   changed.
     *
     * @return {Boolean}
     *   True if the viewport width has changed since the last check or if the
     *   forceUpdate parameter is true, and false otherwise.
     */
    function updateViewportCheck(forceUpdate) {

      /**
       *  The current viewport width in pixels.
       *
       * @type {Number}
       */
      const viewportWidth = $(window).width();

      // Bail if not forcing an update and the viewport width hasn't changed.
      if (forceUpdate !== true && lastUpdateViewportWidth === viewportWidth) {
        return false;
      }

      // Update the last update viewport width.
      lastUpdateViewportWidth = viewportWidth;

      return true;

    };

    /**
     * Intermediate update callback.
     *
     * @param {Boolean} shouldUpdate
     *   True if a previous callback indicated an update should occur, and false
     *   otherwise.
     *
     * @return {Boolean|Promise}
     *   False if an update should not occur, or a resolved Promise if an update
     *   should go ahead.
     */
    function updateIntermediate(shouldUpdate) {

      if (shouldUpdate === false) {
        return false;
      }

      return Promise.resolve();

    };

    /**
     * Update active trail callback.
     *
     * Note that this is intended to be invoked as part of a FastDom mutate
     * phase so is not wrapped in one.
     */
    function updateActiveTrail() {

      // If any of the items displayed in the overflow menu are in the active
      // trail, add the active trail to the overflow container.
      if (overflowMenu.getVisibleItems().hasClass(
        classes.menuItemActiveTrailClass
      )) {
        $overflowContainer.addClass(classes.menuItemActiveTrailClass);

      // If not, remove the active trail class from the overflow container.
      } else {
        $overflowContainer.removeClass(classes.menuItemActiveTrailClass);
      }

    };

    /**
     * Update visibility callback.
     *
     * This handles the bulk of the show/hide logic.
     *
     * @param {jQuery} $overflowingMenuItems
     *   A jQuery collection containing zero or more items in the measure shadow
     *   menu that are overflowing the available space.
     *
     * @return {Promise}
     *   A Promise that resolves when various update tasks are complete.
     */
    function updateVisibility($overflowingMenuItems) {

      /**
       * Previously hidden menu items before the update.
       *
       * @type {jQuery}
       */
      let $previousHiddenMenuItems = $menuItems.filter(
        '.' + classes.menuItemHiddenClass
      );

      /**
       * Menu items in the visible menu bar that are to be hidden.
       *
       * @type {jQuery}
       */
      let $hiddenMenuItems = $();

      /**
       * Promise object to return.
       *
       * @type {Promise}
       */
      let returnPromise;

      // If no menu items are to be hidden, hide the overflow container.
      if ($overflowingMenuItems.length === 0) {

        $overflowContainer.addClass(classes.hiddenClass);

        // Show all menu items.
        $menuItems.removeClass(classes.menuItemHiddenClass);

        // Don't forget to remove this in case we go right from all items in
        // overflow to none.
        $menu.removeClass(classes.menuAllOverflowClass);

        overflowMode.setMode('none');

        returnPromise = Promise.resolve();

      // If we do have menu items to hide, do so while showing the overflow
      // container and overflow menu items whose counterparts were just hidden.
      } else {

        // If less than the minimum items are visible, place all items in
        // $hiddenMenuItems, add the class indicating we've entered 'menu' mode,
        // and update the toggle content to reflect this.
        if (
          $menuItems.length - $overflowingMenuItems.length <
            instance.minimumVisibleItems
        ) {
          $hiddenMenuItems = $menuItems;

          $menu.addClass(classes.menuAllOverflowClass);

          overflowMode.setMode('all');

          returnPromise = toggle.update('all');

        } else {
          // Translate the overflow items from the measure shadow menu to their
          // counterparts in the actual menu.
          for (let i = 0; i < $overflowingMenuItems.length; i++) {
            $hiddenMenuItems = $hiddenMenuItems.add(
              $overflowingMenuItems[i].aiMenuOverflowCounterpart
            );
          }

          $menu.removeClass(classes.menuAllOverflowClass);

          overflowMode.setMode('some');

          returnPromise = toggle.update('some');

        }

        $menuItems.not($hiddenMenuItems)
          .removeClass(classes.menuItemHiddenClass);

        $hiddenMenuItems.addClass(classes.menuItemHiddenClass);

        $overflowContainer.removeClass(classes.hiddenClass);

        // Update overflow menu item visibility and active trail.
        returnPromise
          .then(overflowMenu.updateItemVisibility)
          .then(updateActiveTrail);

      }

      // Trigger an event on updating the overflow menu with all menu items, the
      // previously hidden items, and the updated hidden items so event handlers
      // can compare them to determine what they need to do.
      returnPromise.then(function() {
        $menu.trigger('menuOverflowUpdated', [
          $menuItems, $previousHiddenMenuItems, $hiddenMenuItems,
        ]);
      });

      return returnPromise;

    }

    /**
     * Update visible and overflow items, based on current space.
     *
     * @param {Boolean} forceUpdate
     *   Whether to force an update even when the viewport width has not
     *   changed.
     *
     * @return {Promise}
     *   A Promise that resolves when various update tasks are complete.
     */
    this.update = function(forceUpdate) {

      return fastdom.measure(function() {

        return updateViewportCheck(forceUpdate);

      }).then(updateIntermediate).then(function(shouldUpdate) {

        if (shouldUpdate === false) {
          return;
        }

        return measure.getOverflowingMenuItems().then(function(
          $overflowingMenuItems
        ) { return fastdom.mutate(function() {

          return updateVisibility($overflowingMenuItems);

        })});

      });

    };

    overflowMode.setMode('some');

    // Set the toggle to 'some' mode so that we can clone that into the measure
    // shadow menu.
    toggle.update('some').then(function() {

      // The toggle update returns a Promise that runs during the
      // fastdom.mutate() phase, so we don't need to wrap this in another mutate
      // callback.

      $menuMeasureShadow = $menu.clone();

      // Disable all interactions for the cloned menu items so it's not possible
      // to accidentally navigate into it via keyboard or other means. Note that
      // we don't save the handle as we don't need to re-enable these at any
      // point.
      ally.maintain.disabled({
        context: $menuMeasureShadow
      });

      $menuMeasureShadow
        .addClass(classes.menuMeasureShadowClass)
        // Hide the menu completely from the accessibility tree.
        .attr('aria-hidden', true)
        .insertAfter($menu);

      /**
       * Top-level menu items of original menu, including overflow container.
       *
       * @type {jQuery}
       */
      let $originalItems = $menu.children();

      /**
       * Top-level menu items of shadow menu, including overflow container.
       *
       * @type {jQuery}
       */
      let $shadowItems = $menuMeasureShadow.children();

      // Save references to a shadow menu item's original menu counterpart.
      for (let i = 0; i < $shadowItems.length; i++) {
        $shadowItems[i].aiMenuOverflowCounterpart = $originalItems[i];
      }

      // Create the measure object here so that it's initialized with the
      // correct toggle contents and any other modications made during the
      // 'menuOverflowAttached' event.
      measure = aiMenuOverflowMeasure.createMeasure($menuMeasureShadow[0]);

      // Run once on attach.
      instance.update();

    });

    // Add event handlers to trigger on our debounced resize event and when
    // the viewport offsets change, such as when the Drupal toolbar trays open
    // or close in vertical mode.
    $(window).on([
      'lazyResize.' + eventNamespace,
      'drupalViewportOffsetChange.' + eventNamespace
    ].join(' '), this.update);

    /**
     * Destroy this instance.
     *
     * @return {Promise}
     *   The Promise returned by FastDom that is resolved when mutations are
     *   completed.
     */
    this.destroy = function() {

      $(window).off([
        'lazyResize.' + eventNamespace,
        'drupalViewportOffsetChange.' + eventNamespace
      ].join(' '), this.update);

      overflowMenu.destroy();

      return fastdom.mutate(function() {

        $overflowContainer.remove();

        $menuMeasureShadow.remove();

        $menu
          .removeClass(classes.menuEnhancedClass)
          .children('.' + classes.menuItemClass)
            .removeClass(classes.menuItemHiddenClass);

        $menu.trigger('menuOverflowDetached');

      });

    };

  };

  /**
   * Attach to a provided menu element.
   *
   * @param {jQuery|HTMLElement} $menu
   *   A menu element or a jQuery collection containing one or more menu
   *   elements.
   */
  this.attach = function($menu) {

    // Ensure a jQuery collection.
    $menu = $($menu);

    for (let i = 0; i < $menu.length; i++) {
      $menu[i].aiMenuOverflow = new menuOverflow($menu.eq(i));
    }

  };

  /**
   * Detach from a provided menu element.
   *
   * @param {jQuery|HTMLElement} $menu
   *   A menu element or a jQuery collection containing one or more menu
   *   elements.
   */
  this.detach = function($menu) {

    // Ensure a jQuery collection.
    $menu = $($menu);

    for (let i = 0; i < $menu.length; i++) {

      if (!('aiMenuOverflow' in $menu[i])) {
        continue;
      }

      $menu[i].aiMenuOverflow.destroy();

    }

    $menu.removeProp('aiMenuOverflow');

  };

});
});
});
