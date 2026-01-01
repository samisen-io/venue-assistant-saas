import json

try:
    with open('openapi.json', 'r', encoding='utf-16le') as f:
        data = json.load(f)
        paths = data.get('paths', {}).keys()
        print("Available paths:")
        for path in paths:
            print(path)
except Exception as e:
    print(f"Error: {e}")
