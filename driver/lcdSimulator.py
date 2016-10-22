import time
import threading
import pygame

# Char LCD plate button names.
SELECT                  = 32
RIGHT                   = 275
DOWN                    = 274
UP                      = 273
LEFT                    = 276

FONT_HEIGHT = 20
FONT_WIDTH = 12

class Adafruit_CharLCDPlate:

    def __init__(self, width = 16, height = 2):
        pygame.init()
        self._width = width
        self.screen = pygame.display.set_mode([FONT_WIDTH * width, FONT_HEIGHT * height])
        pygame.display.set_caption("Mock LCD")
        self.font = pygame.font.SysFont("monospace", FONT_HEIGHT)
        self._keyStates = {
            SELECT: False,
            RIGHT: False,
            DOWN: False,
            UP: False,
            LEFT: False
        }
        self._lines = ['', '']
        self._display_on = False

    def enable_display(self, enable):
        self._display_on = enable
        self._update_screen()

    def clear(self):
        self.screen.fill((0,0,0))

    def _update_screen(self):
        self.clear()
        i=0
        lcd_back_color = (0,0,100) if self._display_on else (0,0,0)
        lcd_text_color = (255,255,0) if self._display_on else (100,100,0)
        while i < len(self._lines):
            line = self._lines[i].ljust(self._width, ' ')
            rendered_line = self.font.render(line, 2, lcd_text_color, lcd_back_color)
            self.screen.blit(rendered_line, (0, FONT_HEIGHT * i))
            i+=1
        pygame.display.flip()

    def message(self, text):
        self._lines = text.splitlines()
        self._update_screen()

    def set_color(self, red, green, blue):
        return

    def is_pressed(self, button):
        return self._keyStates[button]

    def run(self):
        crashed = False
        clock = pygame.time.Clock()
        while not crashed:

            for event in pygame.event.get():
                if event.type == pygame.KEYDOWN:
                    self._keyStates[event.key] = True
                if event.type == pygame.KEYUP:
                    self._keyStates[event.key] = False
                if event.type == pygame.QUIT:
                    crashed = True

            pygame.display.update()
            clock.tick(60)

