import os
import mysql.connector
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

load_dotenv()

app = Flask("schoolkitchen")
CORS(app)

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
    )

@app.route("/api/anime", methods=["GET", "POST"])
def handle_anime():
    if request.method == "GET":
        try:
            connection = get_db_connection()
            cursor = connection.cursor()
            cursor.execute("SELECT animeName, mainCharacter, sideCharacter, mcPower, scPower, words, stats FROM anime")
            rows = cursor.fetchall()
            cursor.close()
            connection.close()

            results = []
            for r in rows:
                results.append({
                    "animeName": r[0],
                    "mainCharacter": r[1],
                    "sideCharacter": r[2],
                    "MC_POWER": r[3],
                    "SC_POWER": r[4],
                    "WORDS": r[5],
                    "STATS": r[6]
                })

            return jsonify({"anime": results}), 200

        except Exception as e:
            print("Database Error:", e)
            return jsonify({"error": str(e)}), 500

    elif request.method == "POST":
        connection = None
        cursor = None
        try:
            data = request.json
            connection = get_db_connection()
            cursor = connection.cursor()

            query = "INSERT INTO anime (animeName, mainCharacter, sideCharacter, mcPower, scPower, words, stats) VALUES (%s, %s, %s, %s, %s, %s, %s)"
            values = (
                data["animeName"],
                data["mainCharacter"],
                data["sideCharacter"],
                data["mcPower"],
                data["scPower"],
                data["words"],
                data["stats"]
            )
            cursor.execute(query, values)
            connection.commit()

            return jsonify({"message": "Anime added successfully!"}), 201

        except Exception as e:
            print("Database Error:", e)
            return jsonify({"error": str(e)}), 500

        finally:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()

if __name__ == "__main__":
    app.run(debug=True, port=5000)