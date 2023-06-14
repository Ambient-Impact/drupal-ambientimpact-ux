<?php

namespace Drupal\ambientimpact_ux\EventSubscriber\Form;

use Drupal\core_event_dispatcher\Event\Form\FormAlterEvent;
use Drupal\core_event_dispatcher\FormHookEvents;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * hook_form_alter() event subscriber class.
 */
class FormAlterEventSubscriber implements EventSubscriberInterface {
  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents() {
    return [
      FormHookEvents::FORM_ALTER => 'formAlter',
    ];
  }

  /**
   * Alter all forms.
   *
   * This does the following:
   *
   * - Attaches the form component library.
   *
   * @param \Drupal\core_event_dispatcher\Event\Form\FormAlterEvent $event
   *   The event object.
   */
  public function formAlter(FormAlterEvent $event) {
    $form = &$event->getForm();

    $form['#attached']['library'][] = 'ambientimpact_ux/component.form';
  }
}
