#!/usr/bin/python

class ViewModel(object):

    def __init__(self):
        self.update_display('Program 1 - 5 mins remaining', right_option = 'stop')

    def get_display_lines(self):
        return self._lines
    
    def update_display(self, info = '', left_option = '', right_option = ''):
        self._lines = []
        self._lines.append(info)
        self._lines.append("%-8s%8s" % (left_option[:6], right_option[:6]))

    def on_left_pressed(self):
        self.update_display('Left button was pressed', left_option = 'left')

    def on_right_pressed(self):
        self.update_display('Right button was pressed', right_option = 'right')

    def on_up_pressed(self):
        self.update_display('Up button was pressed', left_option = 'up', right_option = 'up')

    def on_down_pressed(self):
        self.update_display('Down button was pressed', left_option = 'down', right_option = 'down')

    def on_select_pressed(self):
        self.update_display('Select button was pressed')
