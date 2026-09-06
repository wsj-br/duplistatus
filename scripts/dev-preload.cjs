'use strict';

// Combined preload for `pnpm dev`. NODE_OPTIONS --require accepts a single
// module path, so peer-ip and request-log timestamps load from here.
require('./peer-ip.cjs');
require('./dev-log-timestamps.cjs');
