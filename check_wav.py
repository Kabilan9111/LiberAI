import wave, os, struct, math

audio_dir = r'f:\Liber AI\musicgen_server\static\audio'
files = sorted([f for f in os.listdir(audio_dir) if f.endswith('.wav')], key=lambda f: os.path.getctime(os.path.join(audio_dir, f)), reverse=True)
print(f'Total WAV files: {len(files)}')

for fname in files[:3]:
    path = os.path.join(audio_dir, fname)
    with wave.open(path, 'rb') as w:
        sr = w.getframerate()
        nch = w.getnchannels()
        frames = w.getnframes()
        dur = frames / sr
        sampwidth = w.getsampwidth()
        raw = w.readframes(frames)

    fmt = '<' + ('h' if sampwidth == 2 else 'b') * (len(raw) // sampwidth)
    samples = struct.unpack(fmt, raw)
    max_amp = max(abs(s) for s in samples)
    rms = math.sqrt(sum(s*s for s in samples) / len(samples))
    zeros = sum(1 for s in samples if s == 0)
    max_possible = 2**(sampwidth*8-1)-1

    verdict = "SILENT" if max_amp < 100 else "HAS SOUND"
    print(f'\n--- {fname} ---')
    print(f'  Sample Rate: {sr} Hz, Channels: {nch}, Duration: {dur:.2f}s, SampWidth: {sampwidth}')
    print(f'  Max Amplitude: {max_amp} / {max_possible}')
    print(f'  RMS: {rms:.2f}')
    print(f'  Zero samples: {zeros}/{len(samples)} ({100*zeros/len(samples):.1f}%)')
    print(f'  VERDICT: {verdict}')
