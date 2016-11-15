import threading

SCROLL_PERIOD = 0.15

class DisplayThreadWrapper (threading.Thread):
    def __init__(self, lcd, scroller):
        
        threading.Thread.__init__(self)
        self._lcd = lcd
        self._scroller = scroller
        self._enabled = False
        self._stop_event = threading.Event()
        self._thread_lock = threading.RLock()

    def set_lines(self, lines, restart_scroll = True):
        with self._thread_lock:
            self._scroller.set_lines(lines, restart_scroll)

    def set_enabled(self, enable):
        with self._thread_lock:
            self._enabled = enable
            self._scroller.restart_scroll()
            self._lcd.enable_display(enable)

    def run(self):
        while not self._stop_event.is_set():
            with self._thread_lock:
                if self._enabled:
                    self._lcd.clear()
                    self._lcd.message(self._scroller.get_lines())
                    self._scroller.scroll()
            self._stop_event.wait(SCROLL_PERIOD)

    def stop(self):
        self._stop_event.set()