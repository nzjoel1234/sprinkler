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
        self.stop = False

    def run(self):
        while not self.stop:
          if self.textChanged:
            self.lock.acquire()
            self.lcd.clear()
            self.lcd.message(self.text)
            self.textChanged = False
            self.lock.release()
          time.sleep(50)

    def setText(self, text):
        print "Text changing to: " + text
        self.lock.acquire()
        self.textChanged = True
        self.text = text
        self.lock.release()

    def stop(self):
        self.stop = True

class inputThreadWrapper (threading.Thread):
    def __init__(self, lcd, displayThread):
        threading.Thread.__init__(self)
        self.lcd = lcd
        self.displayThread = displayThread
        self.text = 'Press a key...'
        self.textChanged = True
        self.stop = False

    def run(self):
        while not self.stop:
            for button in buttons:
                if lcd.is_pressed(button[0]):
                    self.displayThread.setText(button[1])

    def stop(self):
        self.stop = True

displayThread = displayThreadWrapper(lcd)
inputThread = inputThreadWrapper(lcd, displayThread)

try:
    displayThread.start()
    inputThread.start()
except (KeyboardInterrupt, SystemExit):
    displayThread.stop()
    displayThread.join()
    inputThread.stop()
    inputThread.join()
    sys.exit()