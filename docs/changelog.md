# Changelog
#### v5.1.2 <small>(07/19/2026)</small>
- Fix grid loading for empty grid cells
- Close random scene dialog
- Add parent directory if directory of sources enabled but doesn't have child directories
- Fix 'Start Now' for grids
- Improve scene switching
- Upgrade Electron to 42.7.0
- Upgrade 3rd party libraries

#### v5.1.1 <small>(06/20/2026)</small>
- Improve large sources loading time
- Fix playlist file playback
- Fix filename display
- Fix caption scriptor text loading
- Fix caption scriptor layout issues
- Remove grid width and height cap
- Fix grid loading for grid with copied cells
- Upgrade Electron to 42.4.1
- Upgrade 3rd party libraries

#### v5.1.0 <small>(05/24/2026)</small>
- Add Hydrus source dialog
- Upgrade Electron to 42.2.0
- Upgrade 3rd party libraries
- Fix e-hentai
- Remove Reddit

#### v5.0.0 <small>(04/23/2026)</small>
- Fix grid mirror
- Fix ImageFap
- Upgrade 3rd party libraries
- Fix bug when save dialog uses default path that doesn't exist
- Fix bug when saving caption script by binding null
- Fix grid mirror functionality
- Fix SourceScraper by unsubscribing listeners on unmount

#### v5.0.0-beta2 <small>(04/18/2026)</small>
- SourceScraper only stop listening once response received
- Move web requests to main process
- Proxy content URLs

#### v5.0.0-beta1 <small>(04/15/2026)</small>
- Based on 3.2.3
- Upgrade Electron to 41.2.0
- Move Node.js and Electron code to main process
- Remove Twitter
- Remove Instagram
- Upgrade xmldom to 0.9.9
- Upgrade tumblr.js to 5.0.1
- Escape '.' in hostname regexes