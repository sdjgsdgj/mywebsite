import json

with open('data.json', 'r') as f:
    data = json.load(f)

    for obj in data:
        obj['other'] = 0.0
        obj['other_reason'] = ''

with open('data.json', 'w') as f:
    json.dump(data, f)

