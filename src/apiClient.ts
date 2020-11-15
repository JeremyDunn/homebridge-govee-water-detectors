import axios from 'axios';
import { Logger, PlatformConfig } from 'homebridge';
import { GoveeWaterDetectorAccessory } from './accessory';

export interface Device {
  device: string;
  deviceName: string;
  sku: string;
  spec: string;
  versionHard: string;
  versionSoft: string;
  deviceExt: {
    deviceSettings: {
      battery: number;
      optionPush: boolean;
      header: string;
      gatewayVersionHard: string;
      gatewayVersionSoft: string;
      sku: string;
      deviceName: string;
      versionHard: string;
      versionSoft: string;
    };
    lastDeviceData: {
      online: boolean;
      gwonline: boolean;
      lastTime: number;
      read: boolean;
    };
    extResources: {
      skuUrl: string;
      headOnImg: string;
      headOffImg: string;
    };
  };
  goodsType: number;
  warnMessages: WarnMessage[];
}

export interface WarnMessage {
  message: string;
  time: number;
  read: boolean;
}

export class GoveeApiClient {

  private axios;

  /**
   * @param log
   * @param config
   */
  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
  ) {

    this.axios = axios.create({
      baseURL: 'https://app2.govee.com/',
      headers: {
        'Authorization': `Bearer ${config.apiToken}`,
        'Appversion': '3.7.0',
      },
    });
  }

  /**
   * Get list of water detector devices.
   */
  async getDeviceList(): Promise<Device[]> {
    const { data } = await this.axios.post('device/rest/devices/v1/list');
    if (!data.devices) {
      throw new Error('Could not retrieve device list.');
    }

    // Filter out any unknown SKUs.
    const devices = data.devices.filter((device: Device) => {
      return device.sku === GoveeWaterDetectorAccessory.SKU;
    }) as Device[];

    // Parse device list.
    devices.map((device) => {
      if (device.deviceExt.deviceSettings) {
        // @ts-ignore
        device.deviceExt.deviceSettings = JSON.parse(device.deviceExt.deviceSettings);
      }
      if (device.deviceExt.lastDeviceData) {
        // @ts-ignore
        device.deviceExt.lastDeviceData = JSON.parse(device.deviceExt.lastDeviceData);
      }
      if (device.deviceExt.extResources) {
        // @ts-ignore
        device.deviceExt.extResources = JSON.parse(device.deviceExt.extResources);
      }

      device.warnMessages = [];
    });

    for (const device of devices) {
      if (device.deviceExt.lastDeviceData.lastTime > 0) {
        device.warnMessages = await this.getDeviceWarnings(device.device);
      }
    }

    return devices;
  }

  /**
   * Get warn messages for device.
   *
   * @param deviceId
   * @param limit
   * @param sku
   */
  async getDeviceWarnings(deviceId: string, limit = 5, sku = GoveeWaterDetectorAccessory.SKU): Promise<WarnMessage[]> {
    const { data } = await this.axios.post('leak/rest/device/v1/warnMessage', {
      device: deviceId,
      limit: limit,
      sku: sku,
    });

    return data.data;
  }
}
