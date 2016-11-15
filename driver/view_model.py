import threading

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

    def on_left_pressed(self):
        self._change_view_model( \
            StopProgramViewModel(self._view, self._change_view_model, self._sprinkler_service))

    def on_right_pressed(self):
        self._change_view_model( \
            ProgramListViewModel(self._view, self._change_view_model, self._sprinkler_service))

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
            (status_change_id, program_in_progress, status) = self._sprinkler_service.get_status()
            left_option = 'stop' if program_in_progress else ''
            self._update_display(status, left_option = left_option, right_option = 'progs', restart_scroll = self._last_status_change_id != status_change_id)
            self._last_status_change_id = status_change_id
            self._stop_event.wait(1)


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

    def _on_program_list_result(self, response):
        with self._programsLock:
            (programs, error) = response

            if error is not None:
                self._change_view_model( \
                    MessageViewModel(self._view, self._change_view_model, error))
                return

            self._programs = programs
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
                StartProgramViewModel(self._view, self._change_view_model, self._sprinkler_service, \
                    self._programs[self._index]['programId']))


class StartProgramViewModel(ViewModelBase):

    def __init__(self, view, change_view_model, sprinkler_service, programId):
        super(StartProgramViewModel, self).__init__(view, change_view_model)
        self._programId = programId
        self._sprinkler_service = sprinkler_service
        self._enabled = False

    def _on_program_start_result(self, response):
        (success, error_message) = response

        if not success:
            self._change_view_model( \
                MessageViewModel(self._view, self._change_view_model, error_message))
            return

        self._change_view_model()

    def set_enabled(self, enabled):
        super(StartProgramViewModel, self).set_enabled(enabled)
        if self._enabled == enabled:
            return
        self._enabled = enabled
        if self._enabled:
            self._update_display('Starting...')
            self._sprinkler_service.start_program(self._programId, self._on_program_start_result)


class StopProgramViewModel(ViewModelBase):

    def __init__(self, view, change_view_model, sprinkler_service):
        super(StopProgramViewModel, self).__init__(view, change_view_model)
        self._sprinkler_service = sprinkler_service
        self._enabled = False

    def _on_program_stop_result(self, response):
        (success, error_message) = response

        if not success:
            self._change_view_model( \
                MessageViewModel(self._view, self._change_view_model, error_message))
            return

        self._change_view_model()

    def set_enabled(self, enabled):
        super(StopProgramViewModel, self).set_enabled(enabled)
        if self._enabled == enabled:
            return
        self._enabled = enabled
        if self._enabled:
            self._update_display('Stopping...')
            self._sprinkler_service.stop_program(self._on_program_stop_result)
