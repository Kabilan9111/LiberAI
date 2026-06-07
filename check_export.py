import numpy as np
import wave, os, struct, math

# Test the exact export pipeline from server.py
# Simulate what model.generate returns: shape (batch=1, channels=1, time_samples)
# MusicGen returns a mono float32 tensor in range [-1.0, 1.0]

audio_dir = r'f:\Liber AI\musicgen_server\static\audio'
files = sorted([f for f in os.listdir(audio_dir) if f.endswith('.wav')], key=lambda f: os.path.getctime(os.path.join(audio_dir, f)), reverse=True)
latest = os.path.join(audio_dir, files[0])

print(f'Checking: {files[0]}')

import soundfile as sf
data, sr = sf.read(latest)
print(f'soundfile read -> shape={data.shape}, dtype={data.dtype}, sr={sr}')
print(f'Value range: min={data.min():.4f}, max={data.max():.4f}')
print(f'RMS: {np.sqrt(np.mean(data**2)):.4f}')

# Check: is data in [-1, 1] float range (correct) or clipped?
if data.max() > 1.0 or data.min() < -1.0:
    print('WARNING: Data out of [-1,1] range - clipping issue!')
elif data.max() < 0.001 and data.min() > -0.001:
    print('WARNING: Data is near zero - silent!')
else:
    print('OK: Audio amplitude looks correct for playback')

# Now simulate what server.py does: wav[0].cpu().numpy().T
# wav shape from MusicGen: (1, 1, N) for mono
# wav[0] -> shape (1, N) for mono
# wav[0].numpy().T -> shape (N, 1) for mono

# This is the key question: does soundfile write it correctly?
print('\n--- Checking write path ---')
import torch
# Read back as soundfile would have written it
print(f'Audio shape when written: {data.shape}')
print(f'For mono: soundfile expects shape (N,) or (N,1)')
if len(data.shape) == 1:
    print('Shape is (N,) - CORRECT for mono')
elif len(data.shape) == 2 and data.shape[1] == 1:
    print('Shape is (N,1) - correct for mono')
elif len(data.shape) == 2 and data.shape[0] == 1:
    print('Shape is (1,N) - WRONG orientation! This would cause issues')

# Check if the WAV is playable by browser (needs PCM16 typically)
with wave.open(latest, 'rb') as w:
    print(f'\nWAV header: sr={w.getframerate()}, channels={w.getnchannels()}, sampwidth={w.getsampwidth()}, frames={w.getnframes()}')
    print(f'Duration: {w.getnframes()/w.getframerate():.2f}s')
