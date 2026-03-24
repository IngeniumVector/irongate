# Logo Files Directory

Drop client/partner logo files here. Required format: .webp preferred, .png accepted.

## Expected Files

| Filename | Client | Status |
|----------|--------|--------|
| ashley-condominiums-logo.webp | Ashley Condominiums | PLACEHOLDER - awaiting file |
| f3-marinas-logo.webp | f3 Marinas | PLACEHOLDER - awaiting file |

## Specs

- Max width: 120px display, provide at 240px for retina
- Max height: 48px display, provide at 96px for retina
- Transparent background preferred
- White or light-colored logos work best on dark background

## To activate a logo

1. Drop the image file in this directory
2. In src/components/LogoGrid.astro: replace the placeholder `<span>` with the `<img>` tag (see comment in component)
3. In index.html: replace the matching placeholder `<span>` with the corresponding `<img>` tag
