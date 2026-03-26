import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
    const { login, setUsername } = useAuth()
    const [isLogin, setIsLogin] = useState(true)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    
    const handleLogin = async () => {
        try {
            const res = await fetch('http://127.0.0.1:9000/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                body: JSON.stringify({email, password})
            })

            if (!res.ok){
                setError('メールアドレスまたはパスワードが正しくありません')
                return 
            }

            const data = await res.json()
            login(data.access_token)

            const meRes = await fetch('http://127.0.0.1:9000/users/me', {
                headers: { 'Authorization': `Bearer ${data.access_token}` }
            })
            if (meRes.ok) {
                const me = await meRes.json()
                setUsername(me.username)
                localStorage.setItem('username', me.username)
            }

        } catch (e) {
            setError('Connection Error')
        }
    }

    const handleSignUp = async () => {
      try {
          const res = await fetch("http://127.0.0.1:9000/users/register",{
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({name, email, password})
          })

          if (!res.ok){
            setError('ユーザー名がほかのユーザーとかぶっている可能性があります。')
            return 
          }
          
          clear()
      } catch (e) {
          setError('ユーザー名が既に使われている可能性があります。ほかのユーザー名をお試しください。')
      }
    }

    const clear = () => {
      setIsLogin(!isLogin)
      setError('')
      setEmail('')
      setPassword('')
      setName('')
    }

    return (
    <div className='flex flex-col items-center justify-center gap-4 mt-20'>
      <h1 className='text-2xl font-bold'>{isLogin ? 'ログイン' : 'サインアップ'}</h1>
      {error && <p className='text-red-400'>{error}</p>}

      {!isLogin && (
        <input type="text" 
               placeholder='ユーザー名'
               className='border p-2 rounded w-72'
               value={name}
               onChange={e => setName(e.target.value)}
        />
      )}

      <input
        type='email'
        placeholder='メールアドレス'
        className='border p-2 rounded w-72'
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type='password'
        placeholder='パスワード'
        className='border p-2 rounded w-72'
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button
        className='bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 hover:cursor-pointer'
        onClick={isLogin ? handleLogin : handleSignUp}
      >
        {isLogin ? 'ログイン' : '登録する'}
      </button>
      <p
          className='text-sm text-gray-400 hover:text-cyan-300 cursor-pointer'
          onClick={clear}
      >
          {isLogin ? 'アカウントを作成する →' : 'ログインに戻る →'}
      </p>
    </div>
  )

}