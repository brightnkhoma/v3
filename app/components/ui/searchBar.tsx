import { MusicFolderItem } from '@/app/lib/types';
import {Search, ArrowLeft, X, Loader2} from 'lucide-react'
import { useState, useRef, useEffect } from "react"

interface SearchBarProps {
    text: string;
    onInputChange: (value: string) => void;
    onSearch: (text?: string) => void;
    suggestions: MusicFolderItem[];
    showSuggestions: boolean;
    setShowSuggestions: (show: boolean) => void;
    isLoading: boolean;
    onSuggestionClick: (item: MusicFolderItem) => Promise<void>;
    loadingSuggestionId: string | null;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    text,
    onInputChange,
    onSearch,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    isLoading,
    onSuggestionClick,
    loadingSuggestionId
}) => {
    const searchRef = useRef<HTMLDivElement>(null)

    // useEffect(() => {
    //     const handleClickOutside = (event: MouseEvent) => {
    //         if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
    //             setShowSuggestions(false)
    //         }
    //     }

    //     document.addEventListener('mousedown', handleClickOutside)
    //     return () => document.removeEventListener('mousedown', handleClickOutside)
    // }, [setShowSuggestions])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSearch()
    }

    return (
        <div className="hidden max-w-[7%] w-full sm:max-w-[30%] lg:max-w-[40%] mx-auto sm:flex lg:flex flex-col relative" ref={searchRef}>
            <form onSubmit={handleSubmit} className="flex flex-row items-center rounded-2xl border border-gray-300 dark:border-gray-600 pl-3 bg-white dark:bg-black transition-all duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 dark:focus-within:ring-blue-800">
                <input 
                    className="w-full border-none focus:outline-0 flex-1 bg-transparent py-2 text-sm placeholder-gray-500 dark:placeholder-gray-400"
                    type="text" 
                    placeholder="Search songs, artists, albums..." 
                    value={text}
                    onChange={(e) => onInputChange(e.target.value)}
                    onFocus={() => text.length > 2 && setShowSuggestions(true)}
                />
                {text && (
                    <button
                        type="button"
                        onClick={() => {
                            onInputChange("")
                            setShowSuggestions(false)
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X size={16} />
                    </button>
                )}
                <button 
                    type="submit"
                    className="w-12 h-10 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center rounded-r-2xl transition-colors"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Loader2 size={20} className="animate-spin text-blue-500" />
                    ) : (
                        <Search size={20} className="text-gray-600 dark:text-gray-400" />
                    )}
                </button>
            </form>
            
            {showSuggestions && suggestions.length > 0 && (
                                   <div>
                <X onClick={()=>setShowSuggestions(false)} size={18} className='ml-2 animate-in text-red-500 dark:text-red-200 cursor-pointer'/>

                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {suggestions.map((item) => (
                        <div
                            key={item.content.contentId}
                            className={`px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                                loadingSuggestionId === item.content.contentId ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                            onClick={async () => {
                               await onSuggestionClick(item)
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                                    {loadingSuggestionId === item.content.contentId ? (
                                        <Loader2 size={14} className="animate-spin text-blue-500" />
                                    ) : (
                                        <Search size={14} className="text-gray-500" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {item.content.title}
                                        {loadingSuggestionId === item.content.contentId && (
                                            <span className="ml-2 text-blue-500">Loading...</span>
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {item.content.artists?.join(', ')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                                   </div>
            )}
        </div>
    )
}

interface SearchField2Props extends SearchTriggerButtonProps {
    text: string;
    onInputChange: (value: string) => void;
    onSearch: (text?: string) => void;
    suggestions: MusicFolderItem[];
    showSuggestions: boolean;
    setShowSuggestions: (show: boolean) => void;
    isLoading: boolean;
    onSuggestionClick: (item: MusicFolderItem) => Promise<void>;
    loadingSuggestionId: string | null;
}

export const SearchField2: React.FC<SearchField2Props> = ({
    setShow,
    show,
    text,
    onInputChange,
    onSearch,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    isLoading,
    onSuggestionClick,
    loadingSuggestionId
}) => {
    if (!show) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSearch()
    }

    return (
        <div className="flex absolute sm:hidden lg:hidden flex-col w-full h-screen top-0 left-0 bg-white dark:bg-black p-4 z-50">
            <div className="flex flex-row items-center w-full gap-3 mb-4">
                <BackButton setShow={setShow} show={show} />
                <form onSubmit={handleSubmit} className="flex-1 flex flex-row items-center border border-gray-300 dark:border-gray-600 rounded-2xl pl-3 bg-white dark:bg-black">
                    <input 
                        className="w-full border-none focus:outline-0 flex-1 bg-transparent py-3 text-base placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Search songs, artists, albums..." 
                        type="text" 
                        value={text}
                        onChange={(e) => onInputChange(e.target.value)}
                        autoFocus
                    />
                    {text && (
                        <button
                            type="button"
                            onClick={() => onInputChange("")}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <X size={18} />
                        </button>
                    )}
                    <button 
                        type="submit"
                        className="w-14 h-12 cursor-pointer bg-blue-500 hover:bg-blue-600 flex items-center justify-center rounded-r-2xl transition-colors"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 size={20} className="animate-spin text-white" />
                        ) : (
                            <Search size={20} className="text-white" />
                        )}
                    </button>
                </form>
            </div>

            {showSuggestions && suggestions.length > 0 && (
                              <div>
                                  <X onClick={()=>setShowSuggestions(false)} size={18} className='ml-2 animate-in text-red-500 dark:text-red-200 cursor-pointer'/>

                <div className="flex-1 overflow-y-auto">
                    {suggestions.map((item,i) => (
                        <div
                            key={i}
                            className={`px-4 py-4 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700 ${
                                loadingSuggestionId === item.content.contentId ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                            onClick={async () => {

                               await onSuggestionClick(item)
                            }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                                    {loadingSuggestionId === item.content.contentId ? (
                                        <Loader2 size={16} className="animate-spin text-blue-500" />
                                    ) : (
                                        <Search size={16} className="text-gray-500" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-base font-medium text-gray-900 dark:text-white truncate">
                                        {item.content.title}
                                        {loadingSuggestionId === item.content.contentId && (
                                            <span className="ml-2 text-blue-500">Loading...</span>
                                        )}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {item.content.artists?.join(', ')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                              </div>
            )}

            {text && !isLoading && suggestions.length === 0 && (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">No results found</p>
                </div>
            )}
        </div>
    )
}

interface SearchTriggerButtonProps {
    show: boolean;
    setShow: (shown: boolean) => void;
}

export const SearchTriggerButton: React.FC<SearchTriggerButtonProps> = ({ setShow, show }) => {
    if (show) return null;

    return (
        <button 
            onClick={() => setShow(true)} 
            className="sm:hidden lg:hidden mx-auto p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
            <Search size={24} className="text-gray-600 dark:text-gray-400" />
        </button>
    )
}

const BackButton: React.FC<SearchTriggerButtonProps> = ({ setShow, show }) => {
    return (
        <button 
            onClick={() => setShow(!show)} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
            <ArrowLeft size={24} className="text-gray-600 dark:text-gray-400" />
        </button>
    )
}