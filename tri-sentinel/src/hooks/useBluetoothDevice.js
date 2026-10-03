import { useEffect, useState } from "react";

const DEVICE_INFORMATION_SERVICE = "device_information";
const FIRMWARE_REVISION_CHARACTERISTIC = "firmware_revision_string";

const disconnectedState = {
  device: null,
  firmware: null,
  isConnected: false,
  error: "",
};

function decodeCharacteristicValue(value) {
  return new TextDecoder().decode(value).replace(/\0/g, "").trim();
}

export default function useBluetoothDevice() {
  const [connection, setConnection] = useState(disconnectedState);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const device = connection.device;
    if (!device) return undefined;

    const handleDisconnected = () => {
      setConnection({ ...disconnectedState });
    };

    device.addEventListener("gattserverdisconnected", handleDisconnected);
    return () => device.removeEventListener("gattserverdisconnected", handleDisconnected);
  }, [connection.device]);

  const connectDevice = async () => {
    if (!navigator.bluetooth) {
      setConnection({ ...disconnectedState, error: "Bluetooth is not supported in this browser." });
      return;
    }

    setIsConnecting(true);
    setConnection({ ...disconnectedState });

    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [DEVICE_INFORMATION_SERVICE],
      });
      const server = await device.gatt.connect();
      let firmware = null;
      let error = "";

      try {
        const service = await server.getPrimaryService(DEVICE_INFORMATION_SERVICE);
        const characteristic = await service.getCharacteristic(FIRMWARE_REVISION_CHARACTERISTIC);
        firmware = decodeCharacteristicValue(await characteristic.readValue());
      } catch {
        error = "Connected, but firmware information is not available from this device.";
      }

      setConnection({ device, firmware, isConnected: Boolean(server.connected), error });
    } catch (error) {
      if (error.name !== "NotFoundError") {
        setConnection({
          ...disconnectedState,
          error: error.message || "Could not connect to the Bluetooth device.",
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectDevice = () => {
    if (connection.device?.gatt?.connected) {
      connection.device.gatt.disconnect();
    }
    setConnection({ ...disconnectedState });
  };

  return {
    ...connection,
    isConnecting,
    connectDevice,
    disconnectDevice,
  };
}
