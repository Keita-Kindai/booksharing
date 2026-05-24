import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiUrl } from '../lib/api'

export function LoginPage() {
    const { login, setUsername } = useAuth()
    const [isLogin, setIsLogin] = useState(true)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    
    const handleLogin = async () => {
        try {
            const res = await fetch(apiUrl('/users/login'), {
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

            const meRes = await fetch(apiUrl('/users/me'), {
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
          const res = await fetch(apiUrl('/users/register'),{
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
          setError('通信に失敗しました。時間をおいてもう一度お試しください。')
      }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (isLogin) {
        handleLogin()
      } else {
        handleSignUp()
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
    <form className='flex flex-col items-center justify-center gap-4 mt-20' onSubmit={handleSubmit}>
      <h1 className='text-2xl font-bold'>{isLogin ? 'ログイン' : 'サインアップ'}</h1>
      {error && <p className='text-red-400'>{error}</p>}

      {!isLogin && (
        <input type="text" 
               name='username'
               autoComplete='username'
               placeholder='ユーザー名'
               className='border p-2 rounded w-72'
               value={name}
               onChange={e => setName(e.target.value)}
        />
      )}

      <input
        type='email'
        name='email'
        autoComplete='email'
        placeholder='メールアドレス'
        className='border p-2 rounded w-72'
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type='password'
        name='password'
        autoComplete={isLogin ? 'current-password' : 'new-password'}
        placeholder='パスワード'
        className='border p-2 rounded w-72'
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button
        type='submit'
        className='bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 hover:cursor-pointer'
      >
        {isLogin ? 'ログイン' : '登録する'}
      </button>
      <p
          className='text-sm text-gray-400 hover:text-cyan-300 cursor-pointer'
          onClick={clear}
      >
          {isLogin ? 'アカウントを作成する →' : 'ログインに戻る →'}
      </p>
    </form>
  )

}
