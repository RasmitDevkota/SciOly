import warnings
warnings.filterwarnings("ignore")

from pyscript import document

# import sympy
import json
import re
import random

def header(n, name):
    return {
        "timed": 0,
        "count": n,
        "questions": list(range(1, n + 1)),
        "title": name + "",
        "useCustomHeader": False,
        "customHeader": "",
        "testtype": "cstate",
    }

def genRandKAlphabet(k, xeno):
    A = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
        'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
    ] if xeno else [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
        'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
    ]

    A_filtered = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
        'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
    ] if xeno else [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
        'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
    ]

    keyword_raw = getRandWord(4, 9).upper()
    keyword = ""
    keyword_nums = []

    sizeA = len(A)

    key = [""] * sizeA

    for let in keyword_raw:
        if let not in keyword:
            keyword += let
            keyword_nums.append(A.index(let))

            if let in A_filtered:
                A_filtered.remove(let)

    key_at_front = (k == 3)

    pos_start = 0 if key_at_front else random.randint(0, sizeA - len(keyword))
    pos_end = pos_start + len(keyword)

    for k in range(len(keyword)):
        key[pos_start + k] = keyword[k]

    for l in range(len(A_filtered)):
        key[(pos_end + l) % sizeA] = A_filtered[l]

    if not key_at_front:
        for m in range(sizeA):
            if key[m] == A[m]:
                return genRandKAlphabet(key_at_front, xeno)

    return key, keyword_raw


