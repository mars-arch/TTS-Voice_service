# api_server.py

import os
import tempfile
import torch
import soundfile as sf
from flask import Flask, request, jsonify, send_file
from cached_path import cached_path

# --- Adapted from infer_gradio.py ---
from f5_tts.infer.utils_infer import (
    infer_process,
    load_model,
    load_vocoder,
    preprocess_ref_audio_text,
)
from f5_tts.model import DiT

# --- Global variables for models ---
vocoder = None
ema_model = None

def load_f5tts():
    # Using default F5-TTS v1 model
    hf_path = "hf://SWivid/F5-TTS/F5TTS_v1_Base/model_1250000.safetensors"
    ckpt_path = str(cached_path(hf_path))
    model_cfg = dict(dim=1024, depth=22, heads=16, ff_mult=2, text_dim=512, conv_layers=4)
    return load_model(DiT, model_cfg, ckpt_path)

# --- Flask App Initialization ---
app = Flask(__name__)

@app.route('/synthesize', methods=['POST'])
def synthesize():
    if 'reference_audio' not in request.files or 'text' not in request.form:
        return jsonify({'error': 'Missing reference_audio or text'}), 400

    ref_audio_file = request.files['reference_audio']
    text_to_generate = request.form['text']
    ref_text = request.form.get('reference_text', '') # Optional reference text

    # Save the reference audio to a temporary file
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_ref_audio:
        ref_audio_file.save(temp_ref_audio.name)

    try:
        # Preprocess the reference audio
        ref_audio, ref_text = preprocess_ref_audio_text(temp_ref_audio.name, ref_text)

        # Set a default seed
        torch.manual_seed(42)

        # Perform inference
        final_wave, final_sample_rate, _ = infer_process(
            ref_audio,
            ref_text,
            text_to_generate,
            ema_model,
            vocoder,
            nfe_step=32,
            speed=1,
        )

        # Save the generated audio to a temporary file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_gen_audio:
            sf.write(temp_gen_audio.name, final_wave, final_sample_rate)

        # Return the generated audio file
        return send_file(
            temp_gen_audio.name,
            mimetype='audio/wav',
            as_attachment=True,
            download_name='generated_audio.wav'
        )

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        # Clean up temporary files
        os.remove(temp_ref_audio.name)
        if 'temp_gen_audio' in locals() and os.path.exists(temp_gen_audio.name):
            os.remove(temp_gen_audio.name)

def main():
    global vocoder, ema_model
    print("Loading models, this may take a moment...")
    vocoder = load_vocoder()
    ema_model = load_f5tts()
    print("Models loaded. Starting Flask server.")
    
    # To run on a public port on RunPod, use host='0.0.0.0'
    app.run(host='0.0.0.0', port=8080, debug=False)

if __name__ == '__main__':
    main()
