import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';
import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { GoveeApiClient } from './apiClient';
import { GoveeWaterDetectorAccessory } from './accessory';

export class GoveeWaterDetectorsPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];
  public readonly accesssoryInstances: GoveeWaterDetectorAccessory[] = [];

  private readonly apiClient: GoveeApiClient;

  /**
   * @param log
   * @param config
   * @param api
   */
  public constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.apiClient = new GoveeApiClient(this.log, this.config);

    if (!config.apiToken) {
      this.log.warn('*** Disabling plugin. ***');
      this.log.warn('*** Govee API token missing from configuration. ***');
      return;
    }

    this.api.on('didFinishLaunching', () => {
      this.discoverDetectors();
      setInterval(() => this.refreshAccessoryData(), GoveeWaterDetectorAccessory.REFRESH_RATE);
    });
  }

  /**
   * @param accessory
   */
  public configureAccessory(accessory: PlatformAccessory): void {
    this.accessories.push(accessory);
  }

  /**
   * Discover water detectors.
   */
  public async discoverDetectors() {
    const devices = await this.apiClient.getDeviceList();

    for (const device of devices) {
      const uuid = this.api.hap.uuid.generate(device.device);
      const existingAccessory = this.accessories.find((accessory) => accessory.UUID === uuid);

      if (existingAccessory) {
        this.accesssoryInstances.push(new GoveeWaterDetectorAccessory(this, existingAccessory, device));
        this.api.updatePlatformAccessories([existingAccessory]);
        continue;
      }

      const accessory = new this.api.platformAccessory(device.deviceName, uuid);
      this.accesssoryInstances.push(new GoveeWaterDetectorAccessory(this, accessory, device));
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);

      // TODO: Unregister detectors no longer in device list.
    }
  }

  /**
   * Refresh accessory data from API.
   */
  async refreshAccessoryData() {
    const devices = await this.apiClient.getDeviceList();

    devices.forEach((device) => {
      const accessory = this.accesssoryInstances.find((accessory) => {
        return accessory.device.device === device.device;
      });

      if (accessory) {
        accessory.updateDeviceData(device);
      }
    });
  }

}
