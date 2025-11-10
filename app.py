from flask import Flask, render_template, request, redirect, url_for, flash, session
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os

app = Flask(__name__)
app.secret_key = "supersecretkey"  # Change this in production!

# Database path
DB_PATH = os.path.join('instance', 'nextwealth.db')

# Ensure instance folder exists
os.makedirs('instance', exist_ok=True)

# Initialize DB if it doesn't exist
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    first_name TEXT NOT NULL,
                    last_name TEXT NOT NULL,
                    email TEXT NOT NULL UNIQUE,
                    password TEXT NOT NULL
                )''')
    conn.commit()
    conn.close()

init_db()

# Home route
@app.route('/')
def home():
    return render_template('index.html')

# Register route
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        first_name = request.form.get('first_name')
        last_name = request.form.get('last_name')
        email = request.form.get('email')
        password = request.form.get('password')

        hashed_password = generate_password_hash(password)

        try:
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute("INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
                      (first_name, last_name, email, hashed_password))
            conn.commit()
            conn.close()
            flash("Account created successfully! You can now log in.", "success")
            return redirect(url_for('login'))
        except sqlite3.IntegrityError:
            flash("Email already exists. Try logging in.", "error")
            return redirect(url_for('register'))

    return render_template('register.html')

# Login route
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT id, password FROM users WHERE email = ?", (email,))
        user = c.fetchone()
        conn.close()

        if user and check_password_hash(user[1], password):
            session['user_id'] = user[0]
            flash("Logged in successfully!", "success")
            return redirect(url_for('dashboard'))
        else:
            flash("Invalid email or password.", "error")
            return redirect(url_for('login'))

    return render_template('login.html')

# Dashboard route (requires login)
@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        flash("Please log in first.", "error")
        return redirect(url_for('login'))
    return render_template('dashboard.html')

# Logout route
@app.route('/logout')
def logout():
    session.pop('user_id', None)
    flash("Logged out successfully.", "success")
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)
