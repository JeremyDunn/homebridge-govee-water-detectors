import { Service, PlatformAccessory } from 'homebridge';

import { GoveeWaterDetectorsPlatform } from './platform';
import { Device } from './apiClient';

export class GoveeWaterDetectorAccessory {
  // This is the only SKU supported by this plugin.
  static readonly SKU = 'H5054';

  // How often to query the API to get updated device info.
  static readonly REFRESH_RATE = 60000;  // Every minute.

  private service: Service;

  /**
   * @param platform
   * @param accessory
   * @param device
   */
  constructor(
    private readonly platform: GoveeWaterDetectorsPlatform,
    private readonly accessory: PlatformAccessory,
    public device: Device,
  ) {
    this.service =
      this.accessory.getService(this.platform.Service.LeakSensor) ||
      this.accessory.addService(this.platform.Service.LeakSensor);

    this.setupAccessoryCharacteristics();
    this.setupServiceCharacteristics();
  }

  /**
   * Update device data.
   *
   * @param device
   */
  public updateDeviceData(device: Device) {
    this.device = device;

    this.setupAccessoryCharacteristics();
    this.setupServiceCharacteristics();
  }

  /**
   * Setup accessory characteristics.
   * @protected
   */
  protected setupAccessoryCharacteristics() {
    this.accessory.
      getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(
        this.platform.Characteristic.Manufacturer,
        'Govee',
      )
      .setCharacteristic(
        this.platform.Characteristic.Model,
        this.device.sku,
      )
      .setCharacteristic(
        this.platform.Characteristic.SerialNumber,
        this.device.device,
      )
      .setCharacteristic(
        this.platform.Characteristic.HardwareRevision,
        this.device.versionHard,
      );
  }

  /**
   * Setup accessory service characteristics.
   *
   * @protected
   */
  protected setupServiceCharacteristics() {
    this.service
      .setCharacteristic(
        this.platform.Characteristic.Name,
        this.device.deviceName,
      )
      .setCharacteristic(
        this.platform.Characteristic.LeakDetected,
        this.hasUnreadLeakWarnMessage() ?
          this.platform.Characteristic.LeakDetected.LEAK_DETECTED :
          this.platform.Characteristic.LeakDetected.LEAK_NOT_DETECTED,
      )
      .setCharacteristic(
        this.platform.Characteristic.StatusLowBattery,
        this.device.deviceExt.deviceSettings.battery < 50 ? //TODO: What battery level is considered "low"?
          this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW :
          this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL,
      )
      .setCharacteristic(
        this.platform.Characteristic.StatusFault,
        (!this.device.deviceExt.lastDeviceData.online || !this.device.deviceExt.lastDeviceData.gwonline) ?
          this.platform.Characteristic.StatusFault.GENERAL_FAULT :
          this.platform.Characteristic.StatusFault.NO_FAULT,
      )
      .setCharacteristic(
        this.platform.Characteristic.BatteryLevel,
        this.device.deviceExt.deviceSettings.battery,
      );
  }

  hasUnreadLeakWarnMessage(): boolean {
    const unreadLeakWarnings = this.device.warnMessages.filter((warnMessage) => {
      return !warnMessage.read && warnMessage.message.toLowerCase().indexOf('leakage alert') > -1;
    });

    return unreadLeakWarnings.length > 0;
  }
}
