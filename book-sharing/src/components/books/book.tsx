import { useEffect, useState } from "react";
import { FcLikePlaceholder } from "react-icons/fc";
import { BsShare } from "react-icons/bs";

type Book = {
    image: string;
    summary_title: string;
    book_title: string;
    author: string;
    like: number;
    review?: string;
    purchase_url?: string;
    rating?: number
}
// write props
export function Book({image = "/images/user.png",
                      summary_title = "これが面白い！！", 
                      book_title = "TestTitle", 
                      author = "TestAuthor", 
                      review = "", 
                      purchase_url="",
                      rating=0}: Book) {

    const [clicked, setClicked] = useState<boolean>(false);

    useEffect(() => {
        if (!clicked) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = originalOverflow;
        }
    }, [clicked]);

    return (
        <>
            <div className='flex h-[322px] w-[300px] cursor-pointer flex-col items-center overflow-hidden rounded-3xl border-2 bg-gray-800 p-5 group' onClick={() => setClicked(!clicked)}>
                <img src={`${image}`} alt="" className='mb-5 h-[120px] w-[200px] shrink-0 cursor-pointer object-cover transition-transform duration-300 group-hover:scale-110'/>
                <h2 className="w-full cursor-pointer truncate">{summary_title}</h2>
                <h3 className="w-full cursor-pointer truncate">Title: {book_title}</h3>
                <h4 className="w-full cursor-pointer truncate">Author: {author}</h4>
                <div className='flex items-center gap-4 mt-3'>
                    <div className='rounded-full p-2 border-cyan-100 border-2 hover:cursor-pointer hover:border-cyan-400 transition-colors duration-200' onClick={e => e.stopPropagation()}><FcLikePlaceholder /></div>
                    <div className='rounded-full p-2 border-cyan-100 border-2 hover:cursor-pointer hover:border-cyan-400' onClick={e => e.stopPropagation()}><BsShare /></div>
                </div>
            </div>

            {clicked && (
                <div
                    className='fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-gray-950/75 px-4 pb-6 pt-28 backdrop-blur-sm sm:pt-32'
                    onClick={() => setClicked(false)}
                >
                    <div
                        className='post-modal-scroll relative h-[calc(100vh-12rem)] max-h-[720px] w-full max-w-3xl overflow-y-auto overscroll-contain rounded-2xl border border-slate-700/80 bg-slate-950 px-5 pb-5 pt-14 shadow-2xl shadow-black/60 sm:px-8 sm:pb-8'
                        onClick={e => e.stopPropagation()}
                    >
                        {/* 閉じるボタン */}
                        <button
                            type='button'
                            aria-label='閉じる'
                            onClick={() => setClicked(false)}
                            className='absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-lg leading-none text-gray-300 shadow hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400'
                        >
                            ✕
                        </button>

                        {/* 画像 */}
                        <div className='flex h-56 items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 sm:h-72'>
                            <img src={image} alt="" className='h-full w-full object-contain'/>
                        </div>

                        <div className='px-2 py-6 text-center'>
                            {/* タイトル */}
                            <h2 className='text-2xl font-bold text-white mb-3'>{summary_title}</h2>
                            <h3 className='text-sm text-gray-400 mb-1'>📖 {book_title}</h3>
                            <h3 className='text-sm text-gray-400 mb-2'>✍️ {author}</h3>

                            {/* 評価 */}
                            {rating > 0 && (
                                <h3 className='text-amber-400'>
                                    {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
                                </h3>
                            )}
                        </div>

                        {/* 本文 */}
                        <div className='rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-4'>
                            <p className='text-sm text-gray-300 leading-relaxed whitespace-pre-wrap'>
                                {review || '感想が記載されていません'}
                            </p>
                        </div>

                        {/* 購入リンク */}
                        {purchase_url && (
                            <div className='shrink-0 pt-4 text-center'>
                                <a
                                    href={purchase_url}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='inline-block text-xs text-teal-400 hover:text-teal-300 border border-teal-700 px-3 py-1.5 rounded-lg transition-colors'
                                >
                                    🛒 購入リンクを開く
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </>
    )

}
