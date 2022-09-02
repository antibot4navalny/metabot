# Installing tools

## Node.js

`npm install --global <tool>`

-- allows to run `tool` from any location without specifying path to it; after installing in terminal, open a new tab to start using the `tool` without specifying path to it.

Applies at least to:
- [`web-ext`](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/#installation-section)
- [`json5`](https://json5.org/)
- [`chrome-webstore-upload`](https://github.com/fregante/chrome-webstore-upload-cli)


# Files hierarchy
- `package.json`: list of `node.js` tools used, along with version numbers expected
- `releases/`: ready-to-use binaries and pre-packaged browser-specific source file-sets; only files generated from sources belong here


# Configuring browsers for development environment

## Firefox - Manifest V3

1. For installing unsigned extensions, use only `Developer Edition`

2. Ensure `about:flags`:
  - `extensions.manifestV3.enabled` --> `true` (default: `false`)
  - `extensions.eventPages.enabled` --> `true` (default: `false`)
  - `xpinstall.signatures.required` --> `false` (default: `true`)
  
Not necessary to enable:
  
  - `extensions.backgroundServiceWorker.enabled` (default: `false`)


3. To properly install MV3 extension, manually grant permissions to access data on sites. If not, `Debug` > `Sources` won't display content scripts code:
  - `about:addons`
  - "Metabot" > [...] on right side in the list
  - `Manage` > `Permissions` > enable all switches:
    - `Access your data for (URL / mask)`
