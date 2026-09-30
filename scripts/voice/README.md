# Ozho's voice: generating the lesson-video audio

This makes Ozho's voice for all 120 lesson videos (38 Reading & Writing, 82 Math)
(`lib/lessonVideos`). It runs locally and for free with
[Chatterbox](https://github.com/resemble-ai/chatterbox) (MIT). Every
sentence gets several takes, and the best one is kept based on three
automated checks:

- **Enunciation:** faster-whisper transcribes the take, and every word
  must come back clearly.
- **Cadence:** a pause of the right length at every comma, colon,
  semicolon and dash.
- **Tonality:** a Praat pitch track checks that questions rise and
  statements settle.

The finished tracks are published into `public/lesson-audio/` and
`lib/lessonVideos/audio.json`. The player then syncs the animation to the
voice.

Everything needed is in this folder:

| File | What it is |
| --- | --- |
| `ozho_voice.py` | The generator |
| `publish.py` | Copies finished tracks into the app |
| `lines.json` | Every spoken line of all 120 videos, exported from the scripts |
| `refs/michael.wav` | Michael, the chosen reference voice |
| `refs/onyx.wav` | Onyx, the alternative |

If the scripts change, re-export `lines.json` (see "Changing a script" below).

## Running it on a Windows PC with an NVIDIA GPU (e.g. RTX 2060)

For a Claude Code session on that PC: follow these steps in order, in
PowerShell, from the repo root. Don't touch `.env` or the database; this
job never needs them.

1. **Prerequisites.**
   - An NVIDIA driver recent enough for CUDA 12. Check with `nvidia-smi`.
   - Python 3.11 (`winget install Python.Python.3.11`).
   - Git.
   - ffmpeg (`winget install Gyan.FFmpeg`). Open a new shell afterwards so it's on PATH.

2. **Create a virtual environment** outside the repo:
   ```powershell
   py -3.11 -m venv $HOME\oakmont-voice
   $py = "$HOME\oakmont-voice\Scripts\python.exe"
   ```

3. **Install PyTorch with CUDA *first*.** Chatterbox pins torch 2.6.0, and
   installing it first stops pip from pulling the CPU-only build.
   ```powershell
   & $py -m pip install --upgrade pip
   & $py -m pip install torch==2.6.0 torchaudio==2.6.0 --index-url https://download.pytorch.org/whl/cu124
   ```

4. **Install the voice and the listeners.** `setuptools<81` is required
   because Chatterbox's watermark module imports `pkg_resources`.
   ```powershell
   & $py -m pip install chatterbox-tts==0.1.7 faster-whisper==1.2.1 praat-parselmouth==0.4.7 matplotlib soundfile "setuptools<81" "numpy<2"
   ```

5. **Check that the GPU is used.** This must print `True`:
   ```powershell
   & $py -c "import torch; print(torch.cuda.is_available(), torch.cuda.get_device_name(0))"
   ```

6. **Generate all 120 videos in Michael's voice.**
   - The first run downloads the Chatterbox and Whisper model weights from Hugging Face (a few GB).
   - The run resumes where it left off if it's stopped: finished lines are saved in the output folder.
   - It should print `voice model on cuda`.
   ```powershell
   & $py -u scripts/voice/ozho_voice.py --ref scripts/voice/refs/michael.wav --out scripts/voice/out/michael --takes 4
   ```

7. **Publish, then commit and push** (pushing to `main` deploys):
   ```powershell
   & $py scripts/voice/publish.py --run scripts/voice/out/michael
   git add public/lesson-audio lib/lessonVideos/audio.json
   git commit -m "Lesson videos: Ozho's voice"
   git push
   ```

`scripts/voice/out/` is git-ignored. Each video's folder there holds:

- `report.json`: scores and notes for every sentence;
- a pitch plot and a WAV for each line;
- `full.mp3`.

Read the reports for anything flagged (low `score`, `unclear:` words,
`heard:` mismatches), and regenerate a line by deleting its `NN-kind.wav`
and `NN-kind.json`, then re-running step 6.

## Changing a script

After editing anything in `lib/lessonVideos/scripts`, re-export the lines
(this needs the web app's `node_modules`) and re-run step 6. Only lines
whose text changed are re-voiced.

```
./node_modules/.bin/tsc -p scripts/tsconfig.lessonvideos.json
node /tmp/lvcheck/scripts/check-lesson-videos.js
node /tmp/lvcheck/scripts/export-lesson-video-lines.js > scripts/voice/lines.json
```

`publish.py` never publishes a track whose lines don't match the current
scripts word for word.
