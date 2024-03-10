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
 *   description  = @Translation("Provides enhancements for <a href='https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details'>&lt;details&gt; elements</a>.")
 * )
 */
class Details extends ComponentBase {

  /**
   * {@inheritdoc}
   */
  public function getDemo(): array {

    $lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

    $details = [
      '#type'         => 'details',
      '#title'        => $this->t('More info'),
      '#description'  => $lorem,
      '#attached'     => ['library' => ['ambientimpact_ux/component.details']],
    ];

    /** @var \Drupal\Core\Url */
    $mdnUrl = Url::fromUri(
      'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details',
    );

    /** @var \Drupal\Core\Link */
    $mdnLink = new Link(
      $this->t('&lt;details&gt; elements'), $mdnUrl,
    );

    return [
      '#intro' => [
        '#type'       => 'html_tag',
        '#tag'        => 'p',
        '#value'      => $this->t(
          'This provides enhancements for @detailsElementLink.',
          // Unfortunately, this needs to be rendered here or it'll cause a
          // fatal error when Drupal tries to pass it to \htmlspecialchars().
          ['@detailsElementLink' => $mdnLink->toString()],
        ),
      ],
      '#demo' => [$details, $details, $details],
    ];

  }

}
