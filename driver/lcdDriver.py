#!/usr/bin/python
# Example using a character LCD plate.
import time
import threading

import lcdScroll as Scroll

#import Adafruit_CharLCD as LCD
import lcdSimulator as LCD

import viewModel as VM

# Make list of button value, text, and backlight color.
buttons = (LCD.SELECT, LCD.LEFT, LCD.UP, LCD.DOWN, LCD.RIGHT)
DEBOUNCE_THRESHOLD = 10

class DisplayThreadWrapper (threading.Thread):
    def __init__(self, lcd, scroller):
        threading.Thread.__init__(self)
        self._lcd = lcd
        self._scroller = scroller
        self._stop = threading.Event()

    def set_lines(self, lines, restart_scroll = True):
        self._scroller.set_lines(lines, restart_scroll)

    def enable_display(self, enable):
        self._scroller.restart_scroll()
        self._lcd.enable_display(enable)

    def run(self):
        while not self._stop.isSet():
            self._lcd.clear()
            self._lcd.message(self._scroller.get_lines())
            self._scroller.scroll()
            time.sleep(0.1)

    def stop(self):
        self._stop.set()


class InputThreadWrapper (threading.Thread):
    def __init__(self, lcd, view_model):
        threading.Thread.__init__(self)
        self._lcd = lcd
        self._stop = threading.Event()
        self._view_model = view_model
        self._debounce = {}
        self._button_latched = {}

    def _on_button_pressed(self, button):
            if button == LCD.SELECT:
                self._view_model.on_select_pressed()
            elif button == LCD.LEFT:
                self._view_model.on_left_pressed()
            elif button == LCD.RIGHT:
                self._view_model.on_right_pressed()
            elif button == LCD.UP:
                self._view_model.on_up_pressed()
            elif button == LCD.DOWN:
                self._view_model.on_down_pressed()

    def run(self):
        while not self._stop.isSet():
            for button in buttons:
                if not button in self._debounce:
                    self._debounce[button] = 0
                    self._button_latched[button] = False
                if self._lcd.is_pressed(button) \
                   and self._debounce[button] < DEBOUNCE_THRESHOLD:
                        self._debounce[button] += 1
                        if not self._button_latched[button]:
                            self._button_latched[button] = True
                            self._on_button_pressed(button)
                elif self._debounce[button] > 0:
                    self._debounce[button] -= 1
                    if self._debounce[button] == 0:
                        self._button_latched[button] = False

    def stop(self):
        self._stop.set()


lcd = LCD.Adafruit_CharLCDPlate()
scroller = Scroll.Scroller(width=16, height=2, space = " * * * ")

displayThread = DisplayThreadWrapper(lcd, scroller)

model = VM.ViewModel(displayThread)

inputThread = InputThreadWrapper(lcd, model)

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