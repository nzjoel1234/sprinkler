import threading
import requests

POLL_PERIOD = 5

class SprinklerService (object):
    def __init__(self, baseUrl, zone_service):
        self._baseUrl = baseUrl
        self._zone_service = zone_service
        self._next_stage_lock = threading.RLock()
        self._program_in_progress = False
        self._status = 'Loading...'
        self._state_change_id = 0
        self._previousProgram = None
        self._previousState = None
        self._stop_event = threading.Event()

    def start(self):
        self._call_get_next_stage()

    def get_status(self):
        with self._next_stage_lock:
            return (self._state_change_id, self._program_in_progress, self._status)

    def stop(self):
        self._stop_event.set()

    def _get_display_time(self, seconds):
        minutes = seconds / 60
        if minutes < 60:
            return '%s mins' % minutes
        hours = minutes / 60
        return '%s hours' % hours

    def _do_get_programs(self):
        url = '%s/api/programs' % self._baseUrl
        try:
            return requests.get(url)
        except:
            return None

    def _do_start_program(self, program_id):
        url = '%s/api/programs/%s/start' % (self._baseUrl, program_id)
        try:
            return requests.post(url)
        except:
            return None

    def _do_stop_program(self):
        url = '%s/api/programs/stop' % (self._baseUrl)
        try:
            return requests.post(url)
        except:
            return None

    def _do_get_next_stage(self):
        url = '%s/api/programs/next-scheduled-stage' % self._baseUrl
        try:
            return requests.get(url)
        except:
            return None

    def start_program(self, program_id, on_result):
        target = lambda: on_result(self._do_start_program(program_id))
        threading.Thread(target = target).start()

    def stop_program(self, on_result):
        target = lambda: on_result(self._do_stop_program())
        threading.Thread(target = target).start()

    def get_programs(self, on_result):
        target = lambda: on_result(self._do_get_programs())
        threading.Thread(target = target).start()

    def _call_get_next_stage(self):
        target = lambda: self._on_get_next_stage_result(self._do_get_next_stage())
        threading.Thread(target = target).start()

    def _on_get_next_stage_result(self, response):
        error = None
        nextStage = None
        current_zone_id = None

        if response == None:
            error = 'ERROR: Failed to get next stage (No Response)'
        elif response.status_code != 200:
            error = 'ERROR: Failed to get next stage (STATUS=%s)' % response.status_code
        else:
            try:
                nextStage = response.json()
            except Exception:
                error = 'ERROR: Failed to parse next stage'

        with self._next_stage_lock:
            if error != None:
                self._program_in_progress = False
                if error != self._status:
                    self._state_change_id += 1
                    self._status = error
            else:
                programName = nextStage['programName']
                if nextStage['programStartIn'] >= 0:
                    self._program_in_progress = False
                    if self._previousProgram != programName or self._previousState != 'pending':
                        self._state_change_id += 1
                        self._previousState = 'pending'
                    time = self._get_display_time(int(nextStage['programStartIn']))
                    self._status = '%s - Starts in %s' % (programName, time)
                else:
                    self._program_in_progress = True
                    if self._previousProgram != programName or self._previousState != 'running':
                        self._state_change_id += 1
                        self._previousState = 'running'
                    current_zone_id = int(nextStage['zoneId'])
                    time = self._get_display_time(int(nextStage['programEndIn']))
                    self._status = '%s - %s remaining' % (programName, time)
                self._previousProgram = programName

        self._zone_service.set_zone(current_zone_id)
        if not self._stop_event.wait(POLL_PERIOD):
            self._call_get_next_stage()
