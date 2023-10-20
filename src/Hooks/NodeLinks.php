<?php

declare(strict_types=1);

namespace Drupal\ambientimpact_ux\Hooks;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\hux\Attribute\Alter;
use Drupal\node\NodeInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Node links hook implementations.
 */
class NodeLinks implements ContainerInjectionInterface {

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

  #[Alter('node_links')]
  /**
   * Implements \hook_node_links_alter().
   *
   * This removes the 'Read more' link if a node is displayed in a view mode
   * that's not enabled, i.e. doesn't have custom display settings, and so is
   * falling back to 'default'.
   *
   * @todo Should this be exposed as a setting per node type?
   */
  public function alter(
    array &$links, NodeInterface $node, array &$context,
  ): void {

    // Bail if the view mode is 'default' or the 'Read more' link is not present
    // in the array.
    if (
      $context['view_mode'] === 'default' ||
      !isset($links['node']['#links']['node-readmore'])
    ) {
      return;
    }

    $viewModeConfig = $this->configFactory->get(
      'core.entity_view_display.node.' .
      $node->getType() . '.' .
      $context['view_mode'],
    );

    if ($viewModeConfig->get('status') === false) {
      unset($links['node']['#links']['node-readmore']);
    }

  }

}
