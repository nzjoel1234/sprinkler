#!/usr/bin/python
# Example using a character LCD plate.
import time
import threading

import lcdScroll as Scroll

#import Adafruit_CharLCD as LCD
import lcdSimulator as LCD

import viewModel as VM

# Make list of button value, text, and backlight color.
buttons = ( (LCD.SELECT, 'You pressed select...', (1,1,1)),
            (LCD.LEFT,   'Left'  , (1,0,0)),
            (LCD.UP,     'Up'    , (0,0,1)),
            (LCD.DOWN,   'Down'  , (0,1,0)),
            (LCD.RIGHT,  'Right' , (1,0,1)) )

class displayThreadWrapper (threading.Thread):
    def __init__(self, lcd, viewModel):
        threading.Thread.__init__(self)
        self._lcd = lcd
        self._scroller = Scroll.Scroller(width=16, height=2, space = " * * * ")
        self._stop = threading.Event()
        self._viewModel = viewModel
        self._lines = []

    def run(self):
        while not self._stop.isSet():
            if self._lines == self._viewModel.get_display_lines():
                self._scroller.scroll()
            else:
                self._lines = self._viewModel.get_display_lines()
                self._scroller.setLines(self._lines)

            self._lcd.clear()
            self._lcd.message(self._scroller.getLines())
            time.sleep(0.15)

    def stop(self):
        self._stop.set()

class inputThreadWrapper (threading.Thread):
    def __init__(self, lcd, viewModel):
        threading.Thread.__init__(self)
        self._lcd = lcd
        self._displayThread = displayThread
        self._stop = threading.Event()
        self._viewModel = viewModel

    def run(self):
        while not self._stop.isSet():
            if (self._lcd.is_pressed(LCD.SELECT)):
                self._viewModel.on_select_pressed()
            if (self._lcd.is_pressed(LCD.LEFT)):
                self._viewModel.on_left_pressed()
            if (self._lcd.is_pressed(LCD.RIGHT)):
                self._viewModel.on_right_pressed()
            if (self._lcd.is_pressed(LCD.UP)):
                self._viewModel.on_up_pressed()
            if (self._lcd.is_pressed(LCD.DOWN)):
                self._viewModel.on_down_pressed()

    def stop(self):
        self._stop.set()

viewModel = VM.ViewModel()

lcd = LCD.Adafruit_CharLCDPlate()

displayThread = displayThreadWrapper(lcd, viewModel)
inputThread = inputThreadWrapper(lcd, viewModel)

displayThread.start()
inputThread.start()

lcd.run()

print "stopping threads..."
displayThread.stop()
inputThread.stop()

print "waiting for threads to stop..."
displayThread.join()
inputThread.join()

print "Done."