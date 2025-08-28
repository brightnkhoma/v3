import { createNewFolder } from "@/app/lib/dataSource/contentDataSource";
import { showToast } from "@/app/lib/dataSource/toast";
import { setFolder } from "@/app/lib/local/redux/reduxSclice"
import { RootState, useAppDispatch, useAppSelector } from "@/app/lib/local/redux/store"
import { AccountType, Library, User } from "@/app/lib/types";
import { FolderClosedIcon } from "lucide-react"
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react"


export const FolderInput = () => {
    const { folder,user } = useAppSelector((state: RootState) => state.auth);
    const dispatch = useAppDispatch();
    const inputRef = useRef<HTMLInputElement>(null);
    const hasFocused = useRef(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const onUpdateForm = (e: ChangeEvent<HTMLInputElement>) => {
        if (folder) {
            dispatch(setFolder({...folder, folderName: e.target.value}));
        }
    };

    const handleCreateFolder = async (e: FormEvent) => {
        e.preventDefault();
        if (!folder || !folder.folderName.trim()) {
            dispatch(setFolder(null));
            return;
        }

        setIsLoading(true);
        


        try {
            await createNewFolder(
                user,folder
              ,
                () => {
                    dispatch(setFolder(null));
                    setIsLoading(false);
                },
                () => {
                    setIsLoading(false);
                    showToast("Failed to create folder.")
                }
            );
        } catch (error) {
            setIsLoading(false);
            console.error('Error in folder creation:', error);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            dispatch(setFolder(null));
        }
    };

    useEffect(() => {
        if (inputRef.current && folder && !hasFocused.current) {
            const input = inputRef.current;
            input.focus();
            input.setSelectionRange(0, input.value.length);
            hasFocused.current = true;
        }
    }, [folder]);

    return (
        <div className="flex items-center gap-2 px-1 py-[2px] bg-white border border-blue-400 shadow-[0_0_0_1px_rgba(0,0,0,0.1)]">
            <FolderClosedIcon size={20} className="text-[#7fadf2]" />
            <form onSubmit={handleCreateFolder} className="flex-1">
                <input 
                    ref={inputRef}
                    placeholder="New folder"
                    value={folder?.folderName || ''}
                    className={`w-full px-0 py-0 text-[12.5px] leading-4 border-none focus:outline-none focus:ring-0 ${
                        isLoading ? 'text-gray-400' : 'text-[#000000]'
                    }`}
                    onChange={onUpdateForm}
                    onKeyDown={handleKeyDown}
                    spellCheck={false}
                    disabled={isLoading}
                />
                <button type="submit" className="hidden" />
            </form>
            {isLoading && (
                <div className="ml-2">
                    <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}
        </div>
    );
};