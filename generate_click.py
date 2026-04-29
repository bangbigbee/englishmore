import wave
import struct
import math
import random

sample_rate = 44100.0
duration = 0.015 # 15ms for a sharp click
frequency = 1200.0

wave_file = wave.open('public/audio/gear-click.wav', 'w')
wave_file.setparams((1, 2, int(sample_rate), int(sample_rate * duration), 'NONE', 'not compressed'))

for i in range(int(sample_rate * duration)):
    # Add some noise for a mechanical click sound
    noise = random.uniform(-1, 1) * 0.5
    sine = math.sin(2.0 * math.pi * frequency * i / sample_rate)
    combined = (sine + noise) / 1.5
    
    # Sharp exponential decay
    amplitude = 32767.0 * math.exp(-i / (sample_rate * 0.003))
    
    value = int(amplitude * combined)
    # Clamp
    if value > 32767: value = 32767
    if value < -32768: value = -32768
    
    data = struct.pack('<h', value)
    wave_file.writeframesraw(data)

wave_file.close()
