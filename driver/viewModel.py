#!/usr/bin/python

import time
import threading
import requests

import backgroundRequest

UPDATE_NEXT_PROGRAM_INFO_INTERVAL = 5

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
        self._enabled = False
        self._startProgramWorker = \
            backgroundRequest.BackgroundRequest(self._call_get_next_stage, self._on_get_next_stage_result)

    def on_right_pressed(self):
        programViewModel = ProgramListViewModel(self._view, self._change_view_model)
        self._change_view_model(programViewModel)

    def set_enabled(self, enabled):
        super(HomeViewModel, self).set_enabled(enabled)
        if self._enabled == enabled:
            return
        self._enabled = enabled
        if self._enabled:
            self._update_display('Loading...', right_option = 'progs')
            self._startProgramWorker.begin_request()
            self._previousNextProgram = None
            self._previousState = None
        else:
            self._startProgramWorker.cancel()
            if self._update_event != None:
                self._update_event.cancel()

    def _call_get_next_stage(self):
        return requests.get('http://localhost:4000/api/programs/next-scheduled-stage')

    def _on_get_next_stage_result(self, response):

        if response == None:
            self._change_view_model( \
                MessageViewModel(self._view, self._change_view_model, \
                    'ERROR: Failed to get next stage (No Response)'))
            self._update_event = threading.Timer(UPDATE_NEXT_PROGRAM_INFO_INTERVAL, self._call_get_next_stage)
            self._update_event.start()
            return

        if response.status_code != 200:
            self._change_view_model( \
                MessageViewModel(self._view, self._change_view_model, \
                    'ERROR: Failed to get next stage (STATUS=%s)' % response.status_code))
            self._update_event = threading.Timer(UPDATE_NEXT_PROGRAM_INFO_INTERVAL, self._call_get_next_stage)
            self._update_event.start()
            return

        nextStage = None
        try:
            nextStage = response.json()
        except Exception:
            self._change_view_model( \
                MessageViewModel(self._view, self._change_view_model, \
                    'ERROR: Failed to parse next stage'))
            self._update_event = threading.Timer(UPDATE_NEXT_PROGRAM_INFO_INTERVAL, self._call_get_next_stage)
            self._update_event.start()
            return

        programName = nextStage['programName']
        if nextStage['programStartIn'] >= 0:
            restartScroll = self._previousNextProgram != programName or self._previousState != 'pending'
            self._previousState = 'pending'
            minutes = int(nextStage['programStartIn']) / 60
            self._update_display('%s - Starts in %s mins' % (programName, minutes), right_option = 'progs', restart_scroll = restartScroll)
        else:
            restartScroll = self._previousNextProgram != programName or self._previousState != 'running'
            self._previousState = 'running'
            minutes = int(nextStage['programEndIn']) / 60
            self._update_display('%s - %s mins remaining' % (programName, minutes), right_option = 'progs', restart_scroll = restartScroll)
        self._previousNextProgram = programName

        self._update_event = threading.Timer(UPDATE_NEXT_PROGRAM_INFO_INTERVAL, self._startProgramWorker.begin_request)
        self._update_event.start()


class MessageViewModel(ViewModelBase):

    def __init__(self, view, change_view_model, message):
        super(MessageViewModel, self).__init__(view, change_view_model)
        self._update_display(message, left_option = 'back')
        
    def on_left_pressed(self):
        self._change_view_model( \
            HomeViewModel(self._view, self._change_view_model))


class ProgramListViewModel(ViewModelBase):

    def __init__(self, view, change_view_model):
        super(ProgramListViewModel, self).__init__(view, change_view_model)
        self._index = 0
        self._programs = []
        self._enabled = False
        self._programsLock = threading.RLock()
        self._updateProgramWorker = \
            backgroundRequest.BackgroundRequest(self._call_get_programs, self._on_program_list_result)

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
            self._updateProgramWorker.begin_request()
        else:
            self._updateProgramWorker.cancel()

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
        self._change_view_model( \
            HomeViewModel(self._view, self._change_view_model))
        
    def on_right_pressed(self):
        with self._programsLock:
            self._change_view_model( \
                StartProgramViewModel(self._view, self._change_view_model,
                    self._programs[self._index]['programId']))


class StartProgramViewModel(ViewModelBase):

    def __init__(self, view, change_view_model, programId):
        super(StartProgramViewModel, self).__init__(view, change_view_model)
        self._programId = programId
        self._enabled = False
        self._startProgramWorker = \
            backgroundRequest.BackgroundRequest(self._call_start_program, self._on_program_start_result)

    def _call_start_program(self):
        return requests.post('http://localhost:4000/api/programs/%s/start' % self._programId)

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
            self._startProgramWorker.begin_request()
        else:
            self._startProgramWorker.cancel()

    def on_left_pressed(self):
        self._change_view_model( \
            HomeViewModel(self._view, self._change_view_model))
