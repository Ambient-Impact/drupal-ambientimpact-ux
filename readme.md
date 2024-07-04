This Drupal module contains many UX components and enhancements, and their
supporting code.

**Warning**: while this is generally production-ready, it's not guaranteed to
maintain a stable API and may occasionally contain bugs, being a
work-in-progress. Stable releases may be provided at a later date.

----

# Requirements

* [Drupal 10](https://www.drupal.org/download)

* PHP 8.1

* [Composer](https://getcomposer.org/)

## Drupal dependencies

Before attempting to install this, you must add the Composer repositories as
described in the installation instructions for these dependencies:

* The [`ambientimpact_core`](https://github.com/Ambient-Impact/drupal-ambientimpact-core) and [`ambientimpact_icon`](https://github.com/Ambient-Impact/drupal-ambientimpact-icon) modules.

## Front-end dependencies

To build front-end assets for this project, [Node.js](https://nodejs.org/) and
[Yarn](https://yarnpkg.com/) are required.

----

# Installation

## Composer

### Set up

Ensure that you have your Drupal installation set up with the correct Composer
installer types such as those provided by [the `drupal/recommended-project`
template](https://www.drupal.org/docs/develop/using-composer/starting-a-site-using-drupal-composer-project-templates#s-drupalrecommended-project).
If you're starting from scratch, simply requiring that template and following
[the Drupal.org Composer
documentation](https://www.drupal.org/docs/develop/using-composer/starting-a-site-using-drupal-composer-project-templates)
should get you up and running.

### Repository

In your root `composer.json`, add the following to the `"repositories"` section:

```json
"drupal/ambientimpact_ux": {
  "type": "vcs",
  "url": "https://github.com/Ambient-Impact/drupal-ambientimpact-ux.git"
}
```

### Installing

Once you've completed all of the above, run `composer require
"drupal/ambientimpact_ux:^2.0@dev"` in the root of your project to have
Composer install this and its required dependencies for you.

## Front-end assets

To build front-end assets for this project, you'll need to install
[Node.js](https://nodejs.org/) and [Yarn](https://yarnpkg.com/).

This package makes use of [Yarn
Workspaces](https://yarnpkg.com/features/workspaces) and references other local
workspace dependencies. In the `package.json` in the root of your Drupal
project, you'll need to add the following:

```json
"workspaces": [
  "<web directory>/modules/custom/*"
],
```

where `<web directory>` is your public Drupal directory name, `web` by default.
Once those are defined, add the following to the `"dependencies"` section of
your top-level `package.json`:

```json
"drupal-ambientimpact-ux": "workspace:^2"
```

Then run `yarn install` and let Yarn do the rest.

### Optional: install yarn.BUILD

While not required, [yarn.BUILD](https://yarn.build/) is recommended to make
building all of the front-end assets even easier.

----

# Building front-end assets

This uses [Webpack](https://webpack.js.org/) and [Symfony Webpack
Encore](https://symfony.com/doc/current/frontend.html) to automate most of the
build process. These will have been installed for you if you followed the Yarn
installation instructions above.

If you have [yarn.BUILD](https://yarn.build/) installed, you can run:

```
yarn build
```

from the root of your Drupal site. If you want to build just this package, run:

```
yarn workspace drupal-ambientimpact-ux run build
```

----

# Major breaking changes

The following major version bumps indicate breaking changes:

* 1.x:

  * Has been [`git subtree split`](https://shantanoo-desai.github.io/posts/technology/git_subtree/) from [`Ambient-Impact/drupal-modules`](https://github.com/Ambient-Impact/drupal-modules/tree/8.x) into a standalone package; version has been reset to 1.x.

  * Requires Drupal 9.5 or [Drupal 10](https://www.drupal.org/project/drupal/releases/10.0.0).

  * Increases minimum version of [Hook Event Dispatcher](https://www.drupal.org/project/hook_event_dispatcher) to 3.1, removes deprecated code, and adds support for 4.0 which supports Drupal 10.

* 2.x:

  * Requires Drupal 10.

  * Removed `.nvmrc` file as Node.js is stable enough nowadays to no longer warrant this.

  * Increases minimum version of [Hook Event Dispatcher](https://www.drupal.org/project/hook_event_dispatcher) to 4.0.

  * [Multiple components have been removed that are no longer needed and/or better alternatives exist](https://github.com/Ambient-Impact/drupal-ambientimpact-ux/issues/5):

    * `abbr`: Removed as part of the `tooltip` component rewrite farther down; this is now expected to be handled by the theme.

    * `gin`: This only existed to auto toggle between light and dark modes, and this functionality is now in [the Gin theme](https://www.drupal.org/project/gin) itself.

    * `seven`: [The Seven theme](https://www.drupal.org/project/seven) was removed from Drupal core 10.0 in favour of Claro.

  * [Complete rewrite of `tooltip` component for Tippy.js 6.x](https://github.com/Ambient-Impact/drupal-ambientimpact-ux/issues/1):

    * Previous spaghetti code has been re-implemented as various [Tippy.js plug-ins](https://atomiks.github.io/tippyjs/v6/plugins/), which means they're now configured using Tippy.js constructor (or global default) properties.

    * The old nested config has been removed as part of the above, with all configuration being sent to Tippy.js, simplifying the way tooltips are constructed.

    * Removed all tooltip stylesheets as these are now the responsibility of the theme. If the theme doesn't provide any styles, the default Tippy.js tooltip theme is used.
