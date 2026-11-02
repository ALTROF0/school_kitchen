import os
import mysql.connector
from dotenv import load_dotenv
from flask import Flask, jsonify, request, render_template
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


def row_to_dict(row):
    return {
        "id": row[0],
        "animeName": row[1],
        "mainCharacter": row[2],
        "sideCharacter": row[3],
        "mcPower": row[4],
        "scPower": row[5],
        "words": row[6],
        "stats": row[7],
    }


# ---------- Pages ----------
@app.route("/")
@app.route("/animeform.html")
def form_page():
    return render_template("animeform.html")


@app.route("/animetable.html")
def table_page():
    return render_template("animetable.html")


# ---------- API ----------
@app.route("/api/anime", methods=["GET", "POST"])
@app.route("/api/animetable", methods=["GET"])
def anime_collection():
    if request.method == "GET":
        connection = None
        cursor = None
        try:
            connection = get_db_connection()
            cursor = connection.cursor()
            cursor.execute(
                "SELECT animeID, animeName, mainCharacter, sideCharacter, "
                "mcPower, scPower, words, stats FROM anime"
            )
            rows = cursor.fetchall()
            return jsonify({"anime": [row_to_dict(r) for r in rows]}), 200
        except Exception as e:
            print("Database Error:", e)
            return jsonify({"error": str(e)}), 500
        finally:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()

    # POST
    connection = None
    cursor = None
    try:
        data = request.get_json(force=True)
        required = [
            "animeName", "mainCharacter", "sideCharacter",
            "mcPower", "scPower", "words", "stats",
        ]
        missing = [k for k in required if str(data.get(k, "")).strip() == ""]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO anime "
            "(animeName, mainCharacter, sideCharacter, mcPower, scPower, words, stats) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (
                data["animeName"].strip(),
                data["mainCharacter"].strip(),
                data["sideCharacter"].strip(),
                data["mcPower"].strip(),
                data["scPower"].strip(),
                data["words"].strip(),
                int(data["stats"]),
            ),
        )
        connection.commit()
        new_id = cursor.lastrowid
        return jsonify({"message": "Anime added successfully!", "id": new_id}), 201
    except Exception as e:
        print("Database Error:", e)
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.route("/api/anime/<int:anime_id>", methods=["GET", "PUT", "DELETE"])
@app.route("/api/animetable/<int:anime_id>", methods=["GET", "PUT", "DELETE"])
def anime_item(anime_id):
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        if request.method == "GET":
            cursor.execute(
                "SELECT animeID, animeName, mainCharacter, sideCharacter, "
                "mcPower, scPower, words, stats FROM anime WHERE animeID = %s",
                (anime_id,),
            )
            row = cursor.fetchone()
            if not row:
                return jsonify({"error": "Not found"}), 404
            return jsonify(row_to_dict(row)), 200

        if request.method == "PUT":
            data = request.get_json(force=True)
            required = [
                "animeName", "mainCharacter", "sideCharacter",
                "mcPower", "scPower", "words", "stats",
            ]
            missing = [k for k in required if str(data.get(k, "")).strip() == ""]
            if missing:
                return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

            cursor.execute(
                "UPDATE anime SET animeName=%s, mainCharacter=%s, sideCharacter=%s, "
                "mcPower=%s, scPower=%s, words=%s, stats=%s WHERE animeID=%s",
                (
                    data["animeName"].strip(),
                    data["mainCharacter"].strip(),
                    data["sideCharacter"].strip(),
                    data["mcPower"].strip(),
                    data["scPower"].strip(),
                    data["words"].strip(),
                    int(data["stats"]),
                    anime_id,
                ),
            )
            connection.commit()
            if cursor.rowcount == 0:
                return jsonify({"error": "Not found"}), 404
            return jsonify({"message": "Anime updated successfully!"}), 200

        # DELETE
        cursor.execute("DELETE FROM anime WHERE animeID = %s", (anime_id,))
        connection.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Not found"}), 404
        return jsonify({"message": "Anime deleted successfully!"}), 200

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