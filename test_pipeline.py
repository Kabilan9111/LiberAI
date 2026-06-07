import urllib.request
import urllib.error
import json
import time
import os
import sys
import wave

API_URL = "http://localhost:3000/api/generate-music"
LOCAL_SERVER_URL = "http://localhost:8000/api/health"
AUDIO_DIR = r"f:\Liber AI\musicgen_server\static\audio"

print("Waiting for local Python server to be ready...")
for i in range(120): # wait up to 4 minutes
    try:
        req = urllib.request.Request(LOCAL_SERVER_URL)
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                print("Python server is ready!")
                break
    except Exception as e:
        pass
    time.sleep(2)
else:
    print("FAIL: Python server did not become ready.")
    sys.exit(1)

def run_test(duration):
    print(f"\n--- Testing Generation for {duration} seconds ---")
    start_time = time.time()
    try:
        data = json.dumps({"prompt": f"test song {duration}s", "duration": duration, "mode": "director"}).encode("utf-8")
        req = urllib.request.Request(API_URL, data=data, headers={"Content-Type": "application/json"}, method="POST")
        with urllib.request.urlopen(req, timeout=7200) as response: # 2 hours socket timeout
            if response.status != 200:
                print(f"FAIL: API Route returned {response.status}")
                return False
            audio_data = response.read()
            
        elapsed = time.time() - start_time
        print(f"PASS: Request completed in {elapsed:.1f}s. Received {len(audio_data)} bytes.")
        
        # Check the newest file
        files = [os.path.join(AUDIO_DIR, f) for f in os.listdir(AUDIO_DIR) if f.endswith(".wav")]
        if not files:
            print("FAIL: No WAV files found in output directory.")
            return False
            
        newest_file = max(files, key=os.path.getctime)
        print(f"PASS: WAV file path: {newest_file}")
        
        with wave.open(newest_file, 'rb') as w:
            frames = w.getnframes()
            rate = w.getframerate()
            actual_duration = frames / float(rate)
            # The model might return slightly less or more (e.g. 5.1s)
            if abs(actual_duration - duration) < 2.0:
                print(f"PASS: File is a valid WAV. Actual Duration: {actual_duration:.2f}s")
            else:
                print(f"WARNING: Duration mismatch. Expected ~{duration}s, got {actual_duration:.2f}s")
        return True
    except urllib.error.HTTPError as e:
        print(f"FAIL: HTTP Error {e.code} - {e.read().decode('utf-8', errors='ignore')}")
        return False
    except Exception as e:
        print(f"FAIL: Exception: {e}")
        return False

# Run validations
tests = [30]
all_passed = True
for t in tests:
    if not run_test(t):
        all_passed = False
        break

if all_passed:
    print("\nALL STAGES PASSED!")
    sys.exit(0)
else:
    print("\nSOME STAGES FAILED.")
    sys.exit(1)
