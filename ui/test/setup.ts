// https://github.com/uuidjs/uuid#getrandomvalues-not-supported
global.crypto = { getRandomValues: require('polyfill-crypto.getrandomvalues') }