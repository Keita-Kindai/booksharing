import { useEffect, useState } from "react";
import { Book } from "../components/books/book";
import { PostPage } from './PostPage'
import { useDebounce } from "use-debounce";
import { apiUrl } from "../lib/api";

// 投稿が持っているべき情報です。
type Post = {
    id: number
    post_title: string
    book_name: string
    rating: number
    review: string
    image_path: string | null
    purchase_url: string
    author: string
}

// propsとしてユーザーが指定されているかどうかを確認します。
type Props = {
    myBookUsers?: string
    onMyBooksConsumed?: () => void
    goToMyBooks?: () => void
}

export function MainPage({ myBookUsers, onMyBooksConsumed }: Props) {

    // False = 書籍名検索, True = ユーザー名検索
    const [search, setSearch]                   = useState(true);
    // 投稿状態かどうか
    const [isPostOpen, setIsPostOpen]           = useState(false);
    // 書籍名検索時に保持される文字列
    const [searchTitleWords, setSearchWords]    = useState<string>("");
    // 画面に表示される投稿一覧
    const [posts, setPosts]                     = useState<Post[]>([])
    // ユーザー名検索時に保持される文字列
    const [searchUserWords, setSearchUserWords] = useState<string>("");        

    // デバウンスを用いて少し遅延。（文字が変わるたびに大量に送信してしまうため）
    const [titleWords] = useDebounce(searchTitleWords, 300);
    const [userName]   = useDebounce(searchUserWords, 300)

    // プロフィールのmyBooksがクリックされたら自分が投稿したものの一覧を見れる。
    useEffect(() => {
        if (myBookUsers) {
            setSearch(false)
            // setPosts([])
            console.log(myBookUsers)
            setSearchUserWords(myBookUsers)
            onMyBooksConsumed?.()
            console.log(myBookUsers)
        }
    }, [myBookUsers])

    useEffect(() => {
        if (!search) return  // ユーザータブにいるときは無視
        if (titleWords === '') {
            fetchPosts()
        } else {
            fetchTitlePosts()
        }
    }, [titleWords, search])

    useEffect(() => {
        if (search) return   // 本タブにいるときは無視
        if (userName === '') {
            setPosts([])     // 空のときは結果をリセット
        } else {
            fetchUser()
        }
    }, [userName, search])

    // 投稿全体をフェッチ
    const fetchPosts = async () => {
        try {
            const res = await fetch(apiUrl('/posts'),{
                method: 'GET',
            })
           if (res.ok) setPosts(await res.json())
        } catch (e) {
            console.error(e)
        }
    }

    // タイトルと部分一致するものだけをフェッチ
    const fetchTitlePosts = async  () => {
        try {
            const res = await fetch(apiUrl('/posts/search/', { title: titleWords }),{
                method: 'GET',
            })
            if (res.ok) setPosts(await res.json())
        } catch(e){
            console.error(e);
        }
    }

    // ユーザー名と一致するものだけをフェッチ
    const fetchUser = async  () => {
        try {
            const res = await fetch(apiUrl('/users/search', { user_name: userName }),{
                method: 'GET',
            })
            if (res.ok) setPosts(await res.json())
        } catch(e){
            console.error(e);
        }
    }

    // search for users と　booksが切り替わったときに情報をリセットする。
    const handleTabSwitch = (isSearch: boolean) => {
        setSearch(isSearch);
        setPosts([])
        setSearchWords('')
        setSearchUserWords('')
    }

    return (
    <div className='relative min-h-screen'>
        <div className={`flex text-center justify-center gap-12 mb-8`}>
            <div className={`text-2xl font-bold hover:text-cyan-300 hover:cursor-pointer ${search? 'text-blue-300': ''}`} onClick={() => handleTabSwitch(true)}>Searching for books</div>
            <div className={`text-2xl font-bold hover:text-cyan-300 hover:cursor-pointer ${search? '': 'text-blue-300'}`} onClick={() => handleTabSwitch(false)}>Searching for users</div>
        </div>
        
        {search ? (
        <div className='transition-opacity duration-300'>
            <div className='mb-6 text-center'>Here is a Book Searching Area!</div>

            <div className="mb-7 flex items-center justify-center">
                <input type="text" placeholder="デザイン入門教室" value={searchTitleWords} className="border-2 p-3 rounded-2xl w-3/6 focus:outline-none" onChange={e => setSearchWords(e.target.value)}/>
            </div>

            <div className='flex text-center justify-center flex-wrap gap-8'>
                {posts.length === 0 ? (
                    <p className='text-gray-400'>Unfortunately, There's no posts</p>
                ) : (
                    posts.map(post => (
                        <Book
                            key={post.id}
                            image={post.image_path ? apiUrl(post.image_path) : '/images/user.png'}
                            summary_title={post.post_title}
                            book_title={post.book_name}
                            author={post.author}
                            like={0}
                            review={post.review}
                            rating={post.rating}
                        />
                    ))
                )}
            </div>
        </div>
        ) : (
        <div className='transition-opacity duration-300'>
            <div className='mb-6 text-center'>You can search for users!!</div>

            <div className="mb-7 flex items-center justify-center">
                <input type="text" placeholder="Litms" value={searchUserWords} className="border-2 p-3 rounded-2xl w-3/6 focus:outline-none" onChange={e => setSearchUserWords(e.target.value)}/>
            </div>

            <div className='flex text-center justify-center flex-wrap gap-8'>
                {posts.length === 0 ? (
                    <p className='text-gray-400'>Unfortunately, There's no posts</p>
                ) : (
                    posts.map(post => (
                        <Book
                            key={post.id}
                            image={post.image_path ? apiUrl(post.image_path) : '/images/user.png'}
                            summary_title={post.post_title}
                            book_title={post.book_name}
                            author={post.author}
                            like={0}
                            review={post.review}
                            rating={post.rating}
                        />
                    ))
                )}
            </div>
        </div>
        )}

        { isPostOpen && (
                <div
                className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-gray-950/75 px-4 pb-6 pt-28 backdrop-blur-sm sm:pt-32"
                onClick={e => { if (e.target === e.currentTarget) setIsPostOpen(false) }}
                >
                    <div className="relative h-[calc(100vh-12rem)] max-h-[720px] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700/80 bg-slate-950 shadow-2xl shadow-black/60">
                        <button
                            type="button"
                            aria-label="閉じる"
                            onClick={() => setIsPostOpen(false)}
                            className="absolute right-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-lg leading-none text-gray-300 shadow hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        >
                            ✕
                        </button>
                        <PostPage onSuccess={() => {
                            setIsPostOpen(false)
                            fetchPosts()
                        }} />
                    </div>
                </div>
        )}

        <button onClick={() => setIsPostOpen(true)} className='fixed bottom-8 right-8 w-14 h-14 bg-teal-600 hover:bg-teal.500 text-white rounded-full shadow-lg flex items-center justify-center text-2xl z-30 transition-colors'>
            ✏️
        </button>
    </div>
    )

}
