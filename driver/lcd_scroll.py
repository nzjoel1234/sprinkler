import threading

class Scroller(object):
    def __init__(self, lines=None, space=" :: ", delay=3, width=16, height=2):
        self._width = width
        self._height = height
        self._space = space
        self._thread_lock = threading.RLock()
        self._current_indices = []
        self._delay = delay
        self._delay_remaining = 0
        self._lines = []
        if lines is None:
            lines = []
        self.set_lines(lines)

    def set_lines(self, lines, restart_scroll=True):

        if isinstance(lines, basestring):
            lines = lines.split("\n")
        elif not isinstance(lines, list):
            raise Exception( \
                "Argument passed to lines parameter must be list, instead got: %s" % type(lines))
        if len(lines) > self._height:
            raise Exception( \
                "Have more lines to display (%s) than you have lcd rows (%s)" \
                    % (len(lines), self._height))

        with self._thread_lock:
            self._lines = lines
            if restart_scroll:
                self.restart_scroll()

    def get_lines(self):
        truncated = []
        with self._thread_lock:
            for i, line in enumerate(self._lines):
                if len(line) > self._width:
                    self._current_indices[i] = self._current_indices[i] % len(line + self._space)
                    current_index = self._current_indices[i]
                    looped_line = "%s%s%s" % (line, self._space, line)
                    processed = looped_line[current_index:current_index + self._width]
                else:
                    current_index = 0
                    processed = line
                truncated.append(processed)

            return "\n".join(truncated)

    def restart_scroll(self):
        with self._thread_lock:
            self._delay_remaining = self._delay
            self._current_indices = [0] * self._height

    def scroll(self):
        with self._thread_lock:
            if self._delay_remaining > 0:
                self._delay_remaining = self._delay_remaining - 1
                return
            for i, line in enumerate(self._lines[:]):
                if len(line) > self._width:
                    self._current_indices[i] = self._current_indices[i] + 1
