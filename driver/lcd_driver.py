from lcd_scroll import Scroller
from display_thread import DisplayThreadWrapper
from input_thread import InputThreadWrapper

#import Adafruit_CharLCD as Lcd
import lcd_simulator as Lcd

from zone_service import ZoneService
from sprinkler_service import SprinklerService
import view_model as VM

BUTTONS = (Lcd.SELECT, Lcd.LEFT, Lcd.UP, Lcd.DOWN, Lcd.RIGHT)

BASE_URL = 'http://localhost:4000'

LCD = Lcd.Adafruit_CharLCDPlate()
SCROLLER = Scroller(width=16, height=2, space=" * * * ")

ZONE_SERVICE = ZoneService()
SPRINKLER_SERVICE = SprinklerService(BASE_URL, ZONE_SERVICE)

DISPLAY_THREAD = DisplayThreadWrapper(LCD, SCROLLER)

def create_home_screen(set_view_model):
    return VM.HomeViewModel(DISPLAY_THREAD, set_view_model, SPRINKLER_SERVICE)

INPUT_THREAD = InputThreadWrapper(LCD.is_pressed, BUTTONS, create_home_screen)

SPRINKLER_SERVICE.start()
DISPLAY_THREAD.start()
INPUT_THREAD.start()

ZONE_SERVICE.set_zone(None)

try:
    LCD.run()
except:
    print '!!exception!!'

print "stopping threads..."
SPRINKLER_SERVICE.stop()
DISPLAY_THREAD.stop()
INPUT_THREAD.stop()

print "waiting for threads to stop..."
DISPLAY_THREAD.join()
INPUT_THREAD.join()

print "Done."
