#!/usr/bin/python

import time

class ViewModelBase(object):

    def __init__(self, view, change_view_model):
        self._view =  view
        self._change_view_model = change_view_model
        self._change_view_model(self)

    def set_enabled(self, enabled):
        self._view.set_enabled(enabled)

    def _update_display(self, info = '', left_option = '', right_option = '', restart_scroll = True):
        lines = []
        lines.append(info)
        lines.append("%-8s%8s" % (left_option[:6], right_option[:6]))
        self._view.set_lines(lines, restart_scroll)

    def on_left_pressed(self):
        return

    def on_right_pressed(self):
        return

    def on_up_pressed(self):
        return

    def on_down_pressed(self):
        return


class HomeViewModel(ViewModelBase):

    def __init__(self, view, change_view_model):
        super(HomeViewModel, self).__init__(view, change_view_model)
        self._update_display('Program 1 - Starts in 5 mins', right_option = 'progs')

    def on_right_pressed(self):
        ProgramListViewModel(self._view, self._change_view_model)


class ProgramListViewModel(ViewModelBase):

    def __init__(self, view, change_view_model):
        super(ProgramListViewModel, self).__init__(view, change_view_model)
        self._update_display('Loading...', left_option = 'back')
        self._index = None
        time.sleep(1)
        self._programs = ['Program 1', 'Program with a very long name', 'Short Name']
        self._index = 0
        self._move_program(0)

    def _move_program(self, step):
        if self._index == None:
            return
        self._index += step
        while self._index < 0:
            self._index += len(self._programs)
        self._index = self._index % len(self._programs)
        self._update_display(self._programs[self._index], left_option = 'back', right_option = 'start')

    def on_down_pressed(self):
        self._move_program(1)

    def on_up_pressed(self):
        self._move_program(-1)

    def on_left_pressed(self):
        HomeViewModel(self._view, self._change_view_model)
        
    def on_right_pressed(self):
        if self._index == None:
            return
        self._index = None
        self._update_display('Starting...', left_option = 'back')
        

