#!/usr/bin/python
# Example using a character LCD plate.
import time
import threading

import Adafruit_CharLCD as LCD

class displayThreadWrapper (threading.Thread):
    def __init__(self):
        threading.Thread.__init__(self)
        self.lock = threading.Lock()
        self.lcd = LCD.Adafruit_CharLCDPlate()
        self.text = 'Press a key...'
        self.textChanged = True

    def run(self):
        print "Starting " + self.name
        self.lock.acquire()
        if self.textChanged:
          self.lcd.clear()
          self.lcd.message(self.text)
          self.textChanged = False
        self.lock.release()

    def setText(self, text):
        print "Text changing to: " + text
        self.lock.acquire()
        self.textChanged = True
        self.text = text
        self.lock.release()

displayThread = displayThreadWrapper()
displayThread.start()

# Make list of button value, text, and backlight color.
buttons = ( (LCD.SELECT, 'Select', (1,1,1)),
            (LCD.LEFT,   'Left'  , (1,0,0)),
            (LCD.UP,     'Up'    , (0,0,1)),
            (LCD.DOWN,   'Down'  , (0,1,0)),
            (LCD.RIGHT,  'Right' , (1,0,1)) )

print('Press Ctrl-C to quit.')
while True:
    # Loop through each button and check if it is pressed.
    for button in buttons:
        if lcd.is_pressed(button[0]):
            # Button is pressed, change the message and backlight.
            displayThread(button[1])
            lcd.set_color(button[2][0], button[2][1], button[2][2])