import requests
import re

api_key = 'K84870390488957'

request_url = "https://api.ocr.space/parse/image"


def text_recognition_api(image_raw, image_filename):
    headers = {
        'apikey': api_key,
        'language': 'ger',
        # 'isOverlayRequired': False,
        'isTable': True,
        'detectOrientation': True
    }
    response = requests.post(
        request_url, files={image_filename: image_raw}, data=headers)

    return response.json()


def find_last_number(_str):
    match = re.search(r'[0-9]+', _str[::-1])

    try:
        return (int(match.group()[::-1]), len(_str) - match.end())
    except:
        return None, -1


def get_material(raw_text):
    lines = raw_text.split('\n')
    material = []

    for line in lines:
        cnt, pos = find_last_number(line)

        material.append({
            'name': line[:pos],
            'missing': 0,
            'cnt': cnt
        })
    return material
