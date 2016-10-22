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
SCROLL_PERIOD = 0.15

SCREEN_TIMEOUT = 4

class DisplayThreadWrapper (threading.Thread):
    def __init__(self, lcd, scroller):
        
        threading.Thread.__init__(self)
        self._lcd = lcd
        self._scroller = scroller
        self._enabled = False
        self._stop = threading.Event()
        self._thread_lock = threading.RLock()

    def set_lines(self, lines, restart_scroll = True):
        with self._thread_lock:
            self._scroller.set_lines(lines, restart_scroll)

    def set_enabled(self, enable):
        with self._thread_lock:
            self._enabled = enable
            self._scroller.restart_scroll()
            self._lcd.enable_display(enable)

    def run(self):
        while not self._stop.isSet():
            with self._thread_lock:
                if self._enabled:
                    self._lcd.clear()
                    self._lcd.message(self._scroller.get_lines())
                    self._scroller.scroll()
            time.sleep(SCROLL_PERIOD)

    def stop(self):
        self._stop.set()


class InputThreadWrapper (threading.Thread):
    def __init__(self, lcd, create_home_screen):
        threading.Thread.__init__(self)
        self._lcd = lcd
        self._stop = threading.Event()
        self._debounce = {}
        self._button_latched = {}
        self._create_home_screen = create_home_screen
        self._view_model = None
        self._timeout_lock = threading.RLock()
        self._timeout_event = None
        self._enabled = False

    def _start_screen_timeout(self):
        with self._timeout_lock:
            self._stop_timeout()
            self._timeout_event = threading.Timer(SCREEN_TIMEOUT, self._on_screen_timeout)
            self._timeout_event.start()

    def _on_screen_timeout(self):
        with self._timeout_lock:
            self.set_enabled(False)

    def _stop_timeout(self):
        with self._timeout_lock:
            if self._timeout_event is not None:
                self._timeout_event.cancel()

    def set_enabled(self, enabled):
        if not self._view_model == None:
            self._view_model.set_enabled(enabled)
        if not enabled:
            self._view_model = None
            self._stop_timeout()
        self._enabled = enabled

    def set_view_model(self, new_view_model):
        if not self._view_model == None:
            self._view_model.set_enabled(False)
        if not new_view_model == None:
            new_view_model.set_enabled(self._enabled)
        self._view_model = new_view_model

    def on_button_press(self, button):
        if button == LCD.SELECT:
            self.set_enabled(not self._enabled)        
        if not self._enabled:
            return
        if self._view_model == None:
            self.set_view_model(self._create_home_screen(self.set_view_model))
        self._start_screen_timeout()
        if button == LCD.LEFT:
            self._view_model.on_left_pressed()
        elif button == LCD.RIGHT:
            self._view_model.on_right_pressed()
        elif button == LCD.UP:
            self._view_model.on_up_pressed()
        elif button == LCD.DOWN:
            self._view_model.on_down_pressed()

    def run(self):
        print 'abc'
        while not self._stop.isSet():
            for button in buttons:
                if not button in self._debounce:
                    self._debounce[button] = 0
                    self._button_latched[button] = False

                if self._lcd.is_pressed(button) \
                        and self._debounce[button] < DEBOUNCE_THRESHOLD:
                    self._debounce[button] += 1
                elif self._debounce[button] > 0:
                    self._debounce[button] -= 1

                if self._debounce[button] == 0:
                    self._button_latched[button] = False

                if self._debounce[button] == DEBOUNCE_THRESHOLD \
                        and not self._button_latched[button]:
                    self._button_latched[button] = True
                    self.on_button_press(button)

    def stop(self):
        self._stop.set()


lcd = LCD.Adafruit_CharLCDPlate()
scroller = Scroll.Scroller(width=16, height=2, space = " * * * ")

displayThread = DisplayThreadWrapper(lcd, scroller)

def create_home_screen(set_view_model):
    return VM.HomeViewModel(displayThread, set_view_model)

inputThread = InputThreadWrapper(lcd, create_home_screen)

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