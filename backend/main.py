from fastapi import FastAPI, Depends, HTTPException, Form, File, UploadFile
import sqlite3
import os
from pathlib import Path
from dotenv import load_dotenv
from database import init_db, get_db
from pydantic import BaseModel
from auth import get_password_hash, verify_password, create_access_token, decode_token
import time
import uuid
from typing import Annotated
from fastapi.staticfiles import StaticFiles

from fastapi.middleware.cors import CORSMiddleware

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

def get_allowed_origins() -> list[str]:
    local_origins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ]
    configured_origins = [
        os.getenv("FRONTEND_URL", ""),
        *os.getenv("ALLOWED_ORIGINS", "").split(","),
    ]
    origins = [
        origin.strip().rstrip("/")
        for origin in [*local_origins, *configured_origins]
        if origin.strip()
    ]
    return list(dict.fromkeys(origins))

app = FastAPI()

# 静的ファイルをマウントして、画像を保持する。
app.mount('/uploads', StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# CORS(Cross-Origin Resource shareing)エラーが発生してしまうため、
# こっちでlocahost:5173（viteのポート）を指定して
# エラーが起きないようにしないといけない
# https://qiita.com/higakin/items/fabe6a23d564b20ad558　を参照
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class User(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

init_db()

@app.get('/')
def root_index():
    return {"message": "Hi, This is a test"}

@app.post('/users/register')
def register_user(user: User):
    conn = get_db()
    cur = conn.cursor()
    try:
        id = str(uuid.uuid4())
        user_name = user.name
        hash_pass = get_password_hash(user.password)
        email = user.email
        bio = ""
        datetime = time.strftime('%Y-%m-%d %H:%M:%S')
        cur.execute('INSERT INTO users VALUES (?, ?, ?, ?, ?,?)', ((id,user_name,email,hash_pass,bio,datetime)))
        conn.commit()
        return {"message": "User registerd successfully", "user_id": id}

    except sqlite3.Error as e:
        print(f"[Register] Something went wrong: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

# ログインの確認から認証までを行う
# 認証の処理はauth.pyのcreate_access_tokenに行わせている。
@app.post('/users/login')
def login_user(request: LoginRequest):
    conn = get_db()
    cur  = conn.cursor()
    try:
        cur.execute('SELECT id, hashed_password FROM users WHERE email = ?', (request.email,))
        row = cur.fetchone()

        if row is None or not verify_password(request.password, row[1]):
            raise HTTPException(
                status_code=401,
                detail="メールアドレスまたはパスワードが正しくありません"
            )
        token = create_access_token(data={"sub": row[0]})
        return {"access_token": token, "token_type": "bearer"}
    finally:
        conn.close()

@app.get('/users/search')
def get_user_post(user_name: str):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute('''
                    SELECT p.id, p.post_title, p.book_name, p.rating, p.review_text, p.image_path, p.purchase_url, u.username
                    FROM posts AS p JOIN users AS u ON p.user_id = u.id
                    WHERE u.username LIKE ?
                    ORDER BY p.created_at DESC
                    ''',(f'%{user_name}%',))
        rows = cur.fetchall()
        print(len(rows))
        return [
            {
                "id":           row[0],
                "post_title":   row[1],
                "book_name":    row[2],
                "rating":       row[3],
                "review":       row[4],
                "image_path":   row[5],
                "purchase_url": row[6],
                "author":       row[7],
            }
            for row in rows
        ]
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail="内部サーバーエラー")
    finally:
        conn.close()

@app.get('/posts/search')
def get_title_post(title: str):
    conn = get_db()
    cur = conn.cursor()
    print(title)
    try:
        cur.execute('''
                    SELECT p.id, p.post_title, p.book_name, p.rating, p.review_text, p.image_path, p.purchase_url, u.username
                    FROM posts AS p JOIN users AS u ON p.user_id = u.id
                    WHERE p.book_name LIKE ?
                    ORDER BY p.created_at DESC
                    ''',(f'%{title}%',))
        rows = cur.fetchall()
        return [
            {
                "id":           row[0],
                "post_title":   row[1],
                "book_name":    row[2],
                "rating":       row[3],
                "review":       row[4],
                "image_path":   row[5],
                "purchase_url": row[6],
                "author":       row[7],
            }
            for row in rows
        ]
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail="内部サーバーエラー")
    finally:
        conn.close()

@app.get('/posts')
def get_posts():
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute('''
            SELECT p.id, p.post_title, p.book_name, p.rating,
                   p.review_text, p.image_path, p.purchase_url,
                   u.username as author
            FROM posts AS p
            JOIN users AS u ON p.user_id = u.id
            ORDER BY p.created_at DESC
        ''')
        rows = cur.fetchall()
        return [
            {
                "id":           row[0],
                "post_title":   row[1],
                "book_name":    row[2],
                "rating":       row[3],
                "review":       row[4],
                "image_path":   row[5],
                "purchase_url": row[6],
                "author":       row[7],
            }
            for row in rows
        ]
    except Exception as e:
        # sqlite3.Error 以外の例外も見えるようにしておく
        import traceback
        print("[get_posts] Exception:", e)
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail="内部サーバーエラー")
    finally:
        conn.close()

@app.post('/posts')
async def post_summary(
    post_title  : Annotated[str, Form()],
    book_name   : Annotated[str, Form()],
    rating      : Annotated[int, Form()],
    purchase_url: Annotated[str, Form()],
    review      : Annotated[str, Form()],
    user_id     : Annotated[str, Depends(decode_token)],
    image       : Annotated[UploadFile | None, File()] = None,
): 
    conn = get_db() 
    cur = conn.cursor()
    print(image)
    try:
        image_path = None
        if image:
            contents = await image.read()
            image_path = f"uploads/{image.filename}"
            with open(UPLOADS_DIR / image.filename, "wb") as f:
                f.write(contents)

        cur.execute('''
        INSERT INTO posts (user_id, book_name, post_title, rating, purchase_url, review_text, image_path)
                VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, book_name, post_title, rating, purchase_url, review, image_path))
        conn.commit()
        return {"message": "投稿しました"}

    except sqlite3.Error as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get('/users/me')
def get_me(user_id: str = Depends(decode_token)):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute('SELECT id, username, email, bio FROM users WHERE id= ?', (user_id,))
        row = cur.fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="ユーザーが見つかりません")
        return {"id": row[0], "username": row[1], "email": row[2], "bio":row[3]}
    finally:
        conn.close()
