#!/usr/bin/python
"""
lcdScroll.py
Author             :  Eric Pavey 
Creation Date      :  2014-02-08
Blog               :  http://www.akeric.com/blog

Free and open for all to use.  But put credit where credit is due.

OVERVIEW:-----------------------------------------------------------------------
Create scrolling text on a LCD display.  Designed to work on the the 
Adafruit LCD  + keypad, but it's not tied to any specific hardware, and should
work on a LCD of any size.

See lcdScrollTest.py for simple example usage.
"""

import threading

class Scroller(object):
    def __init__(self, lines=[], space = " :: ", delay = 3, width=16, height=2):
        self.width = width
        self.height = height
        self.space = space
        self._threadLock = threading.RLock()
        self._currentIndices = []
        self._delay = delay
        self._delayRemaining = 0
        self._lines = []
        self.set_lines(lines)

    def set_lines(self, lines, restart_scroll = True):
        
        if isinstance(lines, basestring):   
            lines = lines.split("\n")
        elif not isinstance(lines, list):
            raise Exception("Argument passed to lines parameter must be list, instead got: %s"%type(lines))
        if len(lines) > self.height:
            raise Exception("Have more lines to display (%s) than you have lcd rows (%s)"%(len(lines), height))
    
        with self._threadLock:
            self._lines = lines
            if restart_scroll:
                self.restart_scroll()

    def get_lines(self):
        truncated = []
        with self._threadLock:
            for i,line in enumerate(self._lines):
                self._currentIndices[i] = self._currentIndices[i] % len(line + self.space)
                currentIndex = self._currentIndices[i]
                truncated.append(("%s%s%s" % (line, self.space, line))[currentIndex:currentIndex + self.width])
            return "\n".join(truncated)

    def restart_scroll(self):
        with self._threadLock:
            self._delayRemaining = self._delay
            self._currentIndices = [0] * self.height

    def scroll(self):
        with self._threadLock:
            if (self._delayRemaining > 0):
                self._delayRemaining = self._delayRemaining - 1
                return
            for i,line in enumerate(self._lines[:]):
                if len(line) > 16:
                    self._currentIndices[i] = self._currentIndices[i] + 1