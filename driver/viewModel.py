#!/usr/bin/python

import time
import threading

import requests

class ViewModelBase(object):

    def __init__(self, view, change_view_model):
        self._view =  view
        self._change_view_model = change_view_model

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
        programViewModel = ProgramListViewModel(self._view, self._change_view_model)
        self._change_view_model(programViewModel)


class ProgramListViewModel(ViewModelBase):

    def __init__(self, view, change_view_model):
        super(ProgramListViewModel, self).__init__(view, change_view_model)
        self._update_display('Loading...', left_option = 'back')
        self._index = None
        self._programs = []
        self._programsLock = threading.RLock()
        self._updateProgramThread = None
        self._enabled = False

    def _update_program_list(self):

        failed = False
        try:
            r = requests.get('http://localhost:4000/api/programs')
        except Exception:
            failed = True
        with self._programsLock:
            self._index = None
            self._programs = []
            if failed:
                self._update_display('ERROR: Failed to load programs (No Response)', left_option = 'back')
                return
            if r.status_code != 200:
                self._update_display('ERROR: Failed to load programs (%s)' % r.status_code, left_option = 'back')
                return
            print "Got result: " + str(r.json())
            try:
                self._programs = list(map((lambda i: i['name']), r.json()))
            except Exception:
                self._update_display('ERROR: Failed to parse programs', left_option = 'back')
                return
            if len(self._programs) == 0:
                self._update_display('No programs', left_option = 'back')
                return
            self._index = 0
            self._move_program(0)

    def set_enabled(self, enabled):
        super(ProgramListViewModel, self).set_enabled(enabled)
        if self._enabled == enabled:
            return
        self._enabled = enabled
        if self._enabled:
            with self._programsLock:
                self._update_display('Loading...', left_option = 'back')
                if self._updateProgramThread != None and self._updateProgramThread.isAlive:
                    return
                self._updateProgramThread = threading.Thread(target=self._update_program_list)
                self._updateProgramThread.start()
        else:
            with self._programsLock:
                if self._updateProgramThread != None and self._updateProgramThread.isAlive:
                    self._updateProgramThread.join()
                    self._updateProgramThread = None

    def _move_program(self, step):
        with self._programsLock:
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
        homeViewModel = HomeViewModel(self._view, self._change_view_model)
        self._change_view_model(homeViewModel)
        
    def on_right_pressed(self):
        with self._programsLock:
            if self._index == None:
                return
            self._index = None
            self._update_display('Starting...', left_option = 'back')
        

