import threading

class BackgroundRequest():

    def __init__(self, perform_request, callback):
        self._perform_request = perform_request
        self._callback = callback
        self._requestThread = None
        self._threadLock = threading.RLock()

    def begin_request(self):
        with self._threadLock:
            if self._requestThread != None and self._requestThread.isAlive():
                return
            self._requestThread = threading.Thread(target=self._call_perform_request)
            self._requestThread.start()

    def cancel(self):
        with self._threadLock:
            if self._requestThread != None and self._requestThread.isAlive():
                self._requestThread = None

    def _call_perform_request(self):
        with self._threadLock:
            try:
                r = self._perform_request()
            except Exception:
                r = None

            self._callback(r)
