#!/usr/bin/python
# Example using a character LCD plate.

import threading

import lcdScroll as Scroll
import displayThread
import inputThread

#import Adafruit_CharLCD as LCD
import lcdSimulator as LCD

import zoneService
import sprinklerService
import viewModel as VM

buttons = (LCD.SELECT, LCD.LEFT, LCD.UP, LCD.DOWN, LCD.RIGHT)

BASE_URL = 'http://localhost:4000'

lcd = LCD.Adafruit_CharLCDPlate()
scroller = Scroll.Scroller(width=16, height=2, space = " * * * ")

zoneService = zoneService.ZoneService()
sprinklerService = sprinklerService.SprinklerService(BASE_URL, zoneService)

displayThread = displayThread.DisplayThreadWrapper(lcd, scroller)

def create_home_screen(set_view_model):
    return VM.HomeViewModel(displayThread, set_view_model, sprinklerService)

inputThread = inputThread.InputThreadWrapper(lcd.is_pressed, buttons, create_home_screen)

sprinklerService.start()
displayThread.start()
inputThread.start()

lcd.run()

zoneService.set_zone(None)

print "stopping threads..."
sprinklerService.stop()
displayThread.stop()
inputThread.stop()

print "waiting for threads to stop..."
displayThread.join()
inputThread.join()

print "Done."