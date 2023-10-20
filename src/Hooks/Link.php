<?php

declare(strict_types=1);

namespace Drupal\ambientimpact_ux\Hooks;

use Drupal\ambientimpact_core\ComponentPluginManagerInterface;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\hux\Attribute\Alter;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Link element hook implementations.
 */
class Link implements ContainerInjectionInterface {

  /**
   * Hook constructor; saves dependencies.
   *
   * @param \Drupal\ambientimpact_core\ComponentPluginManagerInterface $componentManager
   *   The component plug-in manager.
   */
  public function __construct(
    protected readonly ComponentPluginManagerInterface $componentManager,
  ) {}

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('plugin.manager.ambientimpact_component'),
    );
  }

  #[Alter('link')]
  /**
   * Implements hook_link_alter().
   *
   * @see \Drupal\ambientimpact_ux\Plugin\AmbientImpact\Component\LinkExternal::processExternalLink()
   *   The $variables array is passed to this method to mark links as external.
   *
   * @see \Drupal\ambientimpact_ux\Plugin\AmbientImpact\Component\LinkImage::processLink()
   *   The $variables array is passed to this method to detect if the link
   *   points to an image file, contains an image, and to alter it based on
   *   those.
   */
  public function alter(array &$variables): void {

    if ($variables['url']->isExternal()) {

      $this->componentManager->getComponentInstance(
        'link.external',
      )->processExternalLink($variables);

    }

    $this->componentManager->getComponentInstance(
      'link.image',
    )->processLink($variables);

  }

}
