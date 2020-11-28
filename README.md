
<p align="center">

<img src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150">

</p>


# Homebridge Govee Water Detectors

Unofficial Homebridge plugin for Govee water leak detectors.
   
 [![npm](https://img.shields.io/npm/v/homebridge-govee-water-detectors/latest?label=latest)](https://www.npmjs.com/package/homebridge-govee-water-detectors) [![npm](https://img.shields.io/npm/dt/homebridge-govee-water-detectors)](https://www.npmjs.com/package/homebridge-govee-water-detectors) 

## Supported Devices

- Govee H5054 Water Leak Detector

## :warning:

At this time Govee water leak detectors are not supported through the official public REST API.
This plugin uses the API consumed by Govee's iPhone app. 

_The device list is filtered by SKU to only display water detectors._

## Installation
1. Install Homebridge by following
   [the instructions](https://github.com/homebridge/homebridge/wiki).
2. Install this plugin using [Homebridge Config UI X](https://github.com/oznu/homebridge-config-ui-x), or by running `npm install -g homebridge-govee-water-detectors`.

## Configuration

To use this plugin, you need to obtain an API key. Since this is unofficial, you'll need to use your brower's developer tools to grab the API token after logging into [https://www.govee.com/login](https://www.govee.com/login).
1. Open your browsers' developer tools and go to the Network tab.
2. Enter your login credentials, sign in, and look for a POST request to `https://community-api.govee.com/os/v1/login`.
3. Click on the request and view the response. Copy the "token" value from the response JSON and paste this into the plugin configuration.
4. Restart Homebridge.


