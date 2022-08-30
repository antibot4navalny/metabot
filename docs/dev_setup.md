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
