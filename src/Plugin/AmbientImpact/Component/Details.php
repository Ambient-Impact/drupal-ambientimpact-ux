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
 *   description  = @Translation("Provides animations for <a href='https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details'><code>&lt;details&gt;</code> elements</a> loosely based on <a href='https://css-tricks.com/how-to-animate-the-details-element/'>How to Animate the Details Element on CSS-Tricks</a> but with significant code quality and accessibility improvements.")
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
    $cssTricksLink = new Link($this->t(
      'How to Animate the Details Element on CSS-Tricks',
    ), Url::fromUri(
      'https://css-tricks.com/how-to-animate-the-details-element/',
    ));

    /** @var \Drupal\Core\Link */
    $detailsMdnLink = new Link(
      $this->t('<code>&lt;details&gt;</code> elements'), Url::fromUri(
        'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details',
      ),
    );

    /** @var \Drupal\Core\Link */
    $toggleEventMdnLink = new Link(
      $this->t('the <code>toggle</code> event'), Url::fromUri(
        'https://developer.mozilla.org/en-US/docs/Web/API/HTMLDetailsElement/toggle_event',
      ),
    );

    /** @var \Drupal\Core\Link */
    $openAttributeMdnLink = new Link(
      $this->t('the <code>open</code> attribute'), Url::fromUri(
        'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details#open',
      ),
    );

    /** @var \Drupal\Core\Link */
    $openPropertyMdnLink = new Link($this->t(
      'the <code>open</code> <abbr title="Document Object Model">DOM</abbr> property',
    ), Url::fromUri(
      'https://developer.mozilla.org/en-US/docs/Web/API/HTMLDetailsElement/open',
    ));

    /** @var \Drupal\Core\Link */
    $cssOnlyPenLink = new Link($this->t(
      'a <abbr title="Cascading Style Sheets">CSS</abbr>-only solution',
    ), Url::fromUri('https://codepen.io/jgustavoas/pen/rNQyxWa'));

    /** @var \Drupal\Core\Link */
    $motionOneLink = new Link($this->t(
      'the Motion One library',
    ), Url::fromUri('https://motion.dev/'));

    /** @var \Drupal\Core\Link */
    $inertMdnLink = new Link($this->t(
      'the <code>inert</code> attribute',
    ), Url::fromUri(
      'https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inert',
    ));

    /** @var \Drupal\Core\Link */
    $allyJsMainDisabledLink = new Link($this->t(
      '<code>ally.maintain.disabled</code>',
    ), Url::fromUri('https://allyjs.io/api/maintain/disabled.html'));

    return [
      '#intro' => [
        '#type'       => 'html_tag',
        '#tag'        => 'p',
        '#value'      => $this->t(
          'This provides robust animations for @detailsMdnLink while trying to avoid affecting the accessibility or semantics of the elements.',
          // Unfortunately, this needs to be rendered here or it'll cause a
          // fatal error when Drupal tries to pass them to \htmlspecialchars().
          [
            '@detailsMdnLink' => $detailsMdnLink->toString(),
          ],
        ),
      ],
      '#demo' => [
        [
          '#title'        => $this->t('How and why'),
          '#description'  => $this->t(
            'This was originally inspired by @cssTricksLink but was completely overhauled from the original implementation; unlike the CSS-Tricks implementaton, we <em>do not</em> listen to <code>click</code> or other UI events, instead acting only on @toggleEventMdnLink which is the recommended approach as it\'s triggered whenever anything adds or removes @openAttributeMdnLink or changes @openPropertyMdnLink, be it mouse, keyboard, touch, a screen reader, etc. We also <em>do not</em> change the the <code>open</code> attribute or property at any point to accomplish the animation, unlike the CSS-Tricks solution.',
            [
              '@cssTricksLink'        => $cssTricksLink->toString(),
              '@toggleEventMdnLink'   => $toggleEventMdnLink->toString(),
              '@openAttributeMdnLink' => $openAttributeMdnLink->toString(),
              '@openPropertyMdnLink'  => $openPropertyMdnLink->toString(),
            ],
          ),
        ] + $details,
        [
          '#title'        => $this->t('What about a CSS-only solution?'),
          '#description'  => [
            'intro' => [
              '#type'   => 'html_tag',
              '#tag'    => 'p',
              '#value'  => $this->t(
                'While it could have been possible to create @cssOnlyPenLink, there are multiple limitations with such an approach:',
                [
                  '@cssOnlyPenLink' => $cssOnlyPenLink->toString(),
                ],
              ),
            ],
            'list' => [
              '#theme'      => 'item_list',
              '#list_type'  => 'ol',
              '#items'      => [
                $this->t(
                  'There is no way to prevent the content disappearing instantly before the close animation has started without resorting to moving the content outside of the <code>&lt;details&gt;</code> becase browsers seem to provide no way to force the content to be displayed once the the <code>open</code> attribute is removed.',
                ),
                $this->t(
                  'There is currently no CSS-only way to transition from a fixed height to the natural content height; the workaround most solutions use is to animate the <code>max-height</code> which is set to a large value when open so that there\'s a fixed to transition to; while this does transition open and close, the open transition doesn\'t come to smooth stop but usually ends abruptly due to the transition continuing on past the natural content height.',
                ),
              ],
            ],
          ],
        ] + $details,
        [
          '#title'        => $this->t('So how does this work?'),
          '#description'  => [
            'intro' => [
              '#type'   => 'html_tag',
              '#tag'    => 'p',
              '#value'  => $this->t(
                'The goals were to avoid moving the content outside of the <code>&lt;details&gt;</code> or to a different location within the <code>&lt;details&gt;</code> while also animating the open and close and having them come to a stop smoothly at the natural content height. To accomplish this, a JavaScript solution was needed. Animation is done via @motionOneLink, which allows for precise start and end heights. That solved part of the problem, but:',
                [
                  '@motionOneLink'  => $motionOneLink->toString(),
                ],
              ),
            ],
            'list' => [
              '#theme'      => 'item_list',
              '#list_type'  => 'ol',
              '#items'      => [
                $this->t(
                  'We couldn\'t rely on the content itself to measure the height of, as it would take up zero height half the time, i.e. when @openAttributeMdnLink was present on the <code>&lt;details&gt;</code>.',
                  [
                    '@openAttributeMdnLink' => $openAttributeMdnLink->toString(),
                  ],
                ),
                $this->t(
                  'Even with an accurate height being always known, the existing content would instantly disappear before the close animation had begun.',
                ),
              ],
            ],
            'solution' => [
              '#type'   => 'html_tag',
              '#tag'    => 'p',
              '#value'  => $this->t(
                'The one place in the <code>&lt;details&gt;</code> that the browser doesn\'t automagically hide? The <code>&lt;summary&gt;</code> element. We leave the existing content where it is but clone it to the <code>&lt;summary&gt;</code> element; care is taken to hide the clone from the accessibility tree and to make the it completely uninteractable via @inertMdnLink in browsers that support it and falling back to @allyJsMainDisabledLink in ones that don\'t. This clone is what we use to always have an up to date and accurate measurement of the content height, and doubles as what you see sliding in and out during the open and clone animations. The clone is also kept up to date with the real content so any DOM manipulations after we attach are taken into account.',
                [
                  '@inertMdnLink'           => $inertMdnLink->toString(),
                  '@allyJsMainDisabledLink' => $allyJsMainDisabledLink->toString(),
                ],
              ),
            ],
          ],
        ] + $details,
        [
          '#title' => $this->t('They can start open'), '#open' => true,
          '#description'  => [
            'info' => [
              '#type'   => 'html_tag',
              '#tag'    => 'p',
              '#value'  => $this->t(
                'Just set @openAttributeMdnLink like you would without this component.',
                [
                  '@openAttributeMdnLink' => $openAttributeMdnLink->toString(),
                ],
              ),
            ],
            'lorem' => [
              '#type'   => 'html_tag',
              '#tag'    => 'p',
              '#value'  => $lorem,
            ],
          ],
        ] + $details,
        [
          '#title' => $this->t('They can be nested'),
          '#description'  => $this->t(
            'This posed additional challenges as parent or ancestor <code>&lt;details&gt;</code> elements now needed to account for child or descendent <code>&lt;details&gt;</code> being open; the original implementation relied on setting an inline height and updating that whenever the content size changed, but this turned out to be a nightmare to keep synced and also not lag behind and so have visible content overflow for a few frames. The solution involves only ever having a fixed height during the open and clone animations, rebuilding the cloned content before every animation, and the last piece of the puzzle: an animated <code>&lt;details&gt;</code> will trigger an event when its cloned content is rebuilt, which bubbles up the <abbr title="Document Object Model">DOM</abbr> tree, allowing any parent or ancestor <code>&lt;details&gt;</code> to rebuild its copy of the cloned content, all without having to know the specifics of its children or descendents.',
          ),
          'nested' => [
            '#title' => $this->t('Nest away!'),
            'nested' => [
              '#title' => $this->t('But probably not this much'),
              'nested' => [
                '#title' => $this->t('This is kind of silly'),
              ] + $details,
            ] + $details,
          ] + $details,
        ] + $details,
        [
          '#title' => $this->t(
            'This one is styled but opening and closing is left as the browser default',
          ),
          '#description'  => [
            'boring' => [
              '#type'   => 'html_tag',
              '#tag'    => 'p',
              '#value'  => $this->t('In other words, this is how it behaves if the JavaScript fails to load or attach: not as smooth, but you can still access the content within.'),
            ],
            'lorem' => [
              '#type'   => 'html_tag',
              '#tag'    => 'p',
              '#value'  => $lorem,
            ],
          ],
          '#attributes' => ['class' => ['details--demo-not-animated']],
        ] + $details,
        [
          '#title' => $this->t(
            'This is how it looks with your browser\'s default styles',
          ),
          '#description'  => [
            'boring' => [
              '#type'   => 'html_tag',
              '#tag'    => 'p',
              '#value'  => $this->t('Pretty boring, right?'),
            ],
            'lorem' => [
              '#type'   => 'html_tag',
              '#tag'    => 'p',
              '#value'  => $lorem,
            ],
          ],
          '#attributes' => ['class' => [
            'details--demo-not-animated', 'details--demo-unstyled',
          ]],
        ] + $details,
      ],
    ];

  }

}
