#!/usr/bin/python

import time
import threading
import requests

UPDATE_LCD_STATUS_PERIOD = 5

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

    def __init__(self, view, change_view_model, sprinkler_service):
        super(HomeViewModel, self).__init__(view, change_view_model)
        self._enabled = False
        self._sprinkler_service = sprinkler_service
        self._stop_event = threading.Event()
        self._last_status_change_id = None

    def on_right_pressed(self):
        programViewModel = ProgramListViewModel(self._view, self._change_view_model, self._sprinkler_service)
        self._change_view_model(programViewModel)

    def set_enabled(self, enabled):
        super(HomeViewModel, self).set_enabled(enabled)
        if self._enabled == enabled:
            return
        self._enabled = enabled
        if self._enabled:
            self._stop_event.clear()
            threading.Thread(target = self._lcd_update_loop).start()
        else:
            self._stop_event.set()

    def _lcd_update_loop(self):
        while not self._stop_event.is_set():
            (status, status_change_id) = self._sprinkler_service.get_status()
            self._update_display(status, right_option = 'progs', restart_scroll = self._last_status_change_id != status_change_id)
            self._last_status_change_id = status_change_id
            self._stop_event.wait(UPDATE_LCD_STATUS_PERIOD)


class MessageViewModel(ViewModelBase):

    def __init__(self, view, change_view_model, message):
        super(MessageViewModel, self).__init__(view, change_view_model)
        self._update_display(message, left_option = 'back')
        
    def on_left_pressed(self):
        self._change_view_model()


class ProgramListViewModel(ViewModelBase):

    def __init__(self, view, change_view_model, sprinkler_service):
        super(ProgramListViewModel, self).__init__(view, change_view_model)
        self._index = 0
        self._programs = []
        self._enabled = False
        self._sprinkler_service = sprinkler_service
        self._programsLock = threading.RLock()

    def _call_get_programs(self):
        return requests.get('http://localhost:4000/api/programs')

    def _on_program_list_result(self, response):
        with self._programsLock:

            self._programs = []

            if response == None:
                self._change_view_model( \
                    MessageViewModel(self._view, self._change_view_model, \
                        'ERROR: Failed to load programs (No Response)'))
                return
            
            if response.status_code != 200:
                self._change_view_model( \
                    MessageViewModel(self._view, self._change_view_model, \
                        'ERROR: Failed to load programs (STATUS=%s)' % response.status_code))
                return

            try:
                self._programs = response.json()
            except Exception:
                self._change_view_model( \
                    MessageViewModel(self._view, self._change_view_model, \
                        'ERROR: Failed to parse programs'))
                return

            self._index = 0
            self._move_program(0)

    def set_enabled(self, enabled):
        super(ProgramListViewModel, self).set_enabled(enabled)
        if self._enabled == enabled:
            return
        self._enabled = enabled
        if self._enabled:
            self._update_display('Loading...', left_option = 'back')
            self._sprinkler_service.get_programs(self._on_program_list_result)

    def _move_program(self, step):
        with self._programsLock:

            if len(self._programs) == 0:
                self._update_display('- No programs -', left_option = 'back')
                return

            if self._index == None:
                self._index = 0

            self._index += step
            while self._index < 0:
                self._index += len(self._programs)
            self._index = self._index % len(self._programs)
            self._update_display(self._programs[self._index]['name'], left_option = 'back', right_option = 'start')

    def on_down_pressed(self):
        self._move_program(1)

    def on_up_pressed(self):
        self._move_program(-1)

    def on_left_pressed(self):
        self._change_view_model()
        
    def on_right_pressed(self):
        with self._programsLock:
            self._change_view_model( \
                StartProgramViewModel(self._view, self._change_view_model, self._sprinkler_service,
                    self._programs[self._index]['programId']))


class StartProgramViewModel(ViewModelBase):

    def __init__(self, view, change_view_model, sprinkler_service, programId):
        super(StartProgramViewModel, self).__init__(view, change_view_model)
        self._programId = programId
        self._sprinkler_service = sprinkler_service
        self._enabled = False

    def _on_program_start_result(self, response):

            if response == None:
                self._change_view_model( \
                    MessageViewModel(self._view, self._change_view_model, \
                        'ERROR: Failed to start program (No Response)'))
                return

            if response.status_code != 200:
                self._change_view_model( \
                    MessageViewModel(self._view, self._change_view_model, \
                        'ERROR: Failed to start program (STATUS=%s)' % response.status_code))
                return

            self._change_view_model( \
                MessageViewModel(self._view, self._change_view_model, \
                    'Program started'))

    def set_enabled(self, enabled):
        super(StartProgramViewModel, self).set_enabled(enabled)
        if self._enabled == enabled:
            return
        self._enabled = enabled
        if self._enabled:
            self._update_display('Starting...', left_option = 'back')
            self._sprinkler_service.start_program(self._programId, self._on_program_start_result)

    def on_left_pressed(self):
        self._change_view_model()
