import hashlib
import re

ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"


def to_clean_alpha(value):
    return re.sub(r"[^A-Z]", "", (value or "").upper())


def mod(n, m):
    return ((n % m) + m) % m


def char_index(ch):
    return ALPHA.index(ch)


def chunk_pairs(text):
    return [text[i : i + 2] for i in range(0, len(text), 2)]


def get_playfair_matrix(key):
    cleaned = to_clean_alpha(key).replace("J", "I")
    seen = set()
    letters = []
    for ch in cleaned:
        if ch not in seen:
            seen.add(ch)
            letters.append(ch)
    for ch in ALPHA:
        if ch == "J":
            continue
        if ch not in seen:
            seen.add(ch)
            letters.append(ch)
    matrix = []
    for i in range(5):
        matrix.append(letters[i * 5 : i * 5 + 5])
    return matrix


def find_in_matrix(matrix, ch):
    for r in range(5):
        for c in range(5):
            if matrix[r][c] == ch:
                return {"r": r, "c": c}
    return {"r": -1, "c": -1}


def prepare_playfair_text(text):
    cleaned = to_clean_alpha(text).replace("J", "I")
    result = []
    i = 0
    while i < len(cleaned):
        a = cleaned[i]
        b = cleaned[i + 1] if i + 1 < len(cleaned) else ""
        if not b or a == b:
            result.extend([a, "X"])
        else:
            result.extend([a, b])
            i += 1
        i += 1
    if len(result) % 2 != 0:
        result.append("X")
    return "".join(result)


def to_matrix_2x2(value):
    if value is None:
        return None
    if isinstance(value, list):
        parts = value
    else:
        parts = [p for p in re.split(r"[\s,]+", str(value)) if p.strip()]
    if len(parts) != 4:
        return None
    numbers = []
    for part in parts:
        try:
            numbers.append(int(part))
        except (TypeError, ValueError):
            return None
    return [mod(n, 26) for n in numbers]


def det_2x2(m):
    return mod(m[0] * m[3] - m[1] * m[2], 26)


def mod_inverse_number(a, m):
    a = mod(a, m)
    for x in range(1, m):
        if mod(a * x, m) == 1:
            return x
    return None


def invert_2x2(m):
    det = det_2x2(m)
    inv_det = mod_inverse_number(det, 26)
    if inv_det is None:
        return None
    inv = [m[3], -m[1], -m[2], m[0]]
    inv = [mod(v * inv_det, 26) for v in inv]
    return {"inv": inv, "det": det, "inv_det": inv_det}


def to_int(value):
    if value is None:
        return None
    if isinstance(value, bool):
        return int(value)
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(value) if value.is_integer() else None
    if isinstance(value, str):
        if value.strip() == "":
            return None
        try:
            return int(value)
        except ValueError:
            return None
    return None


def gcd_int(a, b):
    x, y = abs(a), abs(b)
    while y != 0:
        x, y = y, x % y
    return x


def mod_pow(base, exp, mod_value):
    return pow(base, exp, mod_value)


