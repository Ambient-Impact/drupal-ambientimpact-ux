<?php

declare(strict_types=1);

namespace Drupal\ambientimpact_ux\Plugin\AmbientImpact\Component;

use Drupal\ambientimpact_core\ComponentBase;
use Drupal\Component\Utility\Html;
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
    $inlinePositioningLink = new Link($this->t(
      'via the <code>inlinePositioning</code> property',
    ), Url::fromUri(
      'https://atomiks.github.io/tippyjs/v6/all-props/#inlinepositioning',
    ));

    /** @var \Drupal\Core\Link */
    $inlineFloatingUiLink = new Link($this->t(
      'the Floating UI inline modifier documentation',
    ), Url::fromUri('https://floating-ui.com/docs/inline'));

    $pseudoLink1 = [
      '#type'   => 'html_tag',
      '#tag'    => 'a',
      '#value'  => $this->t('to choose the position of the tooltip'),
      '#attributes' => [
        'title'             => $this->t('Hello!'),
        'data-pseudo-link'  => true,
      ],
    ];

    $pseudoLink2 = [
      '#type'   => 'html_tag',
      '#tag'    => 'a',
      '#value'  => $this->t('the closest text fragment'),
      '#attributes' => [
        'title'             => $this->t('Hellooooo!'),
        'data-pseudo-link'  => true,
      ],
    ];

    $pseudoLink3 = [
      '#type'   => 'html_tag',
      '#tag'    => 'a',
      '#value'  => $this->t('these pseudo-links'),
      '#attributes' => [
        'title'             => $this->t('Hewwo!'),
        'data-pseudo-link'  => true,
      ],
    ];

    $pseudoLink4 = [
      '#type'   => 'html_tag',
      '#tag'    => 'a',
      '#value'  => $this->t('a line where they wrap'),
      '#attributes' => [
        'title'             => $this->t('Henlo!'),
        'data-pseudo-link'  => true,
      ],
    ];

    $pseudoLink5 = [
      '#type'   => 'html_tag',
      '#tag'    => 'a',
      '#value'  => $this->t('the pseudo-links\' bounding boxes'),
      '#attributes' => [
        'title'             => $this->t('Greetings!'),
        'data-pseudo-link'  => true,
      ],
    ];

    $pseudoLink6 = [
      '#type'   => 'html_tag',
      '#tag'    => 'a',
      '#value'  => $this->t('resize your browser window'),
      '#attributes' => [
        'title'             => $this->t('Howdy!'),
        'data-pseudo-link'  => true,
      ],
    ];

    $pseudoLink7 = [
      '#type'   => 'html_tag',
      '#tag'    => 'a',
      '#value'  => $this->t('rotate your mobile device'),
      '#attributes' => [
        'title'             => $this->t('Higgledy-piggledy!'),
        'data-pseudo-link'  => true,
      ],
    ];

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

    /** @var \Drupal\Core\Link */
    $domParserMdnLink = new Link($this->t(
      '<code>DOMParser.parseFromString()</code>',
    ), Url::fromUri(
      'https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString',
    ));

    /** @var \Drupal\Core\Link */
    $tippyHtmlContentLink = new Link($this->t('HTML content'), Url::fromUri(
      'https://atomiks.github.io/tippyjs/v6/html-content/',
    ));

    /** @var \Drupal\Core\Link */
    $tippyAllowHtmlPropLink = new Link($this->t(
      'the <code>allowHTML</code> property',
    ), Url::fromUri(
      'https://atomiks.github.io/tippyjs/v6/all-props/#allowhtml',
    ));

    /** @var \Drupal\Core\Link */
    $xssMdnLink = new Link($this->t(
      'cross-site scripting (XSS)',
    ), Url::fromUri(
      'https://developer.mozilla.org/en-US/docs/Glossary/Cross-site_scripting',
    ));

    /** @var \Drupal\Core\Link */
    $drupalHtmlUtilityLink = new Link($this->t(
      '<code>Drupal\Component\Utility\Html::escape()</code>',
    ), Url::fromUri(
      'https://git.drupalcode.org/project/drupal/-/blob/d40360cb42b154235c5ec3f2edf7696f211f5726/core/lib/Drupal/Component/Utility/Html.php#L431',
    ));

    /** @var \Drupal\Core\StringTranslation\TranslatableMarkup */
    $htmlContent = $this->t(
      '<strong>HTML content</strong> can be automatically parsed while protecting against <em>cross-site scripting exploits</em>. @tippyLink is pretty neat.',
      ['@tippyLink' => $tippyLink->toString()]
    );

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
              'Another neat trick Tippy.js can do is @pseudoLink1 based on @pseudoLink2 when text wraps over more than one line @inlinePositioningLink, which we set to true by default. Try hovering over or tapping @pseudoLink3 at the start or end of @pseudoLink4 and watch the tooltip appear where it feels most intuitive rather than at the centre of @pseudoLink5. In the unlikely case none of these links wrap to a new line, @pseudoLink6 if you\'re able to, @pseudoLink7.',
              [
                '@inlinePositioningLink' => $inlinePositioningLink->toString(),
                // @todo These produce newlines since they're not inline
                //   templates but can't be cast to strings here or Drupal will
                //   escape their HTML. Can we use '#type' => 'inline_template'
                //   instead or something else?
                '@pseudoLink1' => $this->renderer->render($pseudoLink1),
                '@pseudoLink2' => $this->renderer->render($pseudoLink2),
                '@pseudoLink3' => $this->renderer->render($pseudoLink3),
                '@pseudoLink4' => $this->renderer->render($pseudoLink4),
                '@pseudoLink5' => $this->renderer->render($pseudoLink5),
                '@pseudoLink6' => $this->renderer->render($pseudoLink6),
                '@pseudoLink7' => $this->renderer->render($pseudoLink7),
              ],
            ),
          ],

          'more_info' => [
            '#type'   => 'html_tag',
            '#tag'    => 'p',
            '#value'  => $this->t(
              'Please see the diagrams in the @inlineFloatingUiLink for a visual demonstration of the problem without <code>inlinePositioning</code> enabled.',
              ['@inlineFloatingUiLink' => $inlineFloatingUiLink->toString()],
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
              'This also supports @tippyAnimationsDemoLink that ship with Tippy.js, and adding new ones is supported as described in @tippyAnimationsDocsLink.',
              [
                '@tippyAnimationsDemoLink' => $tippyAnimationsDemoLink->toString(),
                '@tippyAnimationsDocsLink' => $tippyAnimationsDocsLink->toString(),
              ],
            ),
          ],

          'buttons' => $animationButtons,

        ],

        'html_content' => [
          '#type' => 'container',

          'heading' => [
            '#type'   => 'html_tag',
            '#tag'    => 'h2',
            '#value'  => $this->t('HTML content'),
          ],

          'description' => [
            '#type'     => 'html_tag',
            '#tag'      => 'p',
            '#value'    => $this->t(
              'Tippy.js supports @tippyHtmlContentLink, but it must be explicitly opted in via the @tippyAllowHtmlPropLink to protect against @xssMdnLink. We provide a plug-in that defines a <code>htmlContentAttribute</code> property; if this property is set to a string, we attempt to retrieve HTML content from an attribute by that name; we then parse it using @domParserMdnLink which will automatically strip any cross-site scripts for us, and we unescape any HTML entities while doing so. Note that this means you should always escape any HTML you place into this attribute - for example using @drupalHtmlUtilityLink - to ensure it doesn\'t get parsed incorrectly by browsers.',
              [
                '@domParserMdnLink' => $domParserMdnLink->toString(),
                '@tippyAllowHtmlPropLink' => $tippyAllowHtmlPropLink->toString(),
                '@tippyHtmlContentLink' => $tippyHtmlContentLink->toString(),
                '@xssMdnLink' => $xssMdnLink->toString(),
                '@drupalHtmlUtilityLink' => $drupalHtmlUtilityLink->toString(),
              ],
            ),
          ],

          'buttons' => [
            '#type' => 'container',
            'button1' => [
              '#type'         => 'button',
              '#button_type'  => 'button',
              '#value'        => $this->t('HTML content'),
              '#attributes' => [
                'data-tippy-interactive' => 'true',
                'data-tippy-htmlContentAttribute' => 'data-tooltip-html-content',
                'data-tooltip-html-content' => Html::escape(
                  (string) $htmlContent,
                ),
              ],
            ]
          ],

        ],
      ],
    ];

  }

}
