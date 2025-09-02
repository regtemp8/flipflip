#/bin/bash
set -e
set -x

yarn playwright test --headed --workers=1 --reporter=line --project=app-chromium tests/app/audio-library/audio-edit.spec.ts
yarn playwright test --headed --workers=1 --reporter=line --project=app-chromium tests/app/audio-library/audio-library.spec.ts
yarn playwright test --headed --workers=1 --reporter=line --project=app-chromium tests/app/audio-library/audio-options.spec.ts

# no tests
# yarn playwright test --headed --workers=1 --reporter=line --project=app-chromium tests/app/content-library/content-library.spec.ts

yarn playwright test --headed --workers=1 --reporter=line --project=app-chromium tests/app/script-library/script-library.spec.ts
yarn playwright test --headed --workers=1 --reporter=line --project=app-chromium tests/app/script-library/script-options.spec.ts

yarn playwright test --headed --workers=1 --reporter=line --project=app-chromium tests/app/settings/general/backup.spec.ts
yarn playwright test --headed --workers=1 --reporter=line --project=app-chromium tests/app/settings/general/caching.spec.ts
yarn playwright test --headed --workers=1 --reporter=line --project=app-chromium tests/app/settings/general/settings.spec.ts
yarn playwright test --headed --workers=1 --reporter=line --project=app-chromium tests/app/settings/general/theme.spec.ts
yarn playwright test --headed --workers=1 --reporter=line --project=app-chromium tests/app/settings/general/watermark.spec.ts

yarn playwright test --headed --workers=1 --reporter=line --project=app-chromium tests/app/settings/scene-effects/cross-fade.spec.ts
yarn playwright test --headed --workers=1 --reporter=line --project=app-chromium tests/app/settings/scene-effects/fade.spec.ts
yarn playwright test --headed --workers=1 --reporter=line --project=app-chromium tests/app/settings/scene-effects/move-horizontal.spec.ts
yarn playwright test --headed --workers=1 --reporter=line --project=app-chromium tests/app/settings/scene-effects/move-vertical.spec.ts
yarn playwright test --headed --workers=1 --reporter=line --project=app-chromium tests/app/settings/scene-effects/panning.spec.ts
yarn playwright test --headed --workers=1 --reporter=line --project=app-chromium tests/app/settings/scene-effects/slide.spec.ts
yarn playwright test --headed --workers=1 --reporter=line --project=app-chromium tests/app/settings/scene-effects/strobe.spec.ts
yarn playwright test --headed --workers=1 --reporter=line --project=app-chromium tests/app/settings/scene-effects/zoom-move-timing.spec.ts
yarn playwright test --headed --workers=1 --reporter=line --project=app-chromium tests/app/settings/scene-effects/zoom.spec.ts

yarn playwright test --headed --workers=1 --reporter=line --project=app-chromium tests/app/settings/scene-options/back-forth.spec.ts
yarn playwright test --headed --workers=1 --reporter=line --project=app-chromium tests/app/settings/scene-options/background.spec.ts
yarn playwright test --headed --workers=1 --reporter=line --project=app-chromium tests/app/settings/scene-options/image-sizing.spec.ts
yarn playwright test --headed --workers=1 --reporter=line --project=app-chromium tests/app/settings/scene-options/settings.spec.ts
yarn playwright test --headed --workers=1 --reporter=line --project=app-chromium tests/app/settings/scene-options/timing.spec.ts

yarn playwright test --headed --workers=1 --reporter=line --project=app-chromium tests/app/tags/tag-manager.spec.ts

yarn playwright test --headed --workers=1 --reporter=line --project=app-chromium tests/app/scenes/scene-detail.spec.ts
yarn playwright test --headed --workers=1 --reporter=line --project=app-chromium tests/app/displays/display-setup.spec.ts
yarn playwright test --headed --workers=1 --reporter=line --project=app-chromium tests/app/playlists/playlist-setup.spec.ts

yarn playwright test --headed --workers=1 --reporter=line --project=app-chromium tests/app/scene-picker.spec.ts