def egcd(a, b):
    if b == 0:
        return {"g": a, "x": 1, "y": 0}
    next_val = egcd(b, a % b)
    return {
        "g": next_val["g"],
        "x": next_val["y"],
        "y": next_val["x"] - (a // b) * next_val["y"],
    }


def mod_inverse_int(a, m):
    result = egcd(a, m)
    g = result["g"]
    if g not in (1, -1):
        return None
    return (result["x"] % m + m) % m


def is_prime_small(n):
    if n < 2:
        return False
    if n % 2 == 0:
        return n == 2
    i = 3
    while i * i <= n:
        if n % i == 0:
            return False
        i += 2
    return True


def md5_digest(message):
    return hashlib.md5(message.encode("utf-8")).hexdigest()


def sha1_digest(message):
    return hashlib.sha1(message.encode("utf-8")).hexdigest()


def run_caesar(payload):
    cleaned = to_clean_alpha(payload.get("text"))
    shift = to_int(payload.get("shift")) or 0
    step = mod(26 - mod(shift, 26), 26) if payload.get("mode") == "decrypt" else mod(shift, 26)
    out = "".join(ALPHA[mod(char_index(ch) + step, 26)] for ch in cleaned)
    return {
        "output": out,
        "steps": [
            f"Normalized text: {cleaned or '(empty)'}",
            f"Shift applied: {step}",
            f"Result: {out or '(empty)'}",
        ],
    }


def run_vigenere(payload):
    cleaned = to_clean_alpha(payload.get("text"))
    cleaned_key = to_clean_alpha(payload.get("key"))
    if not cleaned_key:
        return {"error": "Key is required for Vigenere."}
    out = []
    key_stream = []
    for i, ch in enumerate(cleaned):
        k = cleaned_key[i % len(cleaned_key)]
        shift = char_index(k)
        step = mod(26 - shift, 26) if payload.get("mode") == "decrypt" else shift
        key_stream.append(k)
        out.append(ALPHA[mod(char_index(ch) + step, 26)])
    output = "".join(out)
    return {
        "output": output,
        "steps": [
            f"Normalized text: {cleaned or '(empty)'}",
            f"Key stream: {''.join(key_stream) or '(empty)'}",
            f"Result: {output or '(empty)'}",
        ],
    }


def run_playfair(payload):
    key = payload.get("key")
    if not key:
        return {"error": "Key is required for Playfair."}
    matrix = get_playfair_matrix(key)
    if payload.get("mode") == "decrypt":
        prepared = to_clean_alpha(payload.get("text")).replace("J", "I")
    else:
        prepared = prepare_playfair_text(payload.get("text"))
    pairs = chunk_pairs(prepared)
    output = []
    for pair in pairs:
        a, b = pair[0], pair[1]
        pos_a = find_in_matrix(matrix, a)
        pos_b = find_in_matrix(matrix, b)
        if pos_a["r"] == pos_b["r"]:
            shift = -1 if payload.get("mode") == "decrypt" else 1
            output.append(
                matrix[pos_a["r"]][mod(pos_a["c"] + shift, 5)]
                + matrix[pos_b["r"]][mod(pos_b["c"] + shift, 5)]
            )
        elif pos_a["c"] == pos_b["c"]:
            shift = -1 if payload.get("mode") == "decrypt" else 1
            output.append(
                matrix[mod(pos_a["r"] + shift, 5)][pos_a["c"]]
                + matrix[mod(pos_b["r"] + shift, 5)][pos_b["c"]]
            )
        else:
            output.append(matrix[pos_a["r"]][pos_b["c"]] + matrix[pos_b["r"]][pos_a["c"]])
    output_text = "".join(output)
    return {
        "output": output_text,
        "steps": [
            f"Prepared text: {prepared or '(empty)'}",
            f"Matrix: {' | '.join(' '.join(row) for row in matrix)}",
            f"Pairs: {' '.join(pairs) or '(empty)'}",
            f"Result: {output_text or '(empty)'}",
        ],
    }


def run_hill(payload):
    key_matrix = to_matrix_2x2(payload.get("matrix"))
    if not key_matrix:
        return {"error": "Key matrix must have 4 numbers."}
    cleaned = to_clean_alpha(payload.get("text"))
    if not cleaned:
        return {"error": "Text is required."}
    pairs = chunk_pairs(cleaned if len(cleaned) % 2 == 0 else f"{cleaned}X")
    used_matrix = key_matrix
    inverse_note = "Using key matrix for encryption."
    if payload.get("mode") == "decrypt":
        inv = invert_2x2(key_matrix)
        if not inv:
            return {"error": "Key matrix is not invertible mod 26."}
        used_matrix = inv["inv"]
        inverse_note = f"Determinant: {inv['det']}, inverse det: {inv['inv_det']}"
    output = []
    for pair in pairs:
        v0 = char_index(pair[0])
        v1 = char_index(pair[1])
        x0 = mod(used_matrix[0] * v0 + used_matrix[1] * v1, 26)
        x1 = mod(used_matrix[2] * v0 + used_matrix[3] * v1, 26)
        output.append(ALPHA[x0] + ALPHA[x1])
    output_text = "".join(output)
    return {
        "output": output_text,
        "steps": [
            f"Prepared text: {' '.join(pairs)}",
            f"Matrix used: {', '.join(str(n) for n in used_matrix)}",
            inverse_note,
            f"Result: {output_text}",
        ],
    }


def rail_fence_encrypt(text, rails):
    rail = [[] for _ in range(rails)]
    row = 0
    direction = 1
    for ch in text:
        rail[row].append(ch)
        row += direction
        if row == 0 or row == rails - 1:
            direction *= -1
    return "".join("".join(r) for r in rail)


def rail_fence_decrypt(text, rails):
    pattern = []
    row = 0
    direction = 1
    for _ in range(len(text)):
        pattern.append(row)
        row += direction
        if row == 0 or row == rails - 1:
            direction *= -1
    rail_lengths = [0] * rails
    for r in pattern:
        rail_lengths[r] += 1
    rails_arr = [[] for _ in range(rails)]
    idx = 0
    for r in range(rails):
        rails_arr[r] = list(text[idx : idx + rail_lengths[r]])
        idx += rail_lengths[r]
    result = []
    rail_pos = [0] * rails
    for r in pattern:
        result.append(rails_arr[r][rail_pos[r]])
        rail_pos[r] += 1
    return "".join(result)


def columnar_encrypt(text, key):
    cleaned = to_clean_alpha(text)
    key_clean = to_clean_alpha(key)
    cols = len(key_clean)
    if not cols:
        return None
    rows = (len(cleaned) + cols - 1) // cols
    grid = [["X" for _ in range(cols)] for _ in range(rows)]
    idx = 0
    for r in range(rows):
        for c in range(cols):
            if idx < len(cleaned):
                grid[r][c] = cleaned[idx]
            idx += 1
    order = sorted(
        [{"ch": ch, "i": i} for i, ch in enumerate(key_clean)],
        key=lambda item: (item["ch"], item["i"]),
    )
    out = ""
    for col in order:
        for r in range(rows):
            out += grid[r][col["i"]]
    return {"out": out, "grid": grid, "order": order}


def columnar_decrypt(text, key):
    cleaned = to_clean_alpha(text)
    key_clean = to_clean_alpha(key)
    cols = len(key_clean)
    if not cols:
        return None
    rows = (len(cleaned) + cols - 1) // cols
    order = sorted(
        [{"ch": ch, "i": i} for i, ch in enumerate(key_clean)],
        key=lambda item: (item["ch"], item["i"]),
    )
    grid = [["X" for _ in range(cols)] for _ in range(rows)]
    idx = 0
    for col in order:
        for r in range(rows):
            grid[r][col["i"]] = cleaned[idx] if idx < len(cleaned) else "X"
            idx += 1
    out = ""
    for r in range(rows):
        for c in range(cols):
            out += grid[r][c]
    return {"out": out, "grid": grid, "order": order}


def run_rail_fence(payload):
    if payload.get("variant") == "columnar":
        result = (
            columnar_decrypt(payload.get("text"), payload.get("key"))
            if payload.get("mode") == "decrypt"
            else columnar_encrypt(payload.get("text"), payload.get("key"))
        )
        if not result:
            return {"error": "Key is required for columnar transposition."}
        return {
            "output": result["out"],
            "steps": [
                f"Grid: {' | '.join(' '.join(row) for row in result['grid'])}",
                f"Order: {''.join(o['ch'] for o in result['order'])}",
                f"Result: {result['out']}",
            ],
        }

    cleaned = to_clean_alpha(payload.get("text"))
    rail_count = to_int(payload.get("rails")) or 0
    if rail_count < 2:
        return {"error": "Rails must be 2 or more."}
    output = (
        rail_fence_decrypt(cleaned, rail_count)
        if payload.get("mode") == "decrypt"
        else rail_fence_encrypt(cleaned, rail_count)
    )
    return {
        "output": output,
        "steps": [
            f"Normalized text: {cleaned or '(empty)'}",
            f"Rails: {rail_count}",
            f"Result: {output or '(empty)'}",
        ],
    }


def run_toy_des(payload):
    plain = to_int(payload.get("plaintext"))
    key = to_int(payload.get("key"))
    rounds = to_int(payload.get("rounds"))
    if plain is None or key is None or rounds is None:
        return {"error": "Plaintext, key, and rounds must be numbers."}
    if plain < 0 or plain > 255 or key < 0 or key > 255:
        return {"error": "Plaintext and key must be in 0..255 for the toy demo."}
    if rounds < 1 or rounds > 6:
        return {"error": "Rounds must be between 1 and 6."}

    left = (plain >> 4) & 0x0F
    right = plain & 0x0F
    round_keys = [(key >> i) & 0x0F for i in range(rounds)]
    if payload.get("mode") == "decrypt":
        round_keys.reverse()

    steps = [
        f"Start L={left:04b}, R={right:04b}",
    ]

    for i in range(rounds):
        f_val = ((right ^ round_keys[i]) + ((right << 1) & 0x0F)) & 0x0F
        new_left = right
        new_right = left ^ f_val
        steps.append(
            f"Round {i + 1}: k={round_keys[i]:04b} f={f_val:04b} -> L={new_left:04b} R={new_right:04b}"
        )
        left, right = new_left, new_right

    out = ((right << 4) | left) & 0xFF
    steps.append(f"Output byte: {out}")

    return {"output": str(out), "steps": steps}


def run_rsa(payload):
    p = to_int(payload.get("p"))
    q = to_int(payload.get("q"))
    e = to_int(payload.get("e"))
    message = to_int(payload.get("message"))
    if None in (p, q, e, message):
        return {"error": "All inputs are required."}

    n = p * q
    phi = (p - 1) * (q - 1)
    if not is_prime_small(p) or not is_prime_small(q):
        return {"error": "p and q should be prime (small demo values)."}
    if gcd_int(e, phi) != 1:
        return {"error": "e must be coprime to phi."}
    d = mod_inverse_int(e, phi)
    if d is None:
        return {"error": "Could not compute modular inverse for e."}
    c = mod_pow(message, e, n)
    m2 = mod_pow(c, d, n)

    return {
        "output": f"Cipher: {c} | Decrypted: {m2}",
        "steps": [
            f"n = {n}",
            f"phi = {phi}",
            f"d = {d}",
            f"Ciphertext c = m^e mod n = {c}",
            f"Decrypted m = c^d mod n = {m2}",
        ],
    }


def run_diffie_hellman(payload):
    p = to_int(payload.get("p"))
    g = to_int(payload.get("g"))
    a = to_int(payload.get("a"))
    b = to_int(payload.get("b"))
    if None in (p, g, a, b):
        return {"error": "All inputs are required."}

    pub_a = mod_pow(g, a, p)
    pub_b = mod_pow(g, b, p)
    shared_a = mod_pow(pub_b, a, p)
    shared_b = mod_pow(pub_a, b, p)

    return {
        "output": f"Shared key: {shared_a}",
        "steps": [
            f"Public A = g^a mod p = {pub_a}",
            f"Public B = g^b mod p = {pub_b}",
            f"Shared from A = {shared_a}",
            f"Shared from B = {shared_b}",
        ],
    }


def run_md5(payload):
    text = payload.get("text") or ""
    digest = md5_digest(text)
    return {
        "output": digest,
        "steps": [
            f"Message length: {len(text)} chars",
            f"Digest: {digest}",
        ],
    }


def run_sha1(payload):
    text = payload.get("text") or ""
    digest = sha1_digest(text)
    return {
        "output": digest,
        "steps": [
            f"Message length: {len(text)} chars",
            f"Digest: {digest}",
        ],
    }


def run_dss(payload):
    p = to_int(payload.get("p"))
    q = to_int(payload.get("q"))
    g = to_int(payload.get("g"))
    x = to_int(payload.get("x"))
    k = to_int(payload.get("k"))
    if None in (p, q, g, x, k):
        return {"error": "All inputs are required."}

    y = mod_pow(g, x, p)
    r = mod_pow(g, k, p) % q
    if r == 0:
        return {"error": "r became 0, choose different k."}
    k_inv = mod_inverse_int(k, q)
    if k_inv is None:
        return {"error": "k must be invertible mod q."}
    h = int(sha1_digest(payload.get("message") or ""), 16)
    s = (k_inv * (h + x * r)) % q
    if s == 0:
        return {"error": "s became 0, choose different k."}

    w = mod_inverse_int(s, q)
    u1 = (h * w) % q
    u2 = (r * w) % q
    v = ((mod_pow(g, u1, p) * mod_pow(y, u2, p)) % p) % q

    return {
        "output": f"Signature (r, s): ({r}, {s}) | Verify: {'valid' if v == r else 'invalid'}",
        "steps": [
            f"Public key y = g^x mod p = {y}",
            f"Hash h = SHA-1(m) = {h}",
            f"r = (g^k mod p) mod q = {r}",
            f"s = k^-1 (h + x*r) mod q = {s}",
            f"Verify v = {v}",
        ],
    }
