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
        'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/abbr',
      ),
    );

    /** @var \Drupal\Core\Link */
    $titleAttrMdnLink = new Link(
      $this->t('<code>title</code> attribute'), Url::fromUri(
        'https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/title',
      ),
    );

    /** @var \Drupal\Core\Link */
    $mdnLink = new Link(
      $this->t('MDN Web Docs'), Url::fromUri(
        'https://developer.mozilla.org', [
          'attributes' => [
            'target'  => '_blank',
            'title'   => $this->t('You won\'t see this on mobile until you return to this page.'),
          ]
        ],
      ),
    );

    return [
      '#intro' => [
        '#type'       => 'html_tag',
        '#tag'        => 'p',
        '#value'      => $this->t(
          'This provides a wrapper component around @tippyLink which builds on the library\'s API, sets various default values, and customizes the theming of the tooltips.',
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
        'abbr_description' => [
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
        'abbr_demo' => [
          '#type'     => 'html_tag',
          '#tag'      => 'blockquote',
          '#value'    => $this->t('The fundamental languages of the web are <abbr title="HyperText Markup Language">HTML</abbr>, <abbr title="Cascading Style Sheets">CSS</abbr>, and JavaScript. These are delivered to browsers using <abbr title="HyperText Transfer Protocol">HTTP</abbr> or <abbr title="HyperText Transfer Protocol Secure">HTTPS</abbr>, the latter of which is preferable because it encrypts data via <abbr title="Transport Layer Security">TLS</abbr> or previously the deprecated <abbr title="Secure Sockets Layer">SSL</abbr>.'),
        ],
        'button_link_description' => [
          '#type'     => 'html_tag',
          '#tag'      => 'p',
          '#value'    => $this->t(
            'Buttons and links are another common use for tooltips, but beware that this is not recommended unless special care is taken since touch screens don\'t usually provide a way for a user to hover over an element before activating it, and so would result in bad <abbr title="user experience">UX</abbr>. For an example, tap the following link on a mobile device (it opens in a new tab) and then hit your back button to return to this page: @mdnLink',
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
    ];

  }

}
