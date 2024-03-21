<?php

declare(strict_types=1);

namespace Drupal\ambientimpact_ux\Plugin\AmbientImpact\Component;

use Drupal\ambientimpact_core\ComponentBase;
use Drupal\Core\Link;
use Drupal\Core\Url;

/**
 * Details component.
 *
 * @Component(
 *   id           = "details",
 *   title        = @Translation("Details"),
 *   description  = @Translation("Provides animations for <a href='https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details'>&lt;details&gt; elements</a> loosely based on <a href='https://css-tricks.com/how-to-animate-the-details-element/'>How to Animate the Details Element on CSS-Tricks</a> but with significant code quality and accessibility improvements.")
 * )
 *
 * @see \Drupal\Core\Render\Element\Details
 */
class Details extends ComponentBase {

  /**
   * {@inheritdoc}
   */
  public function getDemo(): array {

    $lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

    $details = [
      '#type'         => 'details',
      '#description'  => $lorem,
      '#attached'     => ['library' => [
        'ambientimpact_ux/component.details.demo',
      ]],
    ];

    /** @var \Drupal\Core\Link */
    $mdnLink = new Link(
      $this->t('&lt;details&gt; elements'), Url::fromUri(
        'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details',
      ),
    );

    /** @var \Drupal\Core\Link */
    $sourceLink = new Link(
      $this->t('How to Animate the Details Element on CSS-Tricks'),
      Url::fromUri(
        'https://css-tricks.com/how-to-animate-the-details-element/',
      ),
    );

    return [
      '#intro' => [
        '#type'       => 'html_tag',
        '#tag'        => 'p',
        '#value'      => $this->t(
          'This provides animations for @detailsElementLink loosely based on @sourceLink but with significant code quality and accessibility improvements. Toggle the following elements to see this in action:',
          // Unfortunately, these need to be rendered here or they'll cause a
          // fatal error when Drupal tries to pass them to \htmlspecialchars().
          [
            '@detailsElementLink' => $mdnLink->toString(),
            '@sourceLink'         => $sourceLink->toString(),
          ],
        ),
      ],
      '#demo' => [
        $details + ['#title' => $this->t('Toggle me')],
        $details + ['#title' => $this->t('Toggle me too')],
        $details + [
          '#title' => $this->t('This one starts open'), '#open' => true,
        ],
        $details + [
          '#title' => $this->t('This one does not animate open and close'),
          '#attributes' => ['class' => ['details--demo-not-animated']],
        ],
        $details + [
          '#title' => $this->t(
            'This is how it looks with your browser\'s default styles',
          ),
          '#attributes' => ['class' => [
            'details--demo-not-animated', 'details--demo-unstyled',
          ]],
        ],
      ],
    ];

  }

}
