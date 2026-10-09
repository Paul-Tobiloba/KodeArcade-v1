# Dash pencil sprite provenance

Asset: `public/images/dash-pencil.png`. Generated using the built-in `imagegen` tool with transparent background and genuine alpha. Reference: `public/images/topic-cast.png`, using the existing character sheet's top-left Dash, the cream rabbit, preserving the established character identity. The raster is used by `src/DrawingLab.tsx` above the smooth white drawing stage; its pencil tip follows the drawing position as ink is revealed. Vector ink, dotted guide and direction pointer are task diagrams, not substitutes for the character artwork.

Exact generation prompt (also embedded in the asset):

> Use case: identity-preserve. Asset type: transparent game sprite for KodeArcade. Reference image: existing character sheet, use ONLY Dash the cream rabbit in top-left. Keep his cream fur, big brown eyes, pink ears, teal neck scarf and friendly 3D cartoon identity. Single full-body rabbit facing slightly right, holding one large yellow drawing pencil in his raised right-side paw; pencil slopes down to the lower-right with graphite tip precisely at bottom-right of his silhouette. Friendly focused drawing pose. Transparent background with genuine alpha, no backdrop, floor, cast shadow, lettering, extra characters or objects. Rabbit and pencil fill canvas with small even transparent margin, crisp silhouette readable at 64 pixels.

The supplied implementation provenance scan covers thirteen rasters with zero missing prompts. This documentation pass inspected the asset reference and source use; it did not independently regenerate the image or rerun the scan. Sequence lesson video provenance is recorded separately in SEQUENCE_LESSON.md.
