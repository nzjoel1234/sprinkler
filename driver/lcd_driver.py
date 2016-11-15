#!/usr/bin/python
# Example using a character LCD plate.

import threading

import lcd_scroll as Scroll
from display_thread import DisplayThreadWrapper
from input_thread import InputThreadWrapper

#import Adafruit_CharLCD as LCD
import lcd_simulator as LCD

from zone_service import ZoneService
from sprinkler_service import SprinklerService
import view_model as VM

buttons = (LCD.SELECT, LCD.LEFT, LCD.UP, LCD.DOWN, LCD.RIGHT)

BASE_URL = 'http://localhost:4000'

lcd = LCD.Adafruit_CharLCDPlate()
scroller = Scroll.Scroller(width=16, height=2, space = " * * * ")

zoneService = ZoneService()
sprinklerService = SprinklerService(BASE_URL, zoneService)

displayThread = DisplayThreadWrapper(lcd, scroller)

def create_home_screen(set_view_model):
    return VM.HomeViewModel(displayThread, set_view_model, sprinklerService)

inputThread = InputThreadWrapper(lcd.is_pressed, buttons, create_home_screen)

sprinklerService.start()
displayThread.start()
inputThread.start()

zoneService.set_zone(None)

try:
    lcd.run()
except:
    print '!!exception!!'

print "stopping threads..."
sprinklerService.stop()
displayThread.stop()
inputThread.stop()

print "waiting for threads to stop..."
displayThread.join()
inputThread.join()

print "Done."