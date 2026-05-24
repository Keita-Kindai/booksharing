# BookShare 📖

本の感想を投稿・共有できるWebアプリです。
読んだ本の感想を記録したり、他のユーザーの投稿を検索して閲覧することができます。

## イメージ一覧
![ログイン・サインアップ画面](./images/Login.png)
![メイン画面（書籍一覧）](./images/home.png)
![投稿フォーム（上部）](./images/post1.png)
![投稿フォーム（下部）](./images/post2.png)
![投稿後のホーム画面](./images/home2.png)
![投稿詳細モーダル](./images/checkpost.png)
![検索機能](./images/search.png)

## 使用技術

### フロントエンド
- React / TypeScript
- TailwindCSS
- use-debounce
- react-icons

### バックエンド
- Python / FastAPI
- SQLite3
- PyJWT（JWT認証）
- pwdlib / Argon2（パスワードハッシュ化）

## 機能一覧

- ユーザー登録・ログイン（JWT認証）
- 書籍感想の投稿（タイトル・書籍名・評価・感想・画像・購入リンク）
- 書籍タイトルによるリアルタイム検索
- ユーザー名によるリアルタイム検索
- 投稿詳細のモーダル表示
- MyBooksから自分の投稿一覧を表示

## セットアップ

### 必要な環境
- Python 3.10以上
- Node.js 20.19以上、または 22.12以上
- (backendフォルダの中にuploadsフォルダを作成してください。画像保存用です）

### バックエンド
```bash
cd backend
python -m venv myenv
source myenv/bin/activate  # Windowsの場合: myenv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

`.env` ファイルを作成してください（`.env.example` を参考にしてください）。
```bash
uvicorn main:app --reload --port 9000
```

### フロントエンド
```bash
cd book-sharing
npm install
cp .env.example .env.local
npm run dev
```

ブラウザで `http://localhost:5173` を開いてください。

## 環境変数

### バックエンド

`backend/.env.example` をコピーして `backend/.env` を作成してください。
```
SECRET_KEY=        # openssl rand -hex 32 で生成
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

`ALLOWED_ORIGINS` はカンマ区切りで複数指定できます。本番環境ではVercelのフロントエンドURLを追加してください。

### フロントエンド

`book-sharing/.env.example` をコピーして `book-sharing/.env.local` を作成してください。
Vite構成のため、APIの接続先は `VITE_API_URL` を使います。

```
VITE_API_URL=http://127.0.0.1:9000
```

本番環境では、`VITE_API_URL` にデプロイ済みバックエンドのURLを指定してください。末尾の `/` は不要です。
秘密情報は `.env` や `.env.local` に入れ、GitHubにはコミットしないでください。

## Vercelへのデプロイ

Vercelではフロントエンドのプロジェクトルートを `book-sharing` に設定してください。

| 設定項目 | 値 |
|--------|----|
| Framework Preset | Vite |
| Root Directory | `book-sharing` |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Vercelの Project Settings > Environment Variables に以下を追加してください。

| Name | Value |
|------|-------|
| `VITE_API_URL` | デプロイ済みバックエンドのURL（例: `https://api.example.com`） |

バックエンド側のCORS設定には、Vercelで発行されたフロントエンドURLを許可する必要があります。

## Renderへのデプロイ

Renderではバックエンドのプロジェクトルートを `backend` に設定してください。

| 設定項目 | 値 |
|--------|----|
| Runtime | Python |
| Root Directory | `backend` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |

Renderの Environment に以下を追加してください。

| Name | Value |
|------|-------|
| `SECRET_KEY` | `openssl rand -hex 32` などで生成した秘密値 |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` など |
| `ALLOWED_ORIGINS` | VercelのフロントエンドURL（例: `https://your-app.vercel.app`） |

`ALLOWED_ORIGINS` はカンマ区切りで複数指定できます。ローカル開発では `.env` の `http://localhost:5173,http://localhost:5174` を使えます。

SQLiteは現状維持です。ただしRenderの通常ディスクはデプロイや再起動で永続化されない場合があります。本番運用で投稿やユーザー情報を保持したい場合は、Render Diskの利用やPostgreSQLなどの永続DBへの移行を検討してください。

フロントエンドをVercelに置く場合、Vercel側の `VITE_API_URL` にはRenderで発行されたバックエンドURLを設定してください。

## API一覧

| メソッド | エンドポイント | 説明 | 認証 |
|--------|--------------|------|------|
| POST | /users/register | ユーザー登録 | 不要 |
| POST | /users/login | ログイン | 不要 |
| GET | /users/me | 自分の情報取得 | 必要 |
| GET | /users/search | ユーザー名で検索 | 不要 |
| GET | /posts | 投稿一覧取得 | 不要 |
| POST | /posts | 投稿作成 | 必要 |
| GET | /posts/search | 書籍タイトルで検索 | 不要 |

## ディレクトリ構成
```
booksharing/
├── backend/
│   ├── main.py          # エンドポイント定義
│   ├── auth.py          # JWT認証・パスワードハッシュ化
│   ├── database.py      # DB初期化・接続
|   ├── client.py        # テスト用
│   ├── uploads/         # アップロード画像の保存先
│   ├── .env             # 環境変数（Gitに含めない）
│   ├── .env.example     # 環境変数のサンプル
│   └── requirements.txt
└── book-sharing/
    ├── src/
    │   ├── components/  # 共通コンポーネント
    │   ├── context/     # AuthContext
    │   └── pages/       # 各ページ
    └── package.json
```
