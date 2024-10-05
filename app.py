from flask import Flask, jsonify, request, render_template
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)

@app.route('/')
def czytnik():
    return render_template('index.html')

@app.route('/baza', methods=['GET'])
def get_users():
    connection = create_connection()
    if connection is None:
        return jsonify({"error": "Nie udało się nawiązać połączenia z bazą danych"}), 500

    cursor = connection.cursor(dictionary=True)
    query = "SELECT * FROM users"
    cursor.execute(query)
    users = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(users)

def create_connection():
    """Stwórz połączenie z bazą danych MariaDB."""
    connection = None
    try:
        connection = mysql.connector.connect(
            host="kejpa.duckdns.org",       # Adres hosta (zwykle localhost)
            user="root", # Nazwa użytkownika
            password="kapa1Gkf!!jfFg", # Hasło do bazy danych
            database="kapa",   # Nazwa bazy danych
            
        )
        if connection.is_connected():
            print("Połączenie z bazą danych zostało nawiązane")
            return connection
        else:
            print("Połączenie z bazą danych nie zostało nawiązane")
            return None
    except Error as e:
        print(f"Błąd podczas łączenia z bazą danych: {e}")
        return None

if __name__ == '__main__':
    app.run(debug=True)
