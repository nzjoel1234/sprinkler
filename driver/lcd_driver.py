#!/usr/bin/python
# Example using a character LCD plate.
import time
import threading

import Adafruit_CharLCD as LCD

lcd = LCD.Adafruit_CharLCDPlate()

# Make list of button value, text, and backlight color.
buttons = ( (LCD.SELECT, 'Select', (1,1,1)),
            (LCD.LEFT,   'Left'  , (1,0,0)),
            (LCD.UP,     'Up'    , (0,0,1)),
            (LCD.DOWN,   'Down'  , (0,1,0)),
            (LCD.RIGHT,  'Right' , (1,0,1)) )

class displayThreadWrapper (threading.Thread):
    def __init__(self, lcd):
        threading.Thread.__init__(self)
        self.lcd = lcd
        self.lock = threading.Lock()
        self.text = 'Press a key...'
        self.textChanged = True

    def run(self):
        while True:
          self.lock.acquire()
          if self.textChanged:
            self.lcd.clear()
            self.lcd.message(self.text)
            self.textChanged = False
          time.sleep(50)
          self.lock.release()

    def setText(self, text):
        print "Text changing to: " + text
        self.lock.acquire()
        self.textChanged = True
        self.text = text
        self.lock.release()

class inputThreadWrapper (threading.Thread):
    def __init__(self, lcd, displayThread):
        threading.Thread.__init__(self)
        self.lcd = lcd
        self.displayThread = displayThread
        self.lock = threading.Lock()
        self.text = 'Press a key...'
        self.textChanged = True

    def run(self):
        while True:
            for button in buttons:
                if lcd.is_pressed(button[0]):
                    self.displayThread.setText(button[1])

displayThread = displayThreadWrapper(lcd)
inputThread = inputThreadWrapper(lcd, displayThread)

displayThread.start()
inputThread.start()