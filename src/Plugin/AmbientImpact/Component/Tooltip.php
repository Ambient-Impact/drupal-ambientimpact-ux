<?php

declare(strict_types=1);

namespace Drupal\ambientimpact_ux\Plugin\AmbientImpact\Component;

use Drupal\ambientimpact_core\ComponentBase;
use Drupal\Core\Link;
use Drupal\Core\Url;

/**
 * Tooltip component.
 *
 * @Component(
 *   id = "tooltip",
 *   title = @Translation("Tooltip"),
 *   description = @Translation("Provides a wrapper component around <a href='https://atomiks.github.io/tippyjs/'>Tippy.js</a>.")
 * )
 */
class Tooltip extends ComponentBase {

  /**
   * {@inheritdoc}
   */
  public function getDemo(): array {

    /** @var \Drupal\Core\Link */
    $tippyLink = new Link($this->t('Tippy.js'), Url::fromUri(
      'https://atomiks.github.io/tippyjs/',
    ));

    /** @var \Drupal\Core\Link */
    $abbrMdnLink = new Link(
      $this->t('<code>&lt;abbr&gt;</code> element'), Url::fromUri(
        'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/abbr', [
          'attributes' => [
            'title' => $this->t(
              'The &lt;abbr&gt; HTML element represents an abbreviation or acronym',
            ),
          ],
        ],
      ),
    );

    /** @var \Drupal\Core\Link */
    $titleAttrMdnLink = new Link(
      $this->t('<code>title</code> attribute'), Url::fromUri(
        'https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/title', [
          'attributes' => [
            'title' => $this->t(
              'The title global attribute contains text representing advisory information related to the element it belongs to',
            ),
          ],
        ],
      ),
    );

    /** @var \Drupal\Core\Link */
    $mdnLink = new Link(
      $this->t('MDN Web Docs'), Url::fromUri(
        'https://developer.mozilla.org', [
          'attributes' => [
            'target'  => '_blank',
            'title'   => $this->t(
              'You won\'t see this on mobile until you return to this page',
            ),
          ],
        ],
      ),
    );

    /** @var \Drupal\Core\Link */
    $longLink1 = new Link($this->t(
      'to choose the position of the tooltip based on the closest text fragment',
      ), Url::fromUri(
        'https://atomiks.github.io/tippyjs/v6/all-props/#inlinepositioning', [
          'attributes' => [
            'title'   => $this->t('Hello!'),
          ],
        ],
      ),
    );

    /** @var \Drupal\Core\Link */
    $longLink2 = new Link($this->t(
      'via the <code>inlinePositioning</code> property',
      ), Url::fromUri(
        'https://atomiks.github.io/tippyjs/v6/all-props/#inlinepositioning', [
          'attributes' => [
            'title' => $this->t('Hello again!'),
          ],
        ],
      ),
    );

    /** @var \Drupal\Core\Link */
    $longLink3 = new Link($this->t(
      'on these links at the end or start of a line where they wrap',
      ), Url::fromUri(
        'https://developer.mozilla.org/en-US/docs/Web/API/Element/getClientRects', [
          'attributes' => [
            'title' => $this->t('Hellooooo!'),
          ],
        ],
      ),
    );

    /** @var \Drupal\Core\Link */
    $longLink4 = new Link($this->t(
      'resize your browser window if you\'re able to, or rotate your mobile device',
      ), Url::fromUri(
        'https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design', [
          'attributes' => [
            'title' => $this->t('Henlo!'),
          ],
        ],
      ),
    );

    /** @var \Drupal\Core\Link */
    $tippyAnimationsDemoLink = new Link($this->t(
      'all the optional animations',
    ), Url::fromUri(
      'https://atomiks.github.io/tippyjs/#extra-included-animations',
    ));

    /** @var \Drupal\Core\Link */
    $tippyAnimationsDocsLink = new Link($this->t(
      'the Tippy.js animations documentation',
    ), Url::fromUri(
      'https://atomiks.github.io/tippyjs/v6/animations/',
    ));

    $animationButtons = [
      '#type' => 'container',
      '#attributes' => ['class' => ['tooltip-demo-animation-triggers']],
    ];

    foreach ([
      'shift-away',
      'shift-away-subtle',
      'shift-away-extreme',
      'shift-toward',
      'shift-toward-subtle',
      'shift-toward-extreme',
      'scale',
      'scale-subtle',
      'scale-extreme',
      'perspective',
      'perspective-subtle',
      'perspective-extreme',
    ] as $animationName) {

      $animationButtons[$animationName] = [
        '#type'         => 'button',
        '#button_type'  => 'button',
        '#value'        => $animationName,
        '#attributes' => [
          'title' => $this->t('I\'m a tooltip!'),
          'data-tippy-animation' => $animationName,
        ],
      ];

    }

    return [
      '#intro' => [
        '#type'       => 'html_tag',
        '#tag'        => 'p',
        '#value'      => $this->t(
          'This provides a wrapper component around @tippyLink which sets various default values and provides several new plug-ins for themes to customize the behaviour of tooltips with.',
          // Unfortunately, this needs to be rendered here or it'll cause a
          // fatal error when Drupal tries to pass them to \htmlspecialchars().
          [
            '@tippyLink' => $tippyLink->toString(),
          ],
        ),
      ],
      '#demo' => [
        '#attached' => [
          'library' => ['ambientimpact_ux/component.tooltip.demo'],
        ],
        'title_attribute' => [
          '#type' => 'container',

          'heading' => [
            '#type'   => 'html_tag',
            '#tag'    => 'h2',
            '#value'  => $this->t('The title attribute'),
          ],

          'description' => [
            '#type'     => 'html_tag',
            '#tag'      => 'p',
            '#value'    => $this->t(
              'Tooltips can be attached to almost any element, though the most common are those with a @titleAttrMdnLink such as the @abbrMdnLink:',
              [
                '@titleAttrMdnLink' => $titleAttrMdnLink->toString(),
                '@abbrMdnLink'      => $abbrMdnLink->toString(),
              ],
            ),
          ],

          'demo' => [
            '#type'     => 'html_tag',
            '#tag'      => 'blockquote',
            '#value'    => $this->t(
              'The fundamental languages of the web are <abbr title="HyperText Markup Language">HTML</abbr>, <abbr title="Cascading Style Sheets">CSS</abbr>, and JavaScript. These are delivered to browsers using <abbr title="HyperText Transfer Protocol">HTTP</abbr> or <abbr title="HyperText Transfer Protocol Secure">HTTPS</abbr>, the latter of which is preferable because it encrypts data via <abbr title="Transport Layer Security">TLS</abbr> or the now deprecated <abbr title="Secure Sockets Layer">SSL</abbr>.',
            ),
          ],

          'plugin' => [
            '#type'     => 'html_tag',
            '#tag'      => 'p',
            '#value'    => $this->t(
              'This component provides a plug-in to automate this, and is enabled by default. To opt out of this behaviour, set <code>titleAttribute: false</code> in your Tippy.js properties.',
            ),
          ],

        ],
        'ux_issues' => [
          '#type' => 'container',

          'heading' => [
            '#type'   => 'html_tag',
            '#tag'    => 'h2',
            '#value'  => $this->t(
              '<abbr title="user experience">UX</abbr> issues and considerations',
            ),
          ],

          'description' => [
            '#type'     => 'html_tag',
            '#tag'      => 'p',
            '#value'    => $this->t(
              'Buttons and links are another common use for tooltips, but beware that this is not recommended unless special care is taken since touch screens don\'t usually provide a way for a user to hover over an element before activating it, and so would result in pretty bad <abbr title="user experience">UX</abbr>. For an example, tap the following link on a mobile device (it opens in a new tab) and then hit your back button to return to this page: @mdnLink',
              [
                '@mdnLink' => $mdnLink->toString(),
              ],
            ),
          ],

          'button_description' => [
            '#type'     => 'html_tag',
            '#tag'      => 'p',
            '#value'    => $this->t(
              'Here\'s a button that doesn\'t do anything when activated:',
            ),
          ],
          'button_demo' => [
            '#type'         => 'actions',

            'button' => [
              '#type'         => 'button',
              '#button_type'  => 'button',
              '#value'        => $this->t('I\'m a button'),
              '#attributes' => [
                'title' => $this->t(
                  'If this button submitted a form, this tooltip would disappear soon after being shown',
                ),
              ],
            ],
          ],

        ],
        'inline_positioning' => [
          '#type' => 'container',

          'heading' => [
            '#type'   => 'html_tag',
            '#tag'    => 'h2',
            '#value'  => $this->t(
              'Inline positioning',
            ),
          ],

          'long_links' => [
            '#type'     => 'html_tag',
            '#tag'      => 'p',
            '#value'    => $this->t(
              'Another neat trick Tippy.js can do is @longLink1 when text wraps over more than one line @longLink2, which we set to true by default. Try hovering over these or long pressing on a touch screen @longLink3 and watch the tooltip appear where it feels most intuitive rather than at the centre of the entire links\' bounding boxes. In the unlikely case none of these links wrap to a new line, @longLink4.',
              [
                '@longLink1' => $longLink1->toString(),
                '@longLink2' => $longLink2->toString(),
                '@longLink3' => $longLink3->toString(),
                '@longLink4' => $longLink4->toString(),
              ],
            ),
          ],

        ],

        'animations' => [
          '#type' => 'container',

          'heading' => [
            '#type'   => 'html_tag',
            '#tag'    => 'h2',
            '#value'  => $this->t('Animations'),
          ],

          'description' => [
            '#type'     => 'html_tag',
            '#tag'      => 'p',
            '#value'    => $this->t(
              'This also supports @tippyAnimationsDemoLink that ship with Tippy.js, and adding new ones supported as described in @tippyAnimationsDocsLink.',
              [
                '@tippyAnimationsDemoLink' => $tippyAnimationsDemoLink->toString(),
                '@tippyAnimationsDocsLink' => $tippyAnimationsDocsLink->toString(),
              ],
            ),
          ],

          'buttons' => $animationButtons,

        ],
      ],
    ];

  }

}
