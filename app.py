from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

all_data = []

@app.route('/api/track', methods=['POST'])
def track_time():
    data = request.json
    all_data.append(data)
    return jsonify({"status": "success"}), 200

@app.route('/api/summary', methods=['GET'])
def summary():
    summary = {
        "productive": 0,
        "unproductive": 0
    }

    with open("categories.json") as f:
        categories = json.load(f)

    for item in all_data:
        url = item["url"]
        time_spent = item["timeSpent"]
        category = "unproductive"

        for keyword in categories:
            if keyword in url:
                category = categories[keyword]
                break

        summary[category] += time_spent

    return jsonify(summary)

if __name__ == "__main__":
    app.run(debug=True)