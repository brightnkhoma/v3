"use client"

import { Card } from "@/components/ui/card";

interface FieldInputProps {
    name: string;
    value: string;
    onValueChange: (value: string) => void;
    icon: React.ReactNode;
    className?: string;
    placeholder?: string;
    type?: string;
    disabled?: boolean;
}

const FieldInput: React.FC<FieldInputProps> = ({
    icon,
    name,
    onValueChange,
    value,
    className = "",
    placeholder,
    type = "text",
    disabled = false
}) => {
    return (
        <Card 
            className={`
                flex flex-row items-center justify-between 
                bg-background hover:bg-black/15 
                p-3 rounded-xl 
                transition-colors duration-200
                focus-within:ring-2 focus-within:ring-primary/50
                ${disabled ? "opacity-70 cursor-not-allowed" : ""}
                ${className}
            `}
        >
            <div className="flex flex-col flex-1 mr-2">
                <label 
                    htmlFor={name}
                    className="text-xs text-muted-foreground mb-1"
                >
                    {name}
                </label>
                <input
                    id={name}
                    className="
                        w-full bg-transparent 
                        font-medium focus:outline-none 
                        placeholder:text-muted-foreground/70
                        disabled:cursor-not-allowed
                    "
                    placeholder={placeholder || name}
                    value={value}
                    onChange={(e) => onValueChange(e.target.value)}
                    type={type}
                    disabled={disabled}
                    aria-label={name}
                />
            </div>
            
            <div className="text-muted-foreground">
                {icon}
            </div>
        </Card>
    );
}

export { FieldInput };