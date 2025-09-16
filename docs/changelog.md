# Changelog
#### v4.0.0-beta8 <small>(09/16/2025)</small>
- Add default duration to scene playlist item
- Fix library source migration

#### v4.0.0-beta7 <small>(09/15/2025)</small>
- Finish logging before shutdown
- Add more checks to data.json migration

#### v4.0.0-beta6 <small>(09/11/2025)</small>
- Add watermark
- Fix urls for 0.0.0.0 host
- Use same logic for choose and canChoose in FilePicker

#### v4.0.0-beta5 <small>(09/02/2025)</small>
- Transform FlipFlip into a web application
- Use SQLite to store data
- Import FlipFlip v3 data.json file into database
- Add Dockerfile for easy deployment
- Add docker-compose.yml to run FlipFlip together with Piwigo or Hydrus
- Move player data loading to server
- Add playwright tests for settings, tag manager, audio library, script library
- Remove display playlist
- Remove authentication
- Remove SSL
- Remove default Tumblr API keys

#### v4.0.0-beta4 <small>(09/24/2024)</small>
- Display playback
- Playlist playback. This is still a work in progress
- Replace `react-select` with MUI `AutoComplete` component
- Check that `route` isn't pointing to data that hasn't been stored (e.g. a temporary scene or display)

#### v4.0.0-beta3 <small>(05/23/2024)</small>
- Display editor as replacement for grids
- Scene and Display playlists
- Fix Hydrus, ImageFap, DeviantArt, Luscious and BDSMlr scrapers
- Fix timing input in scene settings

#### v4.0.0-beta2 <small>(04/13/2024)</small>
- Move server settings from `config/default.yml` file to settings menu in FlipFlip app.

#### v4.0.0-beta1 <small>(04/08/2024)</small>
- Full Player rewrite, including effects
- Add ability to use FlipFlip on any device that has a web browser
- Use self-signed SSL certificates for https
- Add authentication: magic link, QR code or login code
- Add ability to pause effects and videos