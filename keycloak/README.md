# Business Console login theme

The `littlehorse` theme gives Keycloak's credential form the same layout as the
console's `/login` page. Keycloak still owns the form action, validation, password
visibility, SSO, and any additional authentication steps. The browser moves to
Keycloak during login; credentials are not collected by the console.

The theme extends Keycloak's built-in `keycloak` theme. Its `template.ftl` wraps
Keycloak 26.5.6's original layout with the console illustration and footer. It
inherits the credential and other authentication templates rather than copying
them. Compare the wrapper with upstream when upgrading Keycloak.

## Local setup

Docker Compose mounts `themes/littlehorse` into Keycloak. The existing Keycloak
configurer selects `littlehorse` through the Business Console client's
`login_theme` attribute, preserving other client attributes. It also applies this
to existing demo realms when the configurer is rerun. The standalone image copies
the same theme into its Keycloak installation.

For a separately managed Keycloak server, copy `themes/littlehorse` into its
`themes` directory and choose **littlehorse** in the Business Console client's
**Login theme** setting. Keep it scoped to that client; the realm's other clients
and admin console keep their themes. See the official
[Keycloak theme guide](https://www.keycloak.org/ui-customization/themes).

The CSS and story markup mirror `console/src/app/login`. The logo, Geist font,
and palette come from the existing console assets and UI library. Keep both
screens aligned when changing the design. The theme supports light and dark
appearance, keyboard controls, and reduced motion.
