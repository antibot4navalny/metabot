# Extension ID values

## Chrome, extension IDs per Chrome Web Store:

### Stable channel
`cooadmmiojjmmfifkcainbnmhghfcbfi`

### Early Access channel
`hpenphinnajgmlhlofjgnlhhlibkheng`


## Chrome / Opera, self-hosted (.CRX)
Extension ID in `updates.xml` is currenly used only for stable, self-distributed binaries.


### Stable
`jmdlhgbmheopjecmdfanbhfbghmhgemc`


### Early-Access
`lafccnodoaiaieappkhanollndekfodd`


## Firefox, extension IDs per Mozilla Add-Ons store:

### Stable:
`d20acea6-2744-4763-bb1c-f62924e40073`

### Early Access (self-distributed):
`b4ab8398-6a60-41a2-91e2-09eb79a5d153`

(previously: `bots_commenting_navalny@protonmail.com`)


# ExtensionID assignment / persistence

## Chrome - self-distributed
For `update.xml`, [extension ID is generated based on a hash of the public key .PEM](https://developer.chrome.com/docs/apps/autoupdate/#:~:text=The%20extension%20or%20app%20ID%2C%20generated%20based%20on%20a%20hash%20of%20the%20public%20key).


`.PEM` is used to ensure updated `.CRX` is signed with the same key as earlier version of self-hosted extension.

From my experiments, the same ID is generated when:
- manually Packing Extension with Chrome
- packing with `CRX` command line utility


## Firefox
Generated and assigned:
- upon manual upload to AMO => will be embedded in the signed packaged extension 
- [signing with `web-ext`/API](https://addons-server.readthedocs.io/en/latest/topics/api/signing.html#uploading-without-an-id) with no UUID specified



Add-on ID is reserved forever and even if add-on is deleted, ID will forever be unusable for submission => assign wisely.



# Self-hosted viability / installation
## Chrome
MacOS: seems installed, but can not be enabled, with "This extension is not listed in the Chrome Web Store and may have been added without your knowledge" message. Support article [implies](https://support.google.com/chrome_webstore/answer/2811969#:~:text=if%20you%20already%20have%20it%20installed%2C%20to%20manually%20re%2Denable%20it%20from%20your%20list%20of%20extensions) that it can be enabled only if the extension in question is published at Chrome Web Store.

With Chrome 104.0.5112.101, tried `.crx` files created with:

- `crx` utility
- exactly that Chrome browser that I tried installing to

(to install, drag-n-dropped onto `chrome://extensions/` tab with pre-enabled `Developer mode`). 


Windows:
> Since M33, user can not install self-hosted extensions.

## Opera
Installs self-signed CRXs just fine, only need to confirm (as of Opera 90.0.4480.54).

## Firefox
[Menu > Add-ons and themes](about:addons) > ️⚙ > Debug Addons > Load Temporary Add-On >
  - either open `manifest.json` inside unpacked build
  - or open `.zip` with Firefox-specific build

# Browser-specific files / file sections

## `updates.xml` / `updates.json`


Makes only sense for public releases; doesn't make for restricted-access early-adopter versions (therefore exists only for stable channel).

Not part of extension package; should be hosted alongside self-distributed extension package.

Currenly published via GitHub commits only.

Updates to self-hosted extensions are provided via:

- `updates.xml` -- [Chrome/Opera only](https://developer.chrome.com/docs/apps/autoupdate/#update_manifest)

- `updates.json` -- [Firefox-only](https://extensionworkshop.com/documentation/manage/updating-your-extension/) (I'm not using it)


## `manifest.json`
### `update_url`
Chrome-only URL to web-hosted [`update.xml`]((https://developer.chrome.com/docs/apps/autoupdate/#update_manifest)
) for self-hosted distribution.

### `browser_specific_settings.gecko.update_url`
Firefox-only URL to web-hosted [`update.json`]((https://extensionworkshop.com/documentation/manage/updating-your-extension/)) for self-hosted distribution.


### `browser_specific_settings.id`

[Mandatory](https://extensionworkshop.com/documentation/develop/extensions-and-the-add-on-id/#when-do-you-need-an-add-on-id):
- for all Manifest V3 extensions when submitted to AMO
- [if the extension is unsigned](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/browser_specific_settings#firefox_gecko_properties) (and _not_ loaded via `about:debugging`)

Optional otherwise: the extension ID is derived from the extension's signature.


### `.web-extension-id`
[Saved by `web-ext`](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/#:~:text=Signing%20extensions%20without%20an%20explicit%20ID) the first time extension is signed without an explicit ID.

In `Metabot`, I'll aim to avoid its creation / saving / packaging; if it re-appears, I'd better auto-delete it--than ignore, exclude, be distracted with.
