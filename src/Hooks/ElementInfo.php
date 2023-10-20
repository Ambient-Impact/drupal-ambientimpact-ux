<?php

declare(strict_types=1);

namespace Drupal\ambientimpact_ux\Hooks;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\hux\Attribute\Alter;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Element info hook implementations.
 */
class ElementInfo implements ContainerInjectionInterface {

  /**
   * Hook constructor; saves dependencies.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $configFactory
   *   The Drupal configuration object factory service.
   */
  public function __construct(
    protected readonly ConfigFactoryInterface $configFactory,
  ) {}

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('config.factory'),
    );
  }

  #[Alter('element_info')]
  /**
   * Implements \hook_element_info_alter().
   *
   * This attaches the toolbar component to the toolbar element if the admin
   * theme is not set to the Gin theme, which provides its own toolbar styling
   * and JavaScript that can conflict with ours.
    */
  public function alter(array &$info): void {

    if (
      isset($info['toolbar']) &&
      $this->configFactory->get('system.theme')->get('admin') !== 'gin'
    ) {

      $info['toolbar']['#attached'][
        'library'
      ][] = 'ambientimpact_ux/component.toolbar';

    }

  }

}
