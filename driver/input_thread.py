import threading

SIMULATED = False
try:
    import Adafruit_CharLCD as Lcd
except ImportError:
    import lcd_simulator as Lcd
    SIMULATED = True

DEBOUNCE_THRESHOLD = 2
SCREEN_TIMEOUT = 60

class InputThreadWrapper(threading.Thread):
    def __init__(self, is_button_pressed, buttons, create_home_screen):
        threading.Thread.__init__(self)
        self._is_button_pressed = is_button_pressed
        self._buttons = buttons
        self._create_home_screen = create_home_screen
        self._stop_event = threading.Event()
        self._timeout_stop_event = threading.Event()
        self._debounce = {}
        self._button_latched = {}
        self._view_model = None
        self._timeout_lock = threading.RLock()
        self._timeout_counter = 0
        self._enabled = False

    def _start_screen_timeout(self):
        with self._timeout_lock:
            self._timeout_counter += 1
            self._timeout_stop_event.set()
            self._timeout_stop_event = threading.Event()
        timeout_counter = self._timeout_counter
        target = lambda: self._wait_for_screen_timeout(self._timeout_stop_event, timeout_counter)
        threading.Thread(target=target).start()

    def _wait_for_screen_timeout(self, _stop_event, timeout_counter):
        _stop_event.wait(SCREEN_TIMEOUT)
        with self._timeout_lock:
            if timeout_counter == self._timeout_counter:
                self.set_enabled(False)

    def set_enabled(self, enabled):
        if not self._view_model is None:
            self._view_model.set_enabled(enabled)
        if not enabled:
            self._timeout_stop_event.set()
            self._view_model = None
        self._enabled = enabled

    def set_view_model(self, new_view_model=None):
        if not self._view_model is None:
            self._view_model.set_enabled(False)
        if new_view_model is None:
            new_view_model = self._create_home_screen(self.set_view_model)
        self._view_model = new_view_model
        new_view_model.set_enabled(self._enabled)

    def on_button_press(self, button):
        if button == Lcd.SELECT:
            self.set_enabled(not self._enabled)
        if not self._enabled:
            return
        if self._view_model is None:
            self.set_view_model()
        self._start_screen_timeout()
        if button == Lcd.LEFT:
            self._view_model.on_left_pressed()
        elif button == Lcd.RIGHT:
            self._view_model.on_right_pressed()
        elif button == Lcd.UP:
            self._view_model.on_up_pressed()
        elif button == Lcd.DOWN:
            self._view_model.on_down_pressed()

    def run(self):
        while not self._stop_event.is_set():
            for button in self._buttons:
                if not button in self._debounce:
                    self._debounce[button] = 0
                    self._button_latched[button] = False

                if self._is_button_pressed(button) \
                        and self._debounce[button] < DEBOUNCE_THRESHOLD:
                    self._debounce[button] += 1
                elif self._debounce[button] > 0:
                    self._debounce[button] -= 1

                if self._debounce[button] == 0:
                    self._button_latched[button] = False

                if self._debounce[button] == DEBOUNCE_THRESHOLD \
                        and not self._button_latched[button]:
                    self._button_latched[button] = True
                    self.on_button_press(button)
            self._stop_event.wait(0.01)

    def stop(self):
        self._stop_event.set()
        self._timeout_stop_event.set()
