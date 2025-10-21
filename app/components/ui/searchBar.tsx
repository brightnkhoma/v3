import { MusicFolderItem } from '@/app/lib/types';
import { Search, ArrowLeft, X, Loader2, Music, User, Album, Play } from 'lucide-react';
import { useState, useRef, useEffect } from "react";
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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
    compact?: boolean;
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
    loadingSuggestionId,
    compact = false
}) => {
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setShowSuggestions]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch();
        setShowSuggestions(false);
    };

    const clearSearch = () => {
        onInputChange("");
        setShowSuggestions(false);
    };

    const getItemIcon = (item: MusicFolderItem) => {
        
        return <Music size={14} />;
    };

    return (
        <div 
            ref={searchRef}
            className={cn(
                "flex flex-col relative",
                compact ? "max-w-xs" : "max-w-2xl flex-1"
            )}
        >
            <form 
                onSubmit={handleSubmit}
                className={cn(
                    "flex items-center ml-10 rounded-2xl border bg-background/80 backdrop-blur-sm transition-all duration-300",
                    "hover:border-border/80 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
                    "border-border/50 shadow-sm hover:shadow-md",
                    compact ? "h-9" : "h-12"
                )}
            >
                <div className="flex items-center pl-3 pr-2 text-muted-foreground">
                    {isLoading ? (
                        <Loader2 size={compact ? 16 : 18} className="animate-spin text-primary" />
                    ) : (
                        <Search size={compact ? 16 : 18} />
                    )}
                </div>
                
                <input 
                    className={cn(
                        "w-full border-none bg-transparent placeholder-muted-foreground focus:outline-none",
                        "text-foreground transition-all duration-200",
                        compact ? "text-sm py-2" : "text-base py-3"
                    )}
                    type="text" 
                    placeholder="Search songs, artists, albums..." 
                    value={text}
                    onChange={(e) => onInputChange(e.target.value)}
                    onFocus={() => text.length > 0 && setShowSuggestions(true)}
                />
                
                {text && (
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                        <X size={compact ? 14 : 16} />
                    </button>
                )}
                
                <button 
                    type="submit"
                    disabled={!text.trim() || isLoading}
                    className={cn(
                        "flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                        compact ? "w-8 h-8 rounded-xl mr-1" : "w-12 h-10 rounded-2xl mr-1",
                        "bg-primary hover:bg-primary/90 text-primary-foreground"
                    )}
                >
                    <Search size={compact ? 14 : 16} />
                </button>
            </form>
            
            <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto"
                    >
                        <div className="p-2 border-b border-border/50">
                            <div className="flex items-center justify-between px-3 py-2">
                                <span className="text-sm font-medium text-foreground">
                                    Search Results
                                </span>
                                <button
                                    onClick={() => setShowSuggestions(false)}
                                    className="p-1 rounded-lg hover:bg-accent transition-colors"
                                >
                                    <X size={14} className="text-muted-foreground" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-2">
                            {suggestions.map((item, index) => (
                                <motion.div
                                    key={`${item.content.contentId}-${index}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={cn(
                                        "group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200",
                                        "hover:bg-accent/50 border border-transparent hover:border-border/50",
                                        loadingSuggestionId === item.content.contentId && "bg-primary/10 border-primary/20"
                                    )}
                                    onClick={async () => await onSuggestionClick(item)}
                                >
                                    <div className={cn(
                                        "flex items-center justify-center rounded-lg transition-colors duration-200",
                                        "group-hover:bg-primary/20 group-hover:text-primary",
                                        loadingSuggestionId === item.content.contentId 
                                            ? "bg-primary text-primary-foreground" 
                                            : "bg-accent text-muted-foreground",
                                        compact ? "w-8 h-8" : "w-10 h-10"
                                    )}>
                                        {loadingSuggestionId === item.content.contentId ? (
                                            <Loader2 size={compact ? 12 : 14} className="animate-spin" />
                                        ) : (
                                            getItemIcon(item)
                                        )}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <p className={cn(
                                            "font-medium truncate transition-colors",
                                            loadingSuggestionId === item.content.contentId 
                                                ? "text-primary" 
                                                : "text-foreground group-hover:text-primary"
                                        )}>
                                            {item.content.title}
                                        </p>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {item.content.artists?.join(', ') || 'Unknown Artist'}
                                        </p>
                                    </div>
                                    
                                    <div className={cn(
                                        "opacity-0 group-hover:opacity-100 transition-all duration-200",
                                        "p-2 rounded-lg bg-primary text-primary-foreground",
                                        loadingSuggestionId === item.content.contentId && "opacity-100"
                                    )}>
                                        <Play size={12} fill="currentColor" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

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
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (show && inputRef.current) {
            inputRef.current.focus();
        }
    }, [show]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch();
        setShowSuggestions(false);
    };

    const clearSearch = () => {
        onInputChange("");
        setShowSuggestions(false);
    };

    const getItemIcon = (item: MusicFolderItem) => {
       
        return <Music size={18} />;
    };

    if (!show) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl "
        >
            <div className="flex items-center gap-3 p-4 border-b border-border/50">
                <button 
                    onClick={() => setShow(false)}
                    className="p-2 rounded-xl hover:bg-accent transition-colors duration-200"
                >
                    <ArrowLeft size={20} className="text-foreground" />
                </button>
                
                <form onSubmit={handleSubmit} className="flex-1">
                    <div className="flex items-center rounded-2xl border border-border bg-background/50 pl-3 pr-1">
                        <input 
                            ref={inputRef}
                            className="w-full border-none bg-transparent py-4 text-base placeholder-muted-foreground focus:outline-none text-foreground"
                            placeholder="Search songs, artists, albums..." 
                            type="text" 
                            value={text}
                            onChange={(e) => onInputChange(e.target.value)}
                        />
                        {text && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X size={18} />
                            </button>
                        )}
                        <button 
                            type="submit"
                            disabled={!text.trim() || isLoading}
                            className="w-14 h-12 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground rounded-2xl transition-all duration-200 flex items-center justify-center"
                        >
                            {isLoading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <Search size={20} />
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="flex-1 overflow-y-auto">
                <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-4 space-y-2"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-foreground">
                                    Search Results
                                </h3>
                                <button
                                    onClick={() => setShowSuggestions(false)}
                                    className="p-2 rounded-lg hover:bg-accent transition-colors"
                                >
                                    <X size={16} className="text-muted-foreground" />
                                </button>
                            </div>
                            
                            {suggestions.map((item, index) => (
                                <motion.div
                                    key={`${item.content.contentId}-${index}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={cn(
                                        "flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200",
                                        "hover:bg-accent/50 border border-transparent hover:border-border/50",
                                        loadingSuggestionId === item.content.contentId && "bg-primary/10 border-primary/20"
                                    )}
                                    onClick={async () => await onSuggestionClick(item)}
                                >
                                    <div className={cn(
                                        "flex items-center justify-center rounded-xl transition-colors duration-200",
                                        loadingSuggestionId === item.content.contentId 
                                            ? "bg-primary text-primary-foreground" 
                                            : "bg-accent text-muted-foreground",
                                        "w-12 h-12"
                                    )}>
                                        {loadingSuggestionId === item.content.contentId ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            getItemIcon(item)
                                        )}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <p className={cn(
                                            "text-base font-medium truncate",
                                            loadingSuggestionId === item.content.contentId 
                                                ? "text-primary" 
                                                : "text-foreground"
                                        )}>
                                            {item.content.title}
                                        </p>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {item.content.artists?.join(', ') || 'Unknown Artist'}
                                        </p>
                                    </div>
                                    
                                    <div className={cn(
                                        "p-2 rounded-lg bg-primary text-primary-foreground transition-all duration-200",
                                        loadingSuggestionId === item.content.contentId && "animate-pulse"
                                    )}>
                                        <Play size={14} fill="currentColor" />
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {text && !isLoading && suggestions.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-16 px-4 text-center"
                    >
                        <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
                            <Search size={24} className="text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            No results found
                        </h3>
                        <p className="text-muted-foreground">
                            Try different keywords or check your spelling
                        </p>
                    </motion.div>
                )}

                {!text && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-16 px-4 text-center"
                    >
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <Search size={24} className="text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            Search Zathuplay
                        </h3>
                        <p className="text-muted-foreground">
                            Find your favorite songs, artists, and albums
                        </p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

interface SearchTriggerButtonProps {
    show: boolean;
    setShow: (shown: boolean) => void;
}

export const SearchTriggerButton: React.FC<SearchTriggerButtonProps> = ({ setShow, show }) => {
    if (show) return null;

    return (
        <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShow(true)} 
            className="p-3 hover:bg-accent rounded-xl transition-colors duration-200"
        >
            <Search size={20} className="text-foreground" />
        </motion.button>
    );
};