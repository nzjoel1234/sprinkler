import time
import threading
import pygame

# Char LCD plate button names.
SELECT                  = 32
RIGHT                   = 275
DOWN                    = 274
UP                      = 273
LEFT                    = 276

class Adafruit_CharLCDPlate:

    def __init__(self):
        pygame.init()
        width = 16
        height = 2
        self.size = [12*width, 20*height]
        self.screen = pygame.display.set_mode(self.size)
        pygame.display.set_caption("Mock LCD")
        self.font = pygame.font.SysFont("monospace", 20)
        self._keyStates = {
            SELECT: False,
            RIGHT: False,
            DOWN: False,
            UP: False,
            LEFT: False
        }

    def clear(self):
        self.screen.fill((0,0,0))

    def message(self, text):
        lines = text.splitlines()
        i=0
        self.clear()
        while i < len(lines):
            line = self.font.render(lines[i], 2, (255,255,0))
            self.screen.blit(line, (0, 20*i))
            i+=1
        pygame.display.flip()

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


