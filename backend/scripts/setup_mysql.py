"""Script to connect to local MySQL with user provided root password and initialize database."""

import pymysql

def init_mysql():
    root_password = "chahat"
    try:
        conn = pymysql.connect(host="127.0.0.1", user="root", password=root_password, port=3306)
        print("Connected successfully to MySQL as root!")
        with conn.cursor() as cur:
            cur.execute("CREATE DATABASE IF NOT EXISTS digimitra_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
            cur.execute("CREATE USER IF NOT EXISTS 'digimitra_user'@'%' IDENTIFIED BY 'digimitra_secret_pass';")
            cur.execute("CREATE USER IF NOT EXISTS 'digimitra_user'@'localhost' IDENTIFIED BY 'digimitra_secret_pass';")
            cur.execute("ALTER USER 'digimitra_user'@'%' IDENTIFIED BY 'digimitra_secret_pass';")
            cur.execute("ALTER USER 'digimitra_user'@'localhost' IDENTIFIED BY 'digimitra_secret_pass';")
            cur.execute("GRANT ALL PRIVILEGES ON digimitra_db.* TO 'digimitra_user'@'%';")
            cur.execute("GRANT ALL PRIVILEGES ON digimitra_db.* TO 'digimitra_user'@'localhost';")
            cur.execute("FLUSH PRIVILEGES;")
        print("Database 'digimitra_db' and user 'digimitra_user' created and granted permissions successfully!")
        conn.close()
        return True
    except Exception as e:
        print("Failed to connect to MySQL:", e)
        return False

if __name__ == "__main__":
    init_mysql()
