"""
パスワードのハッシュやJWTの作成をするファイル
使うライブラリなどはすべてfastapiの公式ドキュメントを参考にしています。
https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/
"""

from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Annotated
import jwt
from jwt.exceptions import InvalidTokenError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pwdlib import PasswordHash
import os
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.getenv('SECRET_KEY', '').strip()
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY environment variable is required")

ALGORITHM = os.getenv('ALGORITHM', 'HS256')
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

password_hash = PasswordHash.recommended()
DUMMY_HASH = password_hash.hash("dummypassword")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login")

# plain_password : 入力フォームから受け取るパスワード
# hashed_password: データベースからハッシュされたパスワードを入れ、ここで確認をする。
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_hash.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return password_hash.hash(password)

# data = ユーザーidが入ってある辞書が引数に入れられる
# {"sub": user_id}といったもの
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    # トークンの有効期限を追加
    to_encode.update({"exp": expire})
    # JWTのエンコードに関する具体的なイメージは以下の記事を参考。
    # https://qiita.com/knaot0/items/8427918564400968bd2b
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ここのDepends(oauth2_scheme)の箇所でトークン情報の呼び出しが必須となっている
# この関数はmain.pyのget_me関数（ユーザー情報取得）の引数に入っており、ユーザー情報を得るときは必ず
# このトークンをコードして認証することが必須となる
def decode_token(token: Annotated[str, Depends(oauth2_scheme)]) -> str:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="トークンが無効です",
        headers={"WWW-Authenticate": "Bearer"}
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        return user_id
    except InvalidTokenError:
        raise credentials_exception
