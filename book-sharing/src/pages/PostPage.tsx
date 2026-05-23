import { useState, useRef, type ChangeEvent, type DragEvent } from 'react'
import { useAuth } from '../context/AuthContext'

type Props = {
    onSuccess?: () => void;
}

type Errors = {
    postTitle?: string
    bookName?: string
    review?: string
}

export function PostPage({ onSuccess }: Props) {
    const { token } = useAuth()

    const [postTitle, setPostTitle]   = useState('')
    const [bookName, setBookName]     = useState('')
    const [rating, setRating]         = useState(3)
    const [purchaseUrl, setPurchaseUrl] = useState('')
    const [review, setReview]         = useState('')
    const [image, setImage]           = useState<File | null>(null)
    const [preview, setPreview]       = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isLoading, setIsLoading]   = useState(false)
    const [errors, setErrors]         = useState<Errors>({})
    const fileInputRef = useRef<HTMLInputElement>(null)
    
    const applyImage = (file: File) => {
        setImage(file)
        setPreview(URL.createObjectURL(file))
    }

    const handleFileDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) applyImage(file)
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) applyImage(file)
    }

    // タイトルや書籍の名前が記入されているかどうかを確認
    const validate = (): boolean => {
        const newErrors: Errors = {}
        if (!postTitle.trim()) newErrors.postTitle = 'タイトルが必要です'
        if (!bookName.trim())  newErrors.bookName  = '本の名前が必要です'
        if (!review.trim())    newErrors.review    = '感想、まとめが必要です'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validate()) return
        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append('post_title', postTitle)
            formData.append('book_name', bookName)
            formData.append('rating', String(rating))
            formData.append('purchase_url', purchaseUrl)
            formData.append('review', review)
            if (image) {
                formData.append('image', image)
            }

            const res = await fetch('http://127.0.0.1:9000/posts', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            })

            if (!res.ok){
                setErrors({ postTitle: '投稿に失敗しました。もう一度お試しください。'})
                return;
            }

            setPostTitle('')
            setBookName('')
            setRating(3)
            setPurchaseUrl('')
            setReview('')
            setImage(null)
            setPreview(null)
            setErrors({})

            onSuccess?.()

        } catch {
            setErrors({ postTitle: '投稿に失敗しました。もう一度お試しください '})
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto px-4 pb-8 pt-14 sm:px-8">
            <h1 className="text-xl font-medium mb-6">本の感想を投稿する</h1>

            {/* タイトル名 */}
            <div className="mb-5">
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                タイトル名 <span className="text-red-400">*</span>
                </label>
                <input
                type="text"
                value={postTitle}
                onChange={e => setPostTitle(e.target.value)}
                placeholder="例：夜は短し歩けよ乙女を読んで"
                className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
                />
                {errors.postTitle && <p className="text-red-400 text-xs mt-1">{errors.postTitle}</p>}
            </div>

            {/* 本のイメージ */}
            <div className="mb-5">
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                本のイメージ
                </label>
                {preview ? (
                <div className="relative">
                    <img src={preview} alt="preview" className="w-full h-48 object-cover rounded-lg" />
                    <button
                    onClick={() => { setImage(null); setPreview(null) }}
                    className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded"
                    >
                    削除
                    </button>
                </div>
                ) : (
                <div
                    onDrop={handleFileDrop}
                    onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full h-40 rounded-lg border border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors
                    ${isDragging ? 'border-cyan-400 bg-cyan-900/10' : 'border-gray-600 bg-gray-800 hover:border-gray-500'}`}
                >
                    <span className="text-2xl">🖼</span>
                    <p className="text-sm text-gray-400">クリックまたはドラッグ&ドロップ</p>
                    <p className="text-xs text-gray-600">PNG, JPG, WEBP — 最大5MB</p>
                </div>
                )}
                <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="hidden"
                />
            </div>

            {/* 区切り線 */}
            <div className="border-t border-gray-700 my-6" />

            {/* 本の名前 */}
            <div className="mb-5">
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                本の名前 <span className="text-red-400">*</span>
                </label>
                <input
                type="text"
                value={bookName}
                onChange={e => setBookName(e.target.value)}
                placeholder="例：夜は短し歩けよ乙女"
                className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
                />
                {errors.bookName && <p className="text-red-400 text-xs mt-1">{errors.bookName}</p>}
            </div>

            {/* 評価 */}
            <div className="mb-5">
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                評価
                </label>
                <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                    <span
                    key={n}
                    onClick={() => setRating(n)}
                    className={`text-2xl cursor-pointer transition-colors ${n <= rating ? 'text-amber-400' : 'text-gray-600'}`}
                    >
                    ★
                    </span>
                ))}
                </div>
            </div>

            {/* 購入リンク */}
            <div className="mb-5">
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                購入リンク
                </label>
                <input
                type="url"
                value={purchaseUrl}
                onChange={e => setPurchaseUrl(e.target.value)}
                placeholder="https://www.amazon.co.jp/..."
                className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
                />
                <p className="text-xs text-gray-600 mt-1">AmazonやそのほかのURLを貼り付けてください</p>
            </div>

            <div className="border-t border-gray-700 my-6" />

            {/* 感想・まとめ */}
            <div className="mb-5">
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                感想・まとめ <span className="text-red-400">*</span>
                </label>
                <textarea
                value={review}
                onChange={e => setReview(e.target.value)}
                placeholder={`この本を読んでどう感じましたか？印象に残ったシーンや、おすすめしたい人についても書いてみましょう。\n\n※ネタバレを含む場合はその旨を最初に記載してください。`}
                rows={8}
                className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 resize-y leading-relaxed"
                />
                <div className="flex justify-between mt-1">
                {errors.review
                    ? <p className="text-red-400 text-xs">{errors.review}</p>
                    : <span />
                }
                <p className="text-xs text-gray-600">{review.length} 文字</p>
                </div>
            </div>

            {/* ボタン */}
            <div className="flex gap-3 mt-6">
                <button
                onClick={() => {}}
                className="px-5 py-3 rounded-lg border border-gray-700 text-sm text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors"
                >
                下書き保存
                </button>
                <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 py-3 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                {isLoading ? '投稿中...' : '投稿する'}
                </button>
            </div>
        </div>
    )

}
