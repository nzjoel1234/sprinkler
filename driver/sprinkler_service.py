import threading
import requests

POLL_PERIOD = 5

class SprinklerService(object):
    def __init__(self, baseUrl, username, password, zone_service):
        self._base_url = baseUrl
        self._auth = (username, password)
        self._zone_service = zone_service
        self._next_stage_lock = threading.RLock()
        self._program_in_progress = False
        self._status = 'Loading...'
        self._state_change_id = 0
        self._previous_program = None
        self._previous_state = None
        self._stop_event = threading.Event()

    def start(self):
        target = lambda: self._update_next_stage(recurring=True)
        threading.Thread(target=target).start()

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
        return '%dh %02dm' % (hours, minutes % 60)

    def _safe_request(self, do_request):
        try:
            return do_request()
        except requests.ConnectionError:
            return None

    def _do_programs_trigger(self, url, action_description, on_result):
        response = self._safe_request(lambda: requests.post(url, auth=self._auth))

        if response is None:
            on_result((False, 'ERROR: Failed to %s (No Response)' % action_description))
            return

        if response.status_code != 200:
            error = 'ERROR: Failed to %s (STATUS=%s)' % (action_description, response.status_code)
            on_result((False, error))
            return

        self._update_next_stage()
        on_result((True, None))

    def start_program(self, program_id, on_result):
        url = '%s/api/programs/%s/start' % (self._base_url, program_id)
        target = lambda: self._do_programs_trigger(url, 'start program', on_result)
        threading.Thread(target=target).start()

    def stop_program(self, on_result):
        url = '%s/api/programs/stop' % (self._base_url)
        target = lambda: self._do_programs_trigger(url, 'stop program', on_result)
        threading.Thread(target=target).start()

    def _do_get_programs(self, on_result):
        url = '%s/api/programs' % self._base_url
        response = self._safe_request(lambda: requests.get(url, auth=self._auth))

        error = None
        if response is None:
            error = 'ERROR: Failed to load programs (No Response)'
        elif response.status_code != 200:
            error = 'ERROR: Failed to load programs (STATUS=%s)' % (response.status_code)

        if error is not None:
            on_result((None, error))
            return

        programs = None
        try:
            programs = response.json()
        except:
            on_result((None, 'ERROR: Failed to parse programs'))
            return

        on_result((programs, None))

    def get_programs(self, on_result):
        target = lambda: self._do_get_programs(on_result)
        threading.Thread(target=target).start()

    def _update_next_stage(self, recurring=False):
        url = '%s/api/programs/next-scheduled-stage' % self._base_url
        response = self._safe_request(lambda: requests.get(url, auth=self._auth))
        error = None
        next_stage = None
        current_zone_id = None

        if response is None:
            error = 'ERROR: Failed to get next stage (No Response)'
        elif response.status_code != 200 and response.status_code != 204:
            error = 'ERROR: Failed to get next stage (STATUS=%s)' % response.status_code
        else:
            if response.text != '':
                try:
                    next_stage = response.json()
                except:
                    error = 'ERROR: Failed to parse next stage'

        with self._next_stage_lock:
            if error != None:
                self._program_in_progress = False
                if error != self._status:
                    self._state_change_id += 1
                    self._status = error
            elif next_stage is None:
                self._program_in_progress = False
                if self._previous_state != 'none':
                    self._state_change_id += 1
                    self._previous_state = 'none'
                self._status = 'No scheduled programs'
            else:
                program_name = next_stage['programName']
                if next_stage['programStartIn'] >= 0:
                    self._program_in_progress = False
                    if self._previous_program != program_name or self._previous_state != 'pending':
                        self._state_change_id += 1
                        self._previous_state = 'pending'
                    time = self._get_display_time(int(next_stage['programStartIn']))
                    self._status = '%s - Starts in %s' % (program_name, time)
                else:
                    self._program_in_progress = True
                    if self._previous_program != program_name or self._previous_state != 'running':
                        self._state_change_id += 1
                        self._previous_state = 'running'
                    current_zone_id = int(next_stage['zoneId'])
                    time = self._get_display_time(int(next_stage['programEndIn']))
                    self._status = '%s - %s remaining' % (program_name, time)
                self._previous_program = program_name

        self._zone_service.set_zone(current_zone_id)

        if not recurring:
            return

        if not self._stop_event.wait(POLL_PERIOD):
            target = lambda: self._update_next_stage(recurring=True)
            threading.Thread(target=target).start()