def keyStringRandom(xeno, k=0):
    spl = lambda word: [char for char in word]
    if xeno:
        A = spl("ABCDEFGHIJKLMNÑOPQRSTUVWXYZ")
    else:
        A = spl("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    if k == 0:
        if xeno:
            while not test2(A):
                random.shuffle(A)
        else:
            while not test1(A):
                random.shuffle(A)

        keyword = ""
    else:
        A, keyword = genRandKAlphabet(k, xeno)
    return "".join(A), keyword


def test1(l):
    for i in range(26):
        if ord(l[i]) - 65 == i:
            return False
    return True


def test2(l):
    s = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ"
    for i in range(27):
        if l[i] == s[i]:
            return False
    return True


def genRandMono(num, quote, pat, errors, hint, k=0):
    alphabet_regular = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

    if k == 1:
        plaintext_alphabet, _ = keyStringRandom(False, k)
        ciphertext_alphabet = alphabet_regular
    elif k == 2:
        plaintext_alphabet = alphabet_regular
        ciphertext_alphabet, _ = keyStringRandom(False, k)
    elif k == 3:
        ciphertext_alphabet, keyword_raw = keyStringRandom(False, k)
        keyword = "".join(set(keyword_raw))
        offset = -random.randint(1, 26 - len(keyword))
        plaintext_alphabet = ciphertext_alphabet[
            offset:] + ciphertext_alphabet[:offset]
    else:
        plaintext_alphabet = alphabet_regular
        ciphertext_alphabet, _ = keyStringRandom(False, k)

    r = {}
    for i in range(26):
        r[plaintext_alphabet[i]] = ciphertext_alphabet[i]

    x = {
        "cipherString": quote,
        "encodeType": "random",
        "offset": 1,
        "shift": 1,
        "offset2": 1,
        "keyword": "",
        "keyword2": "",
        "alphabetSource": plaintext_alphabet,
        "alphabetDest": ciphertext_alphabet,
        "curlang": "en",
        "replacement": r,
        "editEntry": str(num),
    }

    if pat == "1":
        x["cipherType"] = "patristocrat"
        x["question"] = "<p>Solve this patristocrat.</p>"
        x["points"] = 600
    else:
        x["cipherType"] = "aristocrat"
        x["question"] = "<p>Solve this aristocrat.</p>"
        x["points"] = 250

    if k != 0:
        x["question"] = (x["question"][:-5] +
                         " which has been encoded with a K" + str(k) +
                         " alphabet.</p>")
        x["points"] = x["points"] - 100

    if errors:
        error_bank = {
            r" I ": " eye ",
            r" the ": " teh ",
            r" and ": " end ",
            r" we ": " wii ",
            r" their ": " there ",
            r" there ": " their ",
            r" no ": " know ",
            r"(?=[a-zA-Z]+)able ": "ible ",
            r"able ": "abel"
        }

        for original, error in error_bank.items():
            if int(random.random() * 10) == int(random.random() * 10):
                quote = re.sub(original, error, quote)

        x["cipherString"] = quote

    if hint == "0":
        x["question"] = (x["question"][:-4] + " The first word is " +
                         quote.split(" ")[0] + ".</p>")
        if pat == "1":
            x["points"] = x["points"] - 30 * len(quote.split(" ")[0])
        else:
            x["points"] = x["points"] - 10 * len(quote.split(" ")[0])
    elif hint == "1":
        letter = random.randint(97, 122)

        while r[chr(letter - 32)] not in quote.upper():
            letter = random.randint(97, 122)

        m = ciphertext_alphabet[letter - 97]

        x["question"] = (x["question"][:-4] + " The letter " +
                         chr(letter).upper() + " maps to " + m + ".</p>")

        if pat == "1":
            x["points"] = x["points"] - 15 * quote.count(chr(letter))
        else:
            x["points"] = x["points"] - 5 * quote.count(chr(letter))

    return x


def genRandXeno(num, quote, hint, k=0):
    key, _ = keyStringRandom(True, k)
    quote = genSpanishQuote(70, 160)
    r = {}
    for i in range(0, 14):
        r[chr(i + 65)] = key[i]
    r["Ñ"] = key[14]
    for i in range(14, 26):
        r[chr(i + 65)] = key[i + 1]
    x = {
        "cipherString": quote,
        "encodeType": "random",
        "offset": 1,
        "shift": 1,
        "offset2": 1,
        "keyword": "",
        "keyword2": "",
        "alphabetSource": "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ",
        "alphabetDest": key,
        "curlang": "es",
        "replacement": r,
        "editEntry": str(num),
        "cipherType": "aristocrat",
        "question": "<p>Solve this xenocrypt.</p>",
        "points": 400,
    }
    if k != 0:
        x["question"] = (x["question"][:-5] +
                         " which has been encoded with a K" + str(k) +
                         " alphabet.</p>")
        x["points"] = x["points"] - 100
    if hint == "0":
        x["question"] = (x["question"][:-4] + " The first word is " +
                         quote.split(" ")[0] + ".</p>")
        x["points"] = x["points"] - 10 * len(quote.split(" ")[0])
    if hint == "1":
        letter = random.randint(0, 25)
        while list(r.keys())[letter] not in quote.upper():
            letter = random.randint(0, 25)
        m = key[letter]
        x["question"] = (x["question"][:-4] + " The letter " +
                         chr(letter).upper() + " maps to " + m + ".</p>")
        x["points"] = x["points"] - 5 * quote.count(chr(letter))
    return x


def genRandAffine(num, quote, enc):
    a = random.choice([3, 5, 7, 9, 11, 15, 17, 19, 21, 23])
    b = random.randint(3, 24)
    r = {}
    for i in range(0, 26):
        r[str(i + 65)] = chr((i * a + b) % 26 + 65)
    x = {
        "a": a,
        "b": b,
        "cipherString": quote,
        "cipherType": "affine",
        "solclick1": -1,
        "solclick2": -1,
        "replacement": r,
        "curlang": "en",
        "editEntry": num,
    }
    if enc == "E":
        x["operation"] = "encode"
        x["points"] = 175
        x["question"] = (
            "<p>Encode this sentence with the Affine cipher. (a,b)=(" +
            str(a) + "," + str(b) + ").</p>")
    elif enc == "D":
        x["operation"] = "decode"
        x["points"] = 150
        x["question"] = (
            "<p>Decode this sentence which has been encoded with an Affine cipher. (a,b)=("
            + str(a) + "," + str(b) + ").</p>")
    elif enc == "C":
        one = random.randint(0, 12)
        two = random.randint(13, 25)
        onemap = (one * a + b) % 26
        twomap = (two * a + b) % 26
        x["operation"] = "crypt"
        x["points"] = 200
        x["question"] = (
            "<p>Decode this sentence which has been encoded with an Affine cipher. The letters "
            + chr(onemap + 65) + " and " + chr(twomap + 65) + " map to " +
            chr(one + 65) + " and " + chr(two + 65) + ".</p>")
    return x


def genRandCaesar(num, quote, enc):
    a = random.randint(3, 24)
    r = {}
    for i in range(0, 26):
        r[str(i + 65)] = chr((i + a) % 26 + 65)
    x = {
        "offset": a,
        "offset2": None,
        "cipherString": quote,
        "cipherType": "caesar",
        "solclick1": -1,
        "solclick2": -1,
        "replacement": r,
        "curlang": "en",
        "editEntry": num,
        "shift": None,
    }
    if enc == "E":
        x["operation"] = "encode"
        x["points"] = 150
        x["question"] = (
            "<p>Encode this sentence with the Caesar cipher with offset " +
            str(a) + ".</p>")
    elif enc == "D":
        x["operation"] = "decode"
        x["points"] = 125
        x["question"] = "<p>Decode this sentence which has been encoded with an Caesar cipher.</p>"
    return x


def genRandVig(num, quote, enc):
    quote = genQuoteLength(50, 70)
    key = getRandWord(5, 8)
    x = {
        "cipherType": "vigenere",
        "keyword": key,
        "cipherString": quote,
        "findString": "",
        "blocksize": len(key),
        "curlang": "en",
        "editEntry": str(num),
    }
    if enc == "E":
        x["operation"] = "encode"
        x["question"] = (
            "<p>Encode this sentence with the Vigenere cipher using the keyword "
            + key + ".</p>")
        x["points"] = 200
    if enc == "D":
        x["operation"] = "decode"
        x["question"] = (
            "<p>Decode this sentence with the Vigenere cipher using the keyword "
            + key + ".</p>")
        x["points"] = 175
    if enc == "C":
        x["operation"] = "crypt"
        x["question"] = (
            "<p>Decode this sentence with the Vigenere cipher. The first " +
            str(len(key)) + " characters of the sentence is " +
            quote[:len(key)] + ".</p>")
        x["points"] = 175
    return x


def genRandPorta(num, quote, enc):
    quote = genQuoteLength(50, 70)
    key = getRandWord(5, 8)
    x = {
        "cipherType": "porta",
        "keyword": key,
        "cipherString": quote,
        "findString": "",
        "blocksize": len(key),
        "curlang": "en",
        "editEntry": str(num),
    }
    if enc == "E":
        x["operation"] = "encode"
        x["question"] = (
            "<p>Encode this sentence with the Porta cipher using the keyword "
            + key + ".</p>")
        x["points"] = "120"
    if enc == "D":
        x["operation"] = "decode"
        x["question"] = (
            "<p>Decode this sentence with the Porta cipher using the keyword "
            + key + ".</p>")
        x["points"] = "100"
    if enc == "C":
        x["operation"] = "crypt"
        x["question"] = (
            "<p>Decode this sentence with the Porta cipher. The first " +
            str(len(key)) + " characters of the sentence is " +
            quote[:len(key)] + ".</p>")
        x["points"] = "175"
    return x


def genRand2x2Hill(num, quote, enc):
    quote = quote.split(" ")
    q = ""
    a = 0
    while len(q) < 12:
        q += quote[a] + " "
        a += 1
    q = q[:-1]

    key = get2x2Key()
    while determinant2x2(key) == 0:
        key = get2x2Key()

    x = {
        "cipherString": q,
        "cipherType": "hill",
        "curlang": "en",
        "editEntry": num,
        "keyword": key,
    }
    if enc == "C":
        x["operation"] = "decode"
        x["points"] = 100
        x["question"] = "<p>Compute the decryption matrix of the key " + key + ".</p>"
        x["cipherString"] = ""
    else:
        x["offset"] = None
        x["alphabetSource"] = ""
        x["alphabetDest"] = ""
        x["shift"] = None
        x["offset2"] = None
    if enc == "E":
        x["operation"] = "encode"
        x["points"] = 225
        x["question"] = ("<p>Encrypt this phrase with the key " + key +
                         " using the Hill cipher.</p>")
    if enc == "D":
        x["operation"] = "decode"
        x["points"] = 175
        x["question"] = ("<p>Decrypt this phrase with the key " + key +
                         " using the Hill cipher.</p>")
    return x


def genRand3x3Hill(num, quote, enc):
    quote = quote.split(" ")
    q = ""
    a = 0
    while len(q) < 12:
        q += quote[a] + " "
        a += 1
    q = q[:-1]
    key = get3x3Key()
    x = {
        "cipherString": q,
        "cipherType": "hill",
        "curlang": "en",
        "editEntry": num,
        "keyword": key,
    }
    if enc == "E":
        x["operation"] = "encode"
        x["points"] = 225
        x["question"] = ("<p>Encrypt this phrase with the key " + key +
                         " using the Hill cipher.</p>")
    if enc == "D":
        x["operation"] = "decode"
        x["points"] = 175
        x["question"] = ("<p>Decrypt this phrase with the key " + key +
                         " using the Hill cipher.</p>")
    return x


def genRandMorbit(num, quote, enc):
    quote = genQuoteLength(35, 55)
    l = ["OO", "O-", "OX", "-O", "--", "-X", "XO", "X-", "XX"]
    l2 = list(range(1, 10))
    random.shuffle(l2)
    replacement = {}
    for i in range(9):
        replacement[l[i]] = str(l2[i])
    x = {
        "cipherString": quote,
        "cipherType": "morbit",
        "curlang": "en",
        "editEntry": str(num),
        "offset": None,
        "alphabetSource": "",
        "alphabetDest": "",
        "shift": None,
        "offset2": None,
        "replacement": replacement,
    }
    if enc == "D":
        x["operation"] = "decode"
        x["points"] = 225
        x["question"] = (
            "<p>Decode this quote which has been encoded using the Morbit cipher. OO,OX,X-,XO,XX matches to "
            + replacement["OO"] + "," + replacement["OX"] + "," +
            replacement["X-"] + "," + replacement["XO"] + "," +
            replacement["XX"] + ".</p>")
        x["hint"] = "123456"
    if enc == "C":
        x["operation"] = "crypt"
        x["points"] = 250
        x["question"] = (
            "<p>Decode this quote which has been encoded using the Morbit cipher. The first four letters decrypts to "
            + quote[:4] + ".</p>")
        x["hint"] = "123456"
    return x


def genRandPollux(num, quote, enc):
    quote = genQuoteLength(35, 55).upper()
    morse = {
        "A": ".-",
        "B": "-...",
        "C": "-.-.",
        "D": "-..",
        "E": ".",
        "F": "..-.",
        "G": "--.",
        "H": "....",
        "I": "..",
        "J": ".---",
        "K": "-.-",
        "L": ".-..",
        "M": "--",
        "N": "-.",
        "O": "---",
        "P": ".--.",
        "Q": "--.-",
        "R": ".-.",
        "S": "...",
        "T": "-",
        "U": "..-",
        "V": "...-",
        "W": ".--",
        "X": "-..-",
        "Y": "-.--",
        "Z": "--..",
        "0": "-----",
        "1": ".----",
        "2": "..---",
        "3": "...--",
        "4": "....-",
        "5": ".....",
        "6": "-....",
        "7": "--...",
        "8": "---..",
        "9": "----.",
        " ": "",
    }
    l = list(range(0, 10))
    random.shuffle(l)
    enc1 = ""
    for i in quote:
        if i in morse:
            enc1 += morse[i] + "x"
    enc1 = enc1[:-1]
    enc2 = ""
    for i in enc1:
        if i == ".":
            enc2 += str(l[random.randint(0, 3)])
        if i == "-":
            enc2 += str(l[random.randint(0, 2) + 4])
        if i == "x":
            enc2 += str(l[random.randint(0, 2) + 7])
    x = {
        "cipherString": quote,
        "cipherType": "pollux",
        "replacement": {},
        "dotchars": str(l[0]) + str(l[1]) + str(l[2]) + str(l[3]),
        "dashchars": str(l[4]) + str(l[5]) + str(l[6]),
        "xchars": str(l[7]) + str(l[8]) + str(l[9]),
        "curlang": "en",
        "editEntry": str(num),
        "offset": None,
        "alphabetSource": "",
        "alphabetDest": "",
        "shift": None,
        "offset2": None,
        "encoded": enc2,
    }
    if enc == "D":
        x["operation"] = "decode"
        x["points"] = 275
        x["question"] = (
            "<p>Decode this quote which has been encoded with a Pollux cipher. "
            + str(l[0]) + "," + str(l[1]) + "," + str(l[4]) + "," + str(l[5]) +
            "," + str(l[7]) + "," + str(l[8]) + "= . . - - x x.</p>")
    if enc == "C":
        x["operation"] = "crypt"
        x["points"] = 350
        x["crib"] = quote[:4]
        x["question"] = (
            "<p>Decode this quote which has been encoded with a Pollux cipher. The first four letters are "
            + quote[:4] + ".</p>")
    return x


def genRandFractionatedMorse(num, quote, enc):
    quote = genQuoteLength(35, 45)

    l = [
        "•••", "••–", "••×", "•–•", "•––", "•–×", "•×•", "•×–", "•××", "–••",
        "–•–", "–•×", "––•", "–––", "––×", "–×•", "–×–", "–××", "×••", "×•–",
        "×•×", "×–•", "×––", "×–×", "××•", "××–"
    ]

    l2, keyword = genRandKAlphabet(True, False)

    replacement = {}
    for i in range(26):
        replacement[l[i]] = str(l2[i])

    hint = ""
    for q in list(quote.upper()):
        if q in "ABCDEFGHIJKLMNOPQRSTUVWXYZ" and len(hint) < 4:
            hint += q

    if len(hint) < 4:
        return genRandFractionatedMorse(num, quote, enc)

    x = {
        "cipherString": quote,
        "cipherType": "fractionatedmorse",
        "replacement": replacement,
        "operation": "crypt",
        "encoded": "",
        "keyword": keyword,
        "curlang": "en",
        "points": 150,
        "question":
        f"<p>Solve this quote which has been encoded using the Fractionated Morse Cipher and a keyword. You are told that the first four letters of the plaintext are {hint}.</p>",
        "editEntry": str(num),
        "offset": None,
        "alphabetSource": "",
        "alphabetDest": "",
        "offset2": None,
        "crib": ""
    }

    return x


def genRandBacon(num, quote, mode):
    quote = genQuoteLength(30, 45)
    x = {
        "cipherString":
        quote,
        "cipherType":
        "baconian",
        "curlang":
        "en",
        "editEntry":
        str(num),
        "offset":
        1,
        "alphabetSource":
        "",
        "alphabetDest":
        "",
        "shift":
        None,
        "offset2":
        None,
        "linewidth":
        53,
        "words": [],
        "question":
        "<p>Decode this quote which has been encoded using the Baconian cipher.</p>",
    }
    if mode == "W":
        x["operation"] = "words"
        x["points"] = 450
        x["abMapping"] = random.choice([
            "ABABABABABABABABABABABABAB",
            "AAAAAAAAAAAAABBBBBBBBBBBBB",
            "BBBBBBBBBBBBBAAAAAAAAAAAAA",
        ])
        x["texta"] = "A"
        x["textb"] = "B"
        return x
    mappings = random.choice([
        ["ABC", "XYZ"],
        ["ACE", "BDF"],
        ["!@#$%", "^&*()"],
        ["!#%&(", "@$^*)"],
        ["QWERTY", "ASDFGH"],
        ["abcd", "ABCD"],
        ["{([", "}])"],
        ["aeiou", "bcdfghjklmnpqrstvwxyz"],
        ["acegikmoqsuwy", "bdfhjlnprtvxz"],
        ["abcdefghijklm", "nopqrstuvwxyz"],
        ["nopqrstuvwxyz", "abcdefghijklm"],
        ["XYZ", "ABC"],
        ["BDF", "ACE"],
        ["^&*()", "!@#$%"],
        ["@$^*)", "!#%&("],
        ["ASDFGH", "QWERTY"],
        ["ABCD", "abcd"],
        ["}])", "{(["],
        ["bcdfghjklmnpqrstvwxyz", "aeiou"],
        ["bdfhjlnprtvxz", "acegikmoqsuwy"],
        ["nopqrstuvwxyz", "abcdefghijklm"],
    ])
    a = mappings[0]
    b = mappings[1]
    x["texta"] = a
    x["textb"] = b
    if random.randint(0, 2) == 2:
        temp = getBaconWords()
        x["texta"] = a[0]
        x["textb"] = a[1]
    if mode == "L":
        x["operation"] = "let4let"
        x["points"] = 200
        x["abMapping"] = "ABABABABABABABABABABABABAB"
    if mode == "S":
        x["operation"] = "sequence"
        x["points"] = 300
        x["abMapping"] = "ABABABABABABABABABABABABAB"
    return x


def RSA(num, enc):
    # p = sympy.randprime(200, 500)
    # q = sympy.randprime(200, 500)
    # n = p * q
    # phi = (p - 1) * (q - 1)
    # e = sympy.randprime(0, n)
    # while sympy.gcd(e, phi) != 1:
    #     e = sympy.randprime(0, n)
    # d = sympy.mod_inverse(e, phi)
    # x = {
    #     "cipherString": "",
    #     "cipherType": "rsa",
    #     "curlang": "en",
    #     "editEntry": "1308",
    #     "offset": None,
    #     "alphabetSource": "",
    #     "alphabetDest": "",
    #     "shift": None,
    #     "offset2": None,
    #     "name1": "Allen",
    #     "rsa": {
    #         "p": p,
    #         "q": q,
    #         "n": n,
    #         "phi": phi,
    #         "e": e,
    #         "d": d
    #     },
    # }
    # if enc == "E":
    #     x["operation"] = "rsa2"
    #     x["digitsPrime"] = 4
    #     x["digitsCombo"] = 4
    #     x["points"] = 350
    #     x["combo"] = 1000
    #     x["question"] = ("<p>Given primes (p,q,e)=(" + str(p) + "," + str(q) +
    #                      "," + str(e) + "), compute the private key d.</p>")
    # if enc == "D":
    #     year = random.randint(1950, 2000)
    #     enc = pow(year, e, n)
    #     x["operation"] = "rsa4"
    #     x["digitsPrime"] = 4
    #     x["digitsCombo"] = 4
    #     x["points"] = 500
    #     x["year"] = year
    #     x["encrypted"] = enc
    #     x["name2"] = "Jason"
    #     x["question"] = ("<p>Given (n,c,d)=(" + str(n) + "," + str(enc) + "," +
    #                      str(d) + "), compute the original message m.</p>")
    # return x

    return genRandMono(num, genQuoteLength(75, 100), False, False, False, k=0)

def genRandRailFence(num, quote, rails, hint_type, offset):
    if (rails[0] < '2' or rails[0] > '6') and rails != "R":
        return None
    quote = genQuoteLength(75, 100)
    r = 0
    p = 0
    if rails == "R":
        r = random.randint(2, 6)
        p = 150
    else:
        r = int(rails)
        p = 100 + (r - 2) * 10
    if hint_type == "RR":
        num_above = random.randint(0, 2)
        max = r + num_above
        min = r - (2 - num_above)
        rails = f"between {min} and {max}"
    x = {
        "cipherString":
        quote,
        "cipherType":
        "railfence",
        "rails":
        r,
        "railOffset":
        random.randint(1, r * 2 - 2) if offset == "RO" else offset,
        "isRailRange":
        True,
        "replacement": {},
        "curlang":
        "en",
        "points":
        p,
        "question":
        f"<p>A quote has been encoded using the Rail Fence Cipher for you to decode. You are told that {rails} rails"
        + (f"and an unknown offset" if offset == "RO" else
           (f"and an offset of {offset}" if offset > 0 else "")) +
        " were used to encode it.</p>",
        "editEntry":
        str(num),
        "specialbonus":
        False
    }
    return x


def genRandAtbash(num, quote, enc):
    x = {
        "cipherString":
        quote,
        "cipherType":
        "atbash",
        "offset":
        1,
        "operation":
        "encode" if enc == "E" else "decode",
        "replacement": {
            "Z": "A",
            "Y": "B",
            "X": "C",
            "W": "D",
            "V": "E",
            "U": "F",
            "T": "G",
            "S": "H",
            "R": "I",
            "Q": "J",
            "P": "K",
            "O": "L",
            "N": "M",
            "M": "N",
            "L": "O",
            "K": "P",
            "J": "Q",
            "I": "R",
            "H": "S",
            "G": "T",
            "F": "U",
            "E": "V",
            "D": "W",
            "C": "X",
            "B": "Y",
            "A": "Z"
        },
        "curlang":
        "en",
        "points":
        100,
        "question":
        "<p>Encode this quote using the Atbash Cipher.</p>" if enc == "E" else
        "<p>Solve this quote which has been encoded with the Atbash Cipher.</p>",
        "editEntry":
        "1",
        "offset2":
        None,
        "alphabetSource":
        "ZYXWVUTSRQPONMLKJIHGFEDCBA",
        "alphabetDest":
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    }
    return x


def genRandNihilist(num, quote):
    nihilist_alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"

    plaintext = re.sub(r"[^a-zA-Z]", "", quote.upper().replace("J", "I"))

    key_raw = getRandWord(5, 8).replace("J", "I").upper()

    key_list = []
    for char in key_raw:
        if char not in key_list:
            key_list.append(char)
    key = "".join(key_list)

    keyword = getRandWord(5, 8).upper().replace("J", "I")

    crib_len = len(keyword) + random.randint(-1, 3)
    crib = plaintext[:crib_len]

    x = {
        "cipherType": "nihilistsub",
        "keyword": keyword,
        "cipherString": plaintext,
        "findString": "",
        "operation": "decode",
        "polybiusKey": key,
        "curlang": "en",
        "points": 250,
        "question":
        f"<p>The following quote needs to be decoded with the Nihilist Substitition Cipher with a keyword of {keyword} and polybius key of {key_raw}. You are told that the quote starts with {crib}.</p>",
        "editEntry": str(num),
        "alphabetSource": "",
        "alphabetDest": ""
    }

    return x


def genRandColumnar(num, quote, columns, hint_type, offset):
    try:
        if (int(columns) < 5 or
                int(columns) > 11) and columns != "C" and "CM" not in columns:
            columns = "C"
    except:
        print("can't decipher columns info")
        columns = "C" if "CM" not in columns else columns

    c = 0
    p = 0
    if columns == "C":
        c = random.randint(5, 11)
        p = 150
    elif "CM" in columns:
        try:
            c = random.randint(5, max(5, int(columns.split("CM")[1])))
        except:
            c = random.randint(5, 9)

        p = 125
    else:
        c = int(columns)
        p = 100 + (c - 2) * 10

    hint_text = ""
    if hint_type == "CR":
        num_above = random.randint(0, 2)
        max_c = c + num_above
        min_c = c - (2 - num_above)
        hint_text = f" You are told that between {min_c} and {max_c} columns were used to encode it."

    keyword = getRandWord(c, c).upper()

    quote = genQuoteLength(25, 100)
    while len(re.sub(r"[^a-zA-Z]", "", quote)) % len(keyword) != 0:
        quote = genQuoteLength(25, 100)

    print(c)

    crib_len = random.randint(min(c - (1 if (c < 10) else 3), 3), c + 3)
    crib_start = 0 if hint_type == "CR" else random.randint(
        0,
        len(re.sub(r'[^a-zA-Z]', "", quote)) - crib_len - 1)
    crib = re.sub(r'[^a-zA-Z]', "", quote)[crib_start:crib_start + crib_len]

    print(crib_len, len(re.sub(r'[^a-zA-Z]', "", quote)), crib_start,
          f"'{crib}'")

    if crib_start != 0:
        hint_text += f" You are told that {c} columns were used to encode it."

    x = {
        "cipherString": quote,
        "cipherType": "compcolumnar",
        "rails": c,
        "keyword": keyword,
        "railOffset": 0,
        "isRailRange": True,
        "replacement": {},
        "curlang": "en",
        "points": p,
        "question":
        f"<p>A quote has been encoded using the Complete Columnar Transposition Cipher for you to decode using the crib {crib}.{hint_text}</p>",
        "editEntry": str(num),
        "specialbonus": False
    }

    return x


def genRandCryptarithm(word_len=5):
    return
    # f = open(f"cryptarithms{word_len}.json", "r")
    # for i in range(0, random.randint(0, 3103)):
    #     f.readline()

    # word1 = f.readline().strip().upper()
    # word2 = f.readline().strip().upper()

    # alphabet = {}
    # reverse_alphabet = {}
    # for i in range(word_len):
    #     alphabet[word1[i]] = random.randint(0, 9)
    #     reverse_alphabet[random.randint(0, 9)] = word1[i]

    #     alphabet[word2[i]] = random.randint(0, 9)
    #     reverse_alphabet[random.randint(0, 9)] = word2[i]

    # print(word1, alphabet)

    # word1nums = "".join([str(alphabet[l]) for l in word1])
    # num1 = int(word1nums)
    # word2nums = "".join([str(alphabet[l]) for l in word2])
    # num2 = int(word2nums)
    # num3 = num1 + num2

    # word3 = ""
    # for j in range(0, max(len(word1), len(word2))):
    #     print(int(word1nums[j]) + int(word2nums[j]))
    #     word3 += reverse_alphabet[int(word1nums[j]) + int(word2nums[j])]

    # x = {
    #     "operation": "decode",
    #     "problem": "",
    #     "wordlist": [],
    #     "cipherString": f"{word1}+{word2}={word3}",
    #     "cipherType": "",
    #     "replacement": {},
    #     "curlang": "en",
    #     "points": 0,
    #     "question": "<p>Solve this cryptarithm.</p>",
    #     "editEntry": "31",
    #     "offset": None,
    #     "alphabetSource": "",
    #     "alphabetDest": "",
    #     "offset2": None
    # }
    # return x


def getBaconWords():
    while 1:
        a = getRandWord(4, 7)
        b = getRandWord(4, 7)
        if len(a) + len(b) == len(set(a + b)):
            return [a, b]


def getRandWord(min, max):
    f = open("words.txt", "r")
    for i in range(random.randint(0, 9000)):
        f.readline()
    r = ""
    while len(r) < min or len(r) > max:
        r = f.readline().strip()
    return r


def genQuotes(n):
    # quotes = open("quotes.txt", "r")
    # l = []
    # for i in range(40569):
    #     l.append(quotes.readline().strip())
    l = open("quotes.txt", "r", encoding="utf-8").read().split('\n')

    random.shuffle(l)
    count = 0
    loc = 0
    r = []
    while count < n:
        if len(l[loc]) > 65 and len(l[loc]) < 160:
            r.append(l[loc])
            count += 1
        loc += 1
    return r


def genQuoteLength(min, max):
    # quotes = open("quotes.txt", "r")
    # l = []
    # for i in range(40569):
    #     l.append(quotes.readline().strip())
    l = open("quotes.txt", "r", encoding="utf-8").read().split('\n')
    random.shuffle(l)
    loc = 0
    while 1:
        if len(l[loc]) > min and len(l[loc]) < max:
            return l[loc]
        loc += 1


def genSpanishQuote(min, max):
    json_file = open("spanish.json", "r", encoding="utf-8")
    data = json.load(json_file)
    l = []
    for p in data["quotes"]:
        l.append(p["Cita"])
    random.shuffle(l)
    loc = 0
    while 1:
        if len(l[loc]) > min and len(l[loc]) < max:
            q = l[loc][1:-1]
            return q
        loc += 1


def getDeterminant(l):
    if len(l) == 4:
        return (l[1] * l[2] - l[0] * l[3]) % 26
    return 0


def get2x2Key():
    f = open("2x2hillwords", "r")
    for i in range(0, random.randint(0, 490)):
        f.readline()
    return f.readline().strip().lower()


def get3x3Key():
    f = open("3x3hillwords", "r")
    for i in range(0, random.randint(0, 4900)):
        f.readline()
    return f.readline().strip().lower()


def determinant2x2(key):
    matrix = [list("ABCDEFGHIJKLMNOPQRSTUVWXYZ").index(k.upper()) for k in key]
    return matrix[0] * matrix[3] - matrix[1] * matrix[2]


def genTest(preset):
    l = []
    if "c" in preset:
        l = [
            "1 2",
            "1 1",
            "1 0",
            "2 2",
            "2 1",
            "2 0",
            "6 D",
            "6 E",
            "6 C",
            "9 D",
            "9 D"
            "13 E",
            "13 D",
            "13 C",
            "13 C",
            "16 D",
            "16 D"
            "17 D",
            "17 D"  #, "8 1", "18 D", "18 D"
        ]
        if "1" in preset:
            l.extend(["2 X", "2 X", "18 D CM6"])
        if "2" in preset:
            l.extend(["8 1", "18 D CM9"])
        if "3" in preset:
            l.extend(["18 D CM11"])
        if "1" in preset or "2" in preset:
            l.extend(["7 D", "7 E", "2 X"])
        if "2" in preset or "3" in preset:
            l.extend(["1 2", "1 2", "1 2", "2 D", "17 D"])
        n = len(l)
    elif "b" in preset:
        l = [
            "1 D", "1 D", "1 2", "1 1", "1 0", "1 X"
            "2 2", "2 1", "2 0", "8 1", "4 D", "4 E", "9 D", "15 D", "13 E",
            "13 D", "13 C", "16 D", "17 D", "18 D CM6"
        ]
        if "2" in preset:
            l.extend(["1 2", "8 1"])
        if "1" in preset or "2" in preset:
            l.extend(["2 1", "2 X", "2 D"])
        if "2" in preset or "3" in preset:
            l.extend(["1 2", "1 2", "1 2"])
        n = len(l)
    elif preset == "1":  # backwards compat
        l = [
            "1 2", "1 1", "1 0", "2 2", "2 1", "2 0", "3 D", "3 E", "3 C",
            "4 D", "4 E", "5 D", "5 E", "5 C", "6 D", "6 E", "6 C", "7 D",
            "7 E", "8 1", "9 L", "9 S", "9 W", "13 E", "13 D", "13 C", "16 D",
            "17 D", "18 D CM6"
        ]
        n = len(l)
    elif preset == "2":  # backwards compat
        hill2 = ["6 D", "6 E", "6 C"]
        hill3 = ["7 D", "7 E"]
        aff = ["3 D", "3 E"]
        bac = ["9 L", "9 S", "9 W"]
        porta = ["13 E", "13 D", "13 C"]
        random.shuffle(porta)
        random.shuffle(aff)
        random.shuffle(hill2)
        random.shuffle(hill3)
        random.shuffle(bac)
        l = [
            "1 2", "1 2", "1 2", "1 2", "1 2", "1 2", "1 2", "1 2", "1 2",
            "1 2", "2 2", "2 1", "2 0", aff[0], aff[1], "4 D", "4 E", hill2[0],
            hill2[1], hill3[0], "8 1", "8 1", bac[0], bac[1], porta[0], "16 D"
        ]
        n = len(l)
    elif preset == "3":  # backwards compat
        enc = ["3 E", "4 E", "5 E", "6 E"]
        bac = ["9 L", "9 S", "9 W"]
        porta = ["13 E", "13 D"]
        random.shuffle(porta)
        random.shuffle(enc)
        random.shuffle(bac)
        l = [
            "1 0", "1 1", "1 2", "1 2", "1 2", "1 2", "2 2", "2 0", "3 D",
            "4 D", "5 D", "6 D", enc[0], enc[1], "8 1", bac[0], bac[1], "11 D",
            "12 D", porta[0], "14 " + str(random.randint(2, 6)), "14 R", "16 D"
        ]
        n = len(l)
    elif preset == "4":
        l = ["1 2"] * 20
        n = 20
    elif preset == "5":
        l = ["2 2"] * 10
        n = 10
    else:
        l = preset
        n = len(l)
    q = genQuotes(n + 1)
    test = {"TEST.0": header(n, na)}
    test["CIPHER.0"] = genRandMono(0, q[len(q) - 1], False, False, 0, 0)
    for i in range(n):
        question = l[i].split(" ")
        if int(question[0]) <= 2:
            k = 0
            if "K" in l[i].upper():
                k = int(l[i][l[i].upper().index("K") + 1])

            test["CIPHER." + str(i + 1)] = genRandMono(
                i, q[i], "1" if question[0] == "2" else 0, "X"
                in question[1].upper(),
                question[1] if "K" not in question[1].upper() else "0", k)
        if int(question[0]) == 3:
            test["CIPHER." + str(i + 1)] = genRandAffine(i, q[i], question[1])
        if int(question[0]) == 4:
            test["CIPHER." + str(i + 1)] = genRandCaesar(i, q[i], question[1])
        if int(question[0]) == 5:
            test["CIPHER." + str(i + 1)] = genRandVig(i, q[i], question[1])
        if int(question[0]) == 6:
            test["CIPHER." + str(i + 1)] = genRand2x2Hill(i, q[i], question[1])
        if int(question[0]) == 7:
            test["CIPHER." + str(i + 1)] = genRand3x3Hill(i, q[i], question[1])
        if int(question[0]) == 8:
            k = 0
            if "K" in l[i].upper():
                k = int(l[i][l[i].upper().index("K") + 1])
            test["CIPHER." + str(i + 1)] = genRandXeno(
                i, q[i],
                question[1] if "K" not in question[1].upper() else "0", k)
        if int(question[0]) == 9:
            test["CIPHER." + str(i + 1)] = genRandBacon(i, q[i], question[1])
        # if int(question[0]) == 10:
        #     test["CIPHER." + str(i + 1)] = RSA(i, question[1])
        if int(question[0]) == 11:
            test["CIPHER." + str(i + 1)] = genRandMorbit(i, q[i], question[1])
        if int(question[0]) == 12:
            test["CIPHER." + str(i + 1)] = genRandPollux(i, q[i], question[1])
        if int(question[0]) == 13:
            test["CIPHER." + str(i + 1)] = genRandPorta(i, q[i], question[1])
        if int(question[0]) == 14:
            test["CIPHER." + str(i + 1)] = genRandRailFence(
                i, q[i], question[1], "RR" if "RR" in question else "RN",
                "RO" if "RO" in question else
                (int(question[question.index("O") +
                              1:]) if "O" in question else 0))
        if int(question[0]) == 15:
            test["CIPHER." + str(i + 1)] = genRandAtbash(i, q[i], question[1])
        if int(question[0]) == 16:
            test["CIPHER." + str(i + 1)] = genRandFractionatedMorse(
                i, q[i], question[1])
        if int(question[0]) == 17:
            test["CIPHER." + str(i + 1)] = genRandNihilist(i, q[i])
        if int(question[0]) == 18:
            if "CM" in question:
                after_CM = question[question.index("CM"):]
                if " " in after_CM:
                    CM_str = after_CM[:after_CM.index(" ")]
                else:
                    CM_str = after_CM

            test["CIPHER." + str(i + 1)] = genRandColumnar(
                i, q[i], question[1], "CR" if "CR" in question else
                (CM_str if "CM" in question else "2"), 0)

    return json.dumps(test)

def gen(pre):
    try:
        test = genTest(pre)
        return test
    except:
        return "Invalid preset!"

def genCustom(pre):
    try:
        pre_unfolded = list(pre.split(","))
        pre_folded = ""

        for i in range(len(pre_unfolded)):
            if "*" in pre_unfolded[i]:
                item = pre_unfolded[i].split("*")

                n = int(item[0])

                for j in range(n):
                    pre_folded += item[1]
                    pre_folded += ","
            else:
                pre_folded += pre_unfolded[i]
                pre_folded += ","

        pre_folded_final = pre_folded.split(",")[:-1]

        test = genTest("test", pre_folded_final)
        return test
    except:
        return "Invalid preset!"

def customQ():
    ciphers = [
        "Aristocrat", "Patristocrat", "Affine", "Caesar", "Vigenere",
        "2x2 Hill", "3x3 Hill", "Xenocrypt", "Baconian", "RSA (DEPRECATED)", "Morbit",
        "Pollux", "Porta", "Rail Fence", "Atbash", "Fractionated Morse",
        "Nihilist", "Columnar"
    ]

    ciphers = [f"{c+1}  {ciphers[c]}" for c in range(len(ciphers))]
    max_len = len(max(ciphers, key=len))
    ciphers = [
        f"{ciphers[c]}".ljust(max_len, " ") for c in range(len(ciphers))
    ]

    coptions = [
        "D  Decode", "E  Encode", "C  Crypt", "L  Letter 4 Letter",
        "S  Sequence", "W  Words", "0  Word Hint", "1  Character Hint",
        "2  No Hint", "R  Random Rail Count", "RR  Rail Range Hint",
        "RN  Rail Count Hint", "CR  Column Range Hint", "K1  K1 Alphabet",
        "K2  K2 Alphabet", "X  Errors"
    ]

    if len(coptions) < len(ciphers):
        coptions = coptions + [""] * (len(ciphers) - len(coptions))
    elif len(coptions) > len(ciphers):
        ciphers = ciphers + [""] * (len(coptions) - len(ciphers))

    formatted_list = ""

    for c in range(len(ciphers)):
        formatted_list += "\n"
        formatted_list += f"{ciphers[c]}    {coptions[c]}"

    return f"Here's the list of question types:```{formatted_list}```"

about = "Hi! I was made by Allen Chang. My old source code is at https://github.com/AC01010/codebuilder, but I am now maintained by Rasmit Devkota at https://github.com/RasmitDevkota/SciOly/tree/main/codetaker."
presets = "```1\tAll Types - 20-30 Questions + Timed - Includes one of each cipher type.\n2\tNational Level Test - 20-30 Questions + Timed - National Level test, with random modes of questions.\n3\tRegional Level Test - 20-30 Questions + Timed - Regional level test, with random modes of questions.\n4\tAristo Spam - 20 Questions + Timed - 20 Unhinted Aristocrats.\n5\tPatristo Spam - 10 Questions + Timed - 10 Unhinted Patristocrats.\n\nAdd b or c after prefixes 1, 2, or 3 to generate a test of that type for the specified division, with question counts varying based on division and type.```"

def main(jsproxy):
    test = "No test generated!"

    preset = document.querySelector("#preset")
    if "\"" in preset:
        test = genCustom(preset)
    else:
        test = gen(preset)

    test_text = document.querySelector("#testText")
    test_text.innerHTML = json.dumps(test)
