
VCC = 19

PIN_BY_ZONE = {}
PIN_BY_ZONE[1] = 6
PIN_BY_ZONE[2] = 13
PIN_BY_ZONE[3] = 12
PIN_BY_ZONE[4] = 16

ALL_PINS = [VCC] + PIN_BY_ZONE.values()

class ZoneService(object):

    def __init__(self, gpio):
        self._gpio = gpio
        self._gpio.setmode(gpio.BCM)
        self._gpio.setup(ALL_PINS, self._gpio.OUT)
        self._gpio.output(VCC, self._gpio.HIGH)

    def set_zone(self, zone_id):
        off_pins = [value for key, value in PIN_BY_ZONE.items() if key != zone_id]
        self._gpio.output(off_pins, self._gpio.LOW)
        if zone_id in PIN_BY_ZONE:
            self._gpio.output(PIN_BY_ZONE[zone_id], self._gpio.HIGH)

    def stop(self):
        self._gpio.output(ALL_PINS, self._gpio.LOW)
