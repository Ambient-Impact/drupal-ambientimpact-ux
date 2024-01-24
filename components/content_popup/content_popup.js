// -----------------------------------------------------------------------------
//   Ambient.Impact - UX - Content pop-up component
// -----------------------------------------------------------------------------

// This provides responsive content pop-ups that use different methods to
// display additional content related to a triggering element. This is inspired
// by the Wikipedia reference/citation tooltips (on the desktop site) and
// offcanvas panels (on the mobile site). While Wikipedia has two different
// widgets on two separate sites, this component combines both and switches
// between them dynamically depending on the screen size.

AmbientImpact.on(['fastdom', 'tooltip', 'offcanvas', 'mediaQuery'], function(
  aiFastDom, aiTooltip, aiOffcanvas, aiMediaQuery
) {
AmbientImpact.addComponent('contentPopUp', function(aiContentPopUp, $) {
  'use strict';

  // An array of content item objects containing information about both the
  // triggering element and the associated content, tooltips, and offcanvas
  // panels.
  var items       = [],
  // A counter to keep track of content item UIDs. Incremented in addItem().
  itemUIDCounter      = 1,

  // The heading level to use for the tooltip and panel titles. Should be 1-6.
  headingLevel      = 2,

  // Base class used to derive BEM-style classes. This is applied to the pop-
  // up container that holds the title and content.
  baseClass       = 'content-popup',
  // Title element class.
  titleClass        = baseClass + '__title',
  // Content element class.
  contentClass      = baseClass + '__content',

  // The offcanvas panel instance.
  panelInstance,
  // The media query object used to determine if we should use the offcanvas
  // panel or the tooltip for the content popup.
  panelMediaQuery     = aiMediaQuery.getQuery('(max-width: 30em)'),
  // The base class for the hidden open button required to open the offcanvas
  // panel.
  panelOpenButtonClass  = baseClass + '-offcanvas-button',
  // The base class for the panel itself.
  panelBaseClass      = baseClass + '-offcanvas',
  // The ID for the panel. This is required for the offcanvas selector.
  panelID         = panelBaseClass,
  // The panel title element class.
  panelTitleClass     = panelBaseClass + '__title',
  // The panel content element class.
  panelContentClass   = panelBaseClass + '__content',
  // The panel open button jQuery collection.
  $panelOpenButton    = $(),
  // The panel element jQuery collection.
  $panel          = $(),
  // The panel title element jQuery collection.
  $panelTitle       = $(),
  // The panel content element jQuery collection.
  $panelContent     = $(),

  // Allowed theme values.
  allowedThemes     = ['light', 'dark'],

  // Default settings.
  defaultSettings     = {
    // Shortcut for setting the offcanvas panel and tooltip themes. See
    // allowedThemes.
    theme:    'dark',

    // These are passed to the tooltip component.
    tooltip:  {
      tippy: {
        interactive:  true
      }
    },
    // These are passed to the offcanvas component. Note that we currently
    // have one panel active, so changing these per group of triggers has
    // no effect.
    // @todo Rework the panel code so that settings can be changed per
    // trigger group.
    offcanvas:  {
      openButtonClasses:  [panelOpenButtonClass],
      closeButtonClasses: ['material-button'],
      panelSelector:    '#' + panelID,
      panelLocation:    'bottom'
    }
  };

  /**
   * FastDom instance.
   *
   * @type {FastDom}
   */
  const fastdom = aiFastDom.getInstance();

  /**
   * Whether the panel is used after an attach.
   *
   * This is intended to prevent the panel being visible in the DOM if it's
   * erroneously inserted but the CSS is no longer present on the page.
   *
   * @type {Boolean}
   *
   * @see initPanel()
   *   Documents the reason for this. Will be removed when this component is
   *   refactored.
   */
  let panelUsed = false;

  /**
   * Get the index of the given trigger in the items array.
   *
   * @param {HTMLElement} trigger
   *   The element to search for.
   *
   * @return {Integer}
   *   A zero-based index or -1 if not found.
   */
  function getItemIndex(trigger) {

    if (!('aiContentPopUp' in trigger)) {
      return -1;
    }

    for (var i = items.length - 1; i >= 0; i--) {
      if (items[i].uid === trigger.aiContentPopUp.uid) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Trigger activate event handler.
   *
   * This opens the panel (if within the media query), setting the trigger's
   * associated title and content to the panel. If a Tippy tooltip is active
   * for the trigger, or the panel is active, the default action is prevented.
   */
  function triggerActivateHandler(event) {
    // Don't do anything and defer to the default action if a modifier key
    // was pressed during the click (to open the link in a new tab, window,
    // etc.) - note that this is a truthy check rather than a strict check
    // for the existence of and boolean true value of the various event
    // properties:
    // * https://ambientimpact.com/web/snippets/conditional-statements-and-truthy-values-robust-client-side-javascript
    // * https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/ctrlKey
    // * https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/shiftKey
    if (event.ctrlKey || event.shiftKey) {
      return;
    }

    var $trigger  = $(event.target),
      itemObject  = event.data.itemObject;

    // If we're within the panel media query, replace any existing title and
    // content in the panel with this item's title and content, and trigger
    // the panel to open via the hidden open button. 'Tis a hack, but it
    // works.
    if (panelMediaQuery.matches) {
      setPanelItem(itemObject);

      // When the panel closes, return focus to the trigger again for
      // keyboard or other non-pointer navigation.
      // @todo Shouldn't the offcanvas component already be doing this for
      // us?
      $panel.one('closeOffcanvas.aiContentPopUp', function(event) {
        $trigger.focus();
      });

      fastdom.mutate(function() {

        if (panelUsed === true) {
          return;
        }

        // Remove the hidden attributes if the panel is needed.
        $panel.removeAttr('hidden');

        panelUsed = true;

      // We need to delay triggering the panel open until at least one frame has
      // been painted, so that the browser has a chance to paint the panel as
      // unhidden, otherwise transitions won't run.
      //
      // @see https://stackoverflow.com/questions/61017477/requestanimationframe-inside-a-promise#61020604
      //   Describes how to Promise-ify requestAnimationFrame.
      }).then(function() {
        return new Promise(requestAnimationFrame);
      // At this point we haven't painted a new frame yet but the browser is
      // indicating one is ready to paint.
      }).then(function() {
        return new Promise(requestAnimationFrame);
      // Now we have painted a frame, so we can trigger the panel open on the
      // next frame.
      }).then(function() {
        $panelOpenButton.trigger('click')
      });

    }

    // Prevent the trigger's default action if tooltips or the panel are
    // active, so that touch can trigger the popup without initiating
    // anything else. This should be at the end of this handler in case
    // there's any error in the preceding code, to avoid preventing the
    // action when we don't have a tooltip or panel operating correctly.
    if (
      typeof $trigger.attr('data-tippy') === 'string' ||
      $panel.hasClass('offcanvas-panel--is-ready')
    ) {
      event.preventDefault();
    }
  };

  /**
   * Add content popup functionality to a provided trigger element.
   *
   * @param {HTMLElement} trigger
   *   The element to add content popup functionality to.
   *
   * @param {object} options
   *   Options to use for this trigger element. Will be merged on top of
   *   {@link defaultSettings}, which contains the default structure so refer
   *   to that.
   *
   * @return {Object}
   *   The object created by this function, containing a UID, the $trigger
   *   element, the $title element, the $content element, and the Tippy
   *   instance.
   */
  function addItem(trigger, options) {
    if (typeof options !== 'object') {
      options = {};
    }

    var $trigger  = $(trigger),
      $title    = $(
        '<h' + headingLevel + '></h' + headingLevel + '>'
      ),
      $content  = $('<div></div>'),
      settings  = $.extend(true, {}, defaultSettings, options),
      itemObject  = {
        uid:    itemUIDCounter++,
        settings: settings,
        $trigger: $trigger,
        $title:   $title,
        $content: $content,
        tippy:    undefined
      };

    // Make sure the theme is a valid value, using the default if not.
    if (allowedThemes.indexOf(settings.theme) === -1) {
      settings.theme = defaultSettings.theme;
    }

    // Set the tooltip theme with our theme setting if none has been set.
    // @todo Should this be hard-coded?
    if (!('theme' in settings.tooltip.tippy)) {
      settings.tooltip.tippy.theme =
        'material-' + itemObject.settings.theme;
    }

    // Add classes to the title and content to identify them.
    $title.addClass(titleClass);
    $content.addClass(contentClass);

    $trigger
      // Trigger an event on the trigger element to fetch the title and
      // content, which are passed as additional parameters.
      .trigger('contentPopUpContent', [$title, $content])
      // Bind the activate handler to the click event.
      // @todo Pointer events?
      .on('click.aiContentPopUp', {
        itemObject: itemObject
      }, triggerActivateHandler);

    items.push(itemObject);

    initItemTooltip(itemObject);

    trigger.aiContentPopUp = itemObject;

    return itemObject;
  }

  /**
   * Add content popup functionality to provided trigger elements.
   *
   * @param {jQuery|HTMLElement|string|array} $triggers
   *   Anything that can be passed to jQuery that results in a collection
   *   containing one or more elements to add content popup functionality for.
   *   See {@link https://api.jquery.com/jQuery/} for details.
   *
   * @param {object} options
   *   Options to use for this set of trigger elements. Will be merged on top
   *   of {@link defaultSettings}, which contains the default structure so
   *   refer to that.
   */
  this.addItems = function($triggers, options) {
    if (!('jquery' in $triggers)) {
      $triggers = $($triggers);
    }

    if ($triggers.length === 0) {
      console.error(Drupal.t(
        '$triggers does not have any elements in it.'
      ));

      return;
    }

    for (var i = 0; i < $triggers.length; i++) {
      addItem($triggers[i], options);
    }
  };

  /**
   * Remove content popup functionality from a provided trigger element.
   *
   * @param {HTMLElement} trigger
   *   The trigger element to remove content popup functionality from.
   */
  function removeItem(trigger) {
    var $trigger  = $(trigger),
      i     = getItemIndex(trigger),
      itemObject  = undefined;

    if (i === -1) {
      return;
    }

    itemObject = items[i];

    aiTooltip.destroy(trigger);

    $trigger.off('click.aiContentPopUp');

    items.splice(i, 1);

    delete trigger.aiContentPopUp;
  }

  /**
   * Remove content popup functionality from provided trigger elements.
   *
   * @param {jQuery|HTMLElement|string|array} $triggers
   *   Anything that can be passed to jQuery that results in a collection
   *   containing one or more elements to remove content popup functionality
   *   from. See {@link https://api.jquery.com/jQuery/} for details.
   */
  this.removeItems = function($triggers) {
    if (!('jquery' in $triggers)) {
      $triggers = $($triggers);
    }

    if ($triggers.length === 0) {
      console.error(Drupal.t(
        '$triggers does not have any elements in it.'
      ));

      return;
    }

    for (var i = 0; i < $triggers.length; i++) {
      removeItem($triggers[i]);
    }
  };

  /**
   * Initialize a given item's tooltip, if the media query allows it.
   *
   * @param {object} itemObject
   *   The item object. See {@link addItem} for structure of this.
   */
  function initItemTooltip(itemObject) {
    // Don't create or enable the tooltips if the panel media query matches,
    // as we're using the panel.
    if (panelMediaQuery.matches) {
      return;
    }

    // If a Tippy tooltip already exists on the element, enable it and
    // return.
    if (
      AmbientImpact.objectPathExists('tippy.enable', itemObject) &&
      typeof itemObject.tippy.enable === 'function'
    ) {
      itemObject.tippy.enable();

      return;
    }

    // Remove the panel title and content classes from this item's
    // respective elements.
    itemObject.$title.removeClass(panelTitleClass);
    itemObject.$content.removeClass(panelContentClass);

    // Show title and content elements if they contain anything, otherwise
    // hide them.
    if (itemObject.$title.contents().length > 0) {
      itemObject.$title.removeClass('element-hidden');
    } else {
      itemObject.$title.addClass('element-hidden');
    }
    if (itemObject.$content.contents().length > 0) {
      itemObject.$content.removeClass('element-hidden');
    } else {
      itemObject.$content.addClass('element-hidden');
    }

    // Create the tooltip, passing it a created container which contains the
    // title/content.
    aiTooltip.create(
      itemObject.$trigger[0],
      $.extend(true, {}, itemObject.settings.tooltip, {tippy: {
        html: $('<div></div>').addClass(baseClass).append(
          itemObject.$title,
          itemObject.$content
        )[0]
      }})
    );

    itemObject.tippy = itemObject.$trigger[0]._tippy;
  };

  /**
   * Initialize/create/enable tooltips if the media query allows it.
   */
  function initTooltips() {
    // Don't create or enable the tooltips if the panel media query matches,
    // as we're using the panel.
    if (panelMediaQuery.matches) {
      return;
    }

    for (var i = items.length - 1; i >= 0; i--) {
      initItemTooltip(items[i]);
    }
  }

  /**
   * Disable any existing tooltips.
   */
  function disableTooltips() {
    if (!panelMediaQuery.matches) {
      return;
    }

    for (var i = items.length - 1; i >= 0; i--) {
      if (
        !AmbientImpact.objectPathExists('tippy.disable', items[i]) ||
        typeof items[i].tippy.disable !== 'function'
      ) {
        continue;
      }

      items[i].tippy.disable();
    }
  }

  /**
   * Initialize the offcanvas panel to display items on narrow screens.
   *
   * This will only initialize the panel if it hasn't been already and only
   * if the media query matches.
   *
   * Also of note is that the button is not actually ever visible as it is set
   * to display: none;. The button is there as it is the only way to trigger
   * the canvas to open, until that component is rewritten.
   *
   * @todo Remove the need for the open button once offcanvas is re-written.
   */
  function initPanel() {
    if (
      typeof panelInstance !== 'undefined' ||
      !panelMediaQuery.matches
    ) {
      return;
    }

    $panelOpenButton  = $('<button></button>');
    $panel        = $('<div></div');
    $panelTitle     = $(
      '<h' + headingLevel + '></h' + headingLevel + '>'
    );
    $panelContent   = $('<div></div');

    $panelOpenButton
      .text('Content pop-up open button')
      // Set the hidden attribute in case stylesheets fail to load.
      //
      // See also the notes for the $panel hidden attribute below.
      .attr('hidden', true)
      .appendTo('body');

    $panelTitle
      .addClass([titleClass, panelTitleClass].join(' '));

    $panelContent
      .addClass([contentClass, panelContentClass].join(' '));

    $panel
      .attr('id', panelID)
      .addClass([baseClass, panelBaseClass].join(' '))
      .prepend($panelTitle, $panelContent)
      // Set the hidden attribute to ensure this remains hidden even if
      // stylesheets fail to load or are removed, e.g. after a Turbo visit to a
      // page that no longer has the off-canvas or content pop-up CSS.
      //
      // @see addItem()
      //   Removes this when is added if the panelUsed variable is false.
      //
      // @see destroy()
      //   Sets panelUsed back to false.
      //
      // @see https://www.drupal.org/project/refreshless/issues/3416734
      //   Open issue to remove behaviours to fix this kind of problem.
      //
      // @todo Revisit this when refactoring this component as OOP and better
      //   behaviours.
      .attr('hidden', true)
      .appendTo('body');

    panelInstance = aiOffcanvas.init($panel, $.extend(
      true, {}, defaultSettings.offcanvas, {openButton: $panelOpenButton}
    ));
  }

  /**
   * Destroy the currently active instance.
   */
  function destroy() {

    // Only attempt to destroy if a panel has been created, as on larger screens
    // it likely will not have been.
    if ($panel.length > 0) {

      aiOffcanvas.destroy($panel);

      $panel.detach();

      $panelOpenButton.detach();

    }

    panelInstance = undefined;

    panelUsed = false;

  };

  /**
   * Set the panel title and content to that of the provided item.
   *
   * @param {object} itemObject
   *   The item object. See {@link addItem} for the structure of this.
   */
  function setPanelItem(itemObject) {
    // Save cloned title and content elements from the item object.
    var $newPanelTitle    = itemObject.$title.clone(),
      $newPanelContent  = itemObject.$content.clone();

    // Add relevant classes to the title and content and insert them after
    // the existing title and content in the panel.
    $newPanelTitle
      .addClass([titleClass, panelTitleClass].join(' '))
      .insertAfter($panelTitle);
    $newPanelContent
      .addClass([contentClass, panelContentClass].join(' '))
      .insertAfter($panelContent);

    // Remove the old panel title and content elements, and remove their
    // respective panel titles as they may be used in tooltips later.
    $panelTitle
      .remove()
      .removeClass(panelTitleClass);
    $panelContent
      .remove()
      .removeClass(panelContentClass);

    // Replace the old title and content variables with the new ones.
    $panelTitle   = $newPanelTitle;
    $panelContent = $newPanelContent;

    // Show title and content elements if they contain anything, otherwise
    // hide them.
    if ($panelTitle.contents().length > 0) {
      $panelTitle.removeClass('element-hidden');
    } else {
      $panelTitle.addClass('element-hidden');
    }
    if ($panelContent.contents().length > 0) {
      $panelContent.removeClass('element-hidden');
    } else {
      $panelContent.addClass('element-hidden');
    }

    switch (itemObject.settings.theme) {
      case 'dark':
        $panel
          .removeClass('offcanvas-panel--theme-light')
          .addClass('offcanvas-panel--theme-dark');

        break;

      case 'light':
        $panel
          .removeClass('offcanvas-panel--theme-dark')
          .addClass('offcanvas-panel--theme-light');

        break;
    }
  }

  this.addBehaviour(
    'AmbientImpactContentPopup',
    'ambientimpact-content-popup',
    'body',
    function(context, settings) {

      initPanel();

      // Initialize the panel, tooltips, and disable tooltips when the media
      // query matches or no longer matches. These all have checks for the
      // current media query state, so they can be bound like this without any
      // checks here.
      aiMediaQuery.onMedia(panelMediaQuery, initPanel);
      aiMediaQuery.onMedia(panelMediaQuery, initTooltips);
      aiMediaQuery.onMedia(panelMediaQuery, disableTooltips);

    },
    function(context, settings, trigger) {

      aiMediaQuery.offMedia(panelMediaQuery, initPanel);
      aiMediaQuery.offMedia(panelMediaQuery, initTooltips);
      aiMediaQuery.offMedia(panelMediaQuery, disableTooltips);

      destroy();

    }
  );

});
});
