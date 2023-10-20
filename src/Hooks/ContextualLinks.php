<?php

declare(strict_types=1);

namespace Drupal\ambientimpact_ux\Hooks;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Database\Connection;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Entity\EntityTypeBundleInfoInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\hux\Attribute\Alter;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Contextual links hook implementations.
 */
class ContextualLinks implements ContainerInjectionInterface {

  /**
   * Hook constructor; saves dependencies.
   *
   * @param \Drupal\Core\Database\Connection $connection
   *   The current primary database connection.
   *
   * @param \Drupal\Core\Entity\EntityTypeBundleInfoInterface $entityTypeBundleInfo
   *   The Drupal entity type bundle info service.
   *
   * @param \Drupal\Core\StringTranslation\TranslationInterface $stringTranslation
   *   The Drupal string translation service.
   */
  public function __construct(
    protected readonly Connection $connection,
    protected readonly EntityTypeBundleInfoInterface $entityTypeBundleInfo,
    protected $stringTranslation,
  ) {}

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('database'),
      $container->get('entity_type.bundle.info'),
      $container->get('string_translation'),
    );
  }

  #[Alter('contextual_links')]
  /**
   * Implements \hook_contextual_links_alter().
   *
   * This alters entity contextual link labels to include their entity bundles
   * so that the user has better context of what's being acted upon. The
   * following entities are currently supported:
   *
   * - media
   *
   * - nodes
   */
  public function alter(
    array &$links, string $group, array $routeParameters,
  ): void {

    switch ($group) {
      case 'media':
      case 'node':
        break;
      default:
        return;
    }

    // These are the routes we alter. We don't want to alter all route labels
    // without knowing what we're going to alter, so this ensures we don't break
    // other contextual links that may be added in a different label format.
    $alterRoutes = [
      'entity.media.edit_form',
      'entity.media.delete_form',
      'entity.node.edit_form',
      'entity.node.delete_form',
    ];

    // Don't do any work if none of the routes are found in $links.
    if (count(array_intersect($alterRoutes, array_keys($links))) === 0) {
      return;
    }

    // Find the entity's type using a static database query. This should be far
    // more performant than loading the whole entity.
    switch ($group) {

      case 'media':

        $query = $this->connection->query(
          'SELECT bundle FROM {media} WHERE mid = :mid',
          [
            ':mid' => $routeParameters['media'],
          ]
        );

        break;

      case 'node':

        $query = $this->connection->query(
          'SELECT type FROM {node} WHERE nid = :nid',
          [
            ':nid' => $routeParameters['node'],
          ]
        );

        break;
    }

    $result = $query->fetchAll();

    // Most entities use a 'bundle' field to store the bundle machine name.
    if (!empty($result[0]->bundle)) {
      $machineName = $result[0]->bundle;

    // Nodes use 'type' rather than 'bundle', probably for legacy reasons.
    } else if (!empty($result[0]->type)) {
      $machineName = $result[0]->type;
    }

    // Don't do anything if we don't have a machine name to work with for whatever
    // reason.
    if (empty($machineName)) {
      return;
    }

    // Load all available entity bundles, which includes their labels.
    $bundles = $this->entityTypeBundleInfo->getBundleInfo($group);

    // Don't proceed if the machine name doesn't exist in the bundles for whatever
    // unexpected reason.
    if (empty($bundles[$machineName]['label'])) {
      return;
    }

    $bundleLabel = $bundles[$machineName]['label'];

    // If the only the first character is upper case, lower it. This regular
    // expression tries to match the first two characters as uppercase letters to
    // infer if this is a normal word so that we don't mess up an abbreviation or
    // other acronym.
    if (preg_match('%^[A-Z]{2}%', $bundleLabel) !== 1) {
      $bundleLabel = lcfirst($bundleLabel);
    }

    foreach ($links as $routeName => $link) {
      if (!in_array($routeName, $alterRoutes)) {
        continue;
      }

      $links[$routeName]['title'] = $this->t(
        '@contextualAction @bundleLabel',
        [
          '@contextualAction' => $links[$routeName]['title'],
          '@bundleLabel'      => $bundleLabel,
        ]
      );
    }

  }

}
