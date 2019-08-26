// -----------------------------------------------------------------------------
//   Ambient.Impact - UX - Menu: overflow component
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

AmbientImpact.addComponent('menuOverflow', function(aiMenuOverflow, $) {
  'use strict';

  /**
   * Content to insert into the overflow toggle element.
   *
   * This can be anything that jQuery can work with, be it a string, an HTML
   * element, a jQuery collection, etc.
   *
   * @type {String|HTMLElement|jQuery}
   */
  this.toggleContent = Drupal.t('More');

  /**
   * The base BEM class for the overflow root and all child/state classes.
   *
   * @type {String}
   */
  var baseClass = 'menu-overflow';

  /**
   * The BEM modifier class for the overflow root it's hidden.
   *
   * @type {String}
   */
  var hiddenClass = baseClass + '--hidden';

  /**
   * The BEM descendent class for the overflow toggle element.
   *
   * @type {String}
   */
  var toggleClass = baseClass + '__toggle';

  /**
   * The BEM descendent class for the overflow menu element.
   *
   * @type {String}
   */
  var overflowMenuClass = baseClass + '__menu';

  /**
   * The Drupal menu item class.
   *
   * @type {String}
   */
  var menuItemClass = 'menu-item';

  /**
   * The Drupal menu item with active trail class.
   *
   * @type {String}
   */
  var menuItemActiveTrailClass = menuItemClass + '--active-trail';

  /**
   * The BEM modifier class for menu items when they're hidden.
   *
   * This is applied to both the existing menu items and the cloned menu items
   * in the overflow menu, as needed.
   *
   * @type {String}
   */
  var menuItemHiddenClass = menuItemClass + '--hidden';

  /**
   * The BEM modifier class for the target menu to indicate we've enhanced it.
   *
   * @type {String}
   */
  var menuEnhancedClass = 'menu--overflow-enhanced';

  /**
   * Attach to a provided menu element.
   *
   * @param {jQuery|HTMLElement} $menu
   *   An HTML element or a jQuery collection containing one element. Note that
   *   if the jQuery collection contains more than one element, only the first
   *   will be attached to.
   */
  this.attach = function($menu) {
    // Make sure $menu is a jQuery collection by having jQuery wrap it. If it's
    // already a jQuery collection, jQuery will return it as-is.
    $menu = $($menu).first();

    var menu = $menu[0];

    /**
     * The top-level menu items of the menu to attach to.
     *
     * @type {jQuery}
     */
    var $menuItems = $menu.children('.' + menuItemClass);

    /**
     * The overflow container which contains the toggle and overflow menu.
     *
     * @type {jQuery}
     */
    var $overflowContainer = $('<li></li>');

    /**
     * The overflow toggle element.
     *
     * @type {jQuery}
     */
    var $overflowToggle = $('<button></button>');

    /**
     * The overflow menu element.
     *
     * @type {jQuery}
     */
    var $overflowMenu = $('<ul></ul>');

    /**
     * The top-level menu items of the overflow menu.
     *
     * These are cloned from the existing items in the menu we're attaching to.
     *
     * @type {jQuery}
     */
    var $overflowItems = $menuItems.clone();

    $overflowToggle
      .addClass(toggleClass)
      .attr('type', 'button');

    // Append the toggle content. Note that if the content is not a string, it's
    // likely to be an HTML element, in which case we have to use $().clone() or
    // we'll be moving the same, single element around if there is more than one
    // overflow toggle on a page. If it is a string, using $().clone() won't
    // work as expected, so we have to check for that.
    if (typeof this.toggleContent === 'string') {
      $overflowToggle.append(this.toggleContent);

    } else {
      $overflowToggle.append($(this.toggleContent).clone());
    }

    $overflowMenu
      .addClass('menu ' + overflowMenuClass)
      .append($overflowItems);

    $overflowContainer
      // Add classes to identify this as an expanded menu item, in addition to
      // our base class indicating this item contains the overflow menu.
      .addClass([
        menuItemClass,
        menuItemClass + '--expanded',
        baseClass,
      ].join(' '))
      .append($overflowToggle)
      .append($overflowMenu)
      .appendTo($menu);

    $menu.addClass(menuEnhancedClass);

    menu.aiMenuOverflow = {
      $overflowContainer: $overflowContainer
    };

    menu.aiMenuOverflow.update = function() {
      // Show all items in both the visible menu and the overflow menu, so that
      // we can measure their widths and selectively hide individual items.
      $menuItems.add($overflowItems).removeClass(menuItemHiddenClass);

      /**
       * The width in pixels that the menu is currently taking up horizontally.
       *
       * @type {Number}
       */
      var menuWidth = $menu.width();

      var stopWidth = $overflowToggle.outerWidth();

      var $hiddenMenuItems = $();

      for (var i = 0; i < $menuItems.length; i++) {
        var $menuItem = $menuItems.eq(i);

        var menuItemWidth = $menuItem.outerWidth();

        // If the measured width up until now plus the current item width don't
        // exceed the menu width, add the current item width and keep iterating.
        if (menuWidth >= stopWidth + menuItemWidth) {
          stopWidth += menuItemWidth;

        // If we've exceeded the menu width, add this and all items after it in
        // the collection to the hidden collection, and break out of the loop.
        // This is probably the most performant and fool-proof way to ensure we
        // hide all items sequentially, versus the original method in the CSS
        // Tricks article - hiding one by one - where you could end with items
        // being hidden from the middle while following items may not be.
        } else {
          $hiddenMenuItems = $menuItems.slice(i);

          break;
        }
      }

      // If no menu items are to be hidden, hide the overflow container.
      if ($hiddenMenuItems.length === 0) {
        $overflowContainer
          .addClass(hiddenClass);

      // If we do have menu items to hide, do so while showing the overflow
      // container and overflow menu items whose counterparts were just hidden.
      } else {
        $hiddenMenuItems.addClass(menuItemHiddenClass);

        $overflowContainer.removeClass(hiddenClass);

        for (var i = 0; i < $overflowItems.length; i++) {
          var $overflowItem = $overflowItems.eq(i);

          // If this overflow menu item's root menu counterpart is not in the
          // hidden menu items collection, hide the overflow menu item.
          if ($hiddenMenuItems.filter(function(index) {
            return $(this).children('a[data-drupal-link-system-path="' +
              $overflowItem.children('a').first()
                .attr('data-drupal-link-system-path') +
            '"]').first().length;
          }).length === 0) {
            $overflowItem.addClass(menuItemHiddenClass);

          // Otherwise, show the overflow menu item.
          } else {
            $overflowItem.removeClass(menuItemHiddenClass);

          }
        }

        // If any of the items displayed in the overflow menu are in the active
        // trail, add the active trail to the overflow container.
        if (
          $overflowItems.filter(':not(.' + menuItemHiddenClass + ')')
            .hasClass(menuItemActiveTrailClass)
        ) {
          $overflowContainer.addClass(menuItemActiveTrailClass);

        // If not, remove the active trail class from the overflow container.
        } else {
          $overflowContainer.removeClass(menuItemActiveTrailClass);
        }
      }
    };

    // Run once on attach.
    menu.aiMenuOverflow.update();

    // Add an event handler to trigger on our debounced resize event.
    $(window).on('lazyResize.aiMenuOverflow', menu.aiMenuOverflow.update);
  };

  /**
   * Detach from a provided menu element.
   *
   * @param {jQuery|HTMLElement} $menu
   *   An HTML element or a jQuery collection containing one element. Note that
   *   if the jQuery collection contains more than one element, only the first
   *   will be detached from.
   */
  this.detach = function($menu) {
    // Make sure $menu is a jQuery collection by having jQuery wrap it. If it's
    // already a jQuery collection, jQuery will return it as-is.
    $menu = $($menu).first();

    var menu = $menu[0];

    // Don't do anything if we can't find our object attached to the menu
    // element.
    if (!('aiMenuOverflow' in menu)) {
      return;
    }

    $(window).off('lazyResize.aiMenuOverflow', menu.aiMenuOverflow.update);

    menu.aiMenuOverflow.$overflowContainer.remove();

    delete menu.aiMenuOverflow;

    $menu
      .removeClass(menuEnhancedClass)
      .children('.' + menuItemClass)
        .removeClass(menuItemHiddenClass);
  };
});