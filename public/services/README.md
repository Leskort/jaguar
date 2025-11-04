# Service Images

Place service card images in categorized folders: `public/services/`

## Folder Structure:

```
public/services/
  ├── retrofits/              ← Images for Retrofits services
  ├── features-activation/   ← Images for Features Activation services
  ├── power-upgrade/          ← Images for Power Upgrade services
  └── accessories/           ← Images for Accessories services
```

## How to use:

1. **Upload your images** to the appropriate folder:
   - Retrofits → `public/services/retrofits/your-image.jpg`
   - Features Activation → `public/services/features-activation/your-image.jpg`
   - Power Upgrade → `public/services/power-upgrade/your-image.jpg`
   - Accessories → `public/services/accessories/your-image.jpg`

2. **In Admin Panel** (Manage Services):
   - When adding a service card, in the "Image URL" field, enter the path:
   - For Retrofits: `/services/retrofits/your-image.jpg`
   - For Features Activation: `/services/features-activation/your-image.jpg`
   - For Power Upgrade: `/services/power-upgrade/your-image.jpg`
   - For Accessories: `/services/accessories/your-image.jpg`

## Image Requirements:
- Format: JPG, PNG, or WebP
- Recommended size: 800x600px or larger
- Aspect ratio: 16:9 or 4:3 works best
- File names: Use lowercase with hyphens (e.g., `adaptive-cruise-control.jpg`)

## Examples:

### Retrofits:
- `/services/retrofits/adaptive-cruise-control.jpg`
- `/services/retrofits/blind-spot-system.jpg`
- `/services/retrofits/tft-cluster.jpg`

### Features Activation:
- `/services/features-activation/dynamic-mode.jpg`
- `/services/features-activation/video-in-motion.jpg`
- `/services/features-activation/navigation-update.jpg`

### Power Upgrade:
- `/services/power-upgrade/chip-tuning-stage1.jpg`
- `/services/power-upgrade/chip-tuning-stage2.jpg`

### Accessories:
- `/services/accessories/side-steps.jpg`
- `/services/accessories/tow-bar.jpg`
- `/services/accessories/mud-flaps.jpg`

## Note:
Images placed in `public/` folder are automatically accessible via URL starting with `/`
So `public/services/retrofits/image.jpg` is accessible as `/services/retrofits/image.jpg`
