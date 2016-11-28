
BCM = 'BCM'

OUT = 'OUT'
IN = 'IN'

LOW = 'LOW'
HIGH = 'HIGH'

def setmode(mode):
    print 'MODE: %s' % mode

def setup(pins, state):
    print 'PINS: "%s" set in %s mode' % (pins, state)

def output(pins, state):
    print 'PINS: "%s" set to %s' % (pins, state)
