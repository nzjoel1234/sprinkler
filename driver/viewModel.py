#!/usr/bin/python

import threading

SCREEN_TIMEOUT = 3

class ViewModel(object):

    def __init__(self, view):
        self._view =  view
        self.update_display('Program 1 - 5 mins remaining', right_option = 'stop')
        self._view.enable_display(False)
        self._timeout_lock = threading.RLock()
        self._is_timed_out = True
        self._timeout_event = None

    def update_display(self, info = '', left_option = '', right_option = ''):
        lines = []
        lines.append(info)
        lines.append("%-8s%8s" % (left_option[:6], right_option[:6]))
        self._view.set_lines(lines, restart_scroll = False)

    def wake_from_screen_timeout(self):
        with self._timeout_lock:
            if self._timeout_event is not None:
                self._timeout_event.cancel()
            self._timeout_event = threading.Timer(SCREEN_TIMEOUT, self.on_screen_timeout)
            self._is_timed_out = False
            self._view.enable_display(True)
            self._timeout_event.start()

    def on_screen_timeout(self):
        with self._timeout_lock:
            self._is_timed_out = True
            self._view.enable_display(False)

    def on_left_pressed(self):
        self.wake_from_screen_timeout()
        self.update_display('Left button was pressed', left_option = 'left')

    def on_right_pressed(self):
        self.wake_from_screen_timeout()
        self.update_display('Right button was pressed', right_option = 'right')

    def on_up_pressed(self):
        self.wake_from_screen_timeout()
        self.update_display('Up button was pressed', left_option = 'up', right_option = 'up')

    def on_down_pressed(self):
        self.wake_from_screen_timeout()
        self.update_display('Down button was pressed', left_option = 'down', right_option = 'down')

    def on_select_pressed(self):
        self.wake_from_screen_timeout()
        self.update_display('Select button was pressed')
