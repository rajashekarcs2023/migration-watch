# Cesium Assets Directory

This directory is used to store Cesium assets for the migration-watch application.

The `CESIUM_BASE_URL` environment variable should point to this directory to ensure proper loading of Cesium assets.

## Required Assets

The following assets should be placed in this directory:

- Cesium Workers
- Third-party libraries
- Terrain data
- Imagery data

## Setup Instructions

1. Copy the contents of the `Build/Cesium` directory from your Cesium distribution to this folder
2. Ensure your `next.config.mjs` file is configured to serve these static assets
3. Set the `CESIUM_BASE_URL` environment variable to point to this directory

## Usage

When initializing Cesium in your application, make sure to set the base URL:

```javascript
// In your Cesium initialization code
import { Ion } from '@cesium/engine';

// Set the base URL to the public path
window.CESIUM_BASE_URL = '/cesium';

// Initialize Cesium
// ...
```
