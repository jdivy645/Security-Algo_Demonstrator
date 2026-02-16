from flask import Flask, jsonify, request

from algorithms import (
    run_caesar,
    run_diffie_hellman,
    run_dss,
    run_hill,
    run_md5,
    run_playfair,
    run_rail_fence,
    run_rsa,
    run_sha1,
    run_toy_des,
    run_vigenere,
)

app = Flask(__name__)

ALGO_MAP = {
    "caesar": run_caesar,
    "vigenere": run_vigenere,
    "playfair": run_playfair,
    "hill": run_hill,
    "rail": run_rail_fence,
    "des": run_toy_des,
    "rsa": run_rsa,
    "dh": run_diffie_hellman,
    "md5": run_md5,
    "sha1": run_sha1,
    "dss": run_dss,
}


@app.post("/api/run/<algo_id>")
def run_algorithm(algo_id):
    runner = ALGO_MAP.get(algo_id)
    if not runner:
        return jsonify({"error": "Unknown algorithm."}), 404
    payload = request.get_json(silent=True) or {}
    result = runner(payload)
    return jsonify(result)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
