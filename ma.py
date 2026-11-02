"""
matatu.py — Nganya backend (Flask + MySQL)

Endpoints
---------
GET  /api/nganya  -> list all nganyas: {"nganya": [{carID, fullName, road}, ...]}
POST /api/post    -> create a nganya from JSON body; returns 201 {"message": ...}

Required environment variables (.env):
    DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
"""

import os
import mysql.connector
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import generate_password_hash

load_dotenv()

app = Flask("schoolkitchen")
CORS(app)


def get_db_connection():
    """Open a fresh MySQL connection using credentials from .env."""
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
    )


@app.route("/api/nganya", methods=["GET"])
def get_nganya():
    """Return every row in the `nganya` table (public columns only)."""
    connection = cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT carID, fullName, road FROM nganya")
        rows = cursor.fetchall()
        return {"nganya": [
            {"carID": r[0], "fullName": r[1], "road": r[2]} for r in rows
        ]}, 200
    except Exception as e:
        app.logger.exception("GET /api/nganya failed")
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.route("/api/post", methods=["POST"])
def add_nganya():
    """Insert a new nganya. Body: {fullName, emailAddress, passWord, age, road}."""
    connection = cursor = None
    try:
        data = request.get_json(force=True) or {}
        required = ("fullName", "emailAddress", "passWord", "age", "road")
        missing = [k for k in required if not data.get(k)]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO nganya "
            "(fullName, emailAddress, password, age, road) "
            "VALUES (%s, %s, %s, %s, %s)",
            (
                data["fullName"],
                data["emailAddress"],
                generate_password_hash(data["passWord"]),  # never store plain text
                int(data["age"]),
                data["road"],
            ),
        )
        connection.commit()
        return jsonify({"message": "nganya added"}), 201
    except mysql.connector.IntegrityError as e:
        # e.g. duplicate email (UNIQUE constraint)
        return jsonify({"error": f"Duplicate or invalid data: {e}"}), 409
    except Exception as e:
        app.logger.exception("POST /api/post failed")
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


if __name__ == "__main__":
    app.run(debug=True, port=5000)