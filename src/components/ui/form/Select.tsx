import { useState, useRef, useEffect } from "react";
import './Select.css';
interface SelectProps {
    children?: React.ReactNode;
    options: string[];
    onChange: (value: string) => void;
    value: string;
    style?: string;
}

export default function Select({
    children,
    options,
    onChange,
    value
}: SelectProps) {

    const [open, setOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    // fechar ao clicar fora
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                selectRef.current &&
                !selectRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="custom-select" ref={selectRef}>
            {children}

            <button
                type="button"
                className="select-button"
                onClick={() => setOpen(!open)}
            >
                {value}
                <span className={`arrow ${open ? "rotate" : ""}`}>
                    ▾
                </span>
            </button>

            {open && (
                <ul className="select-options">
                    {options.map((option) => (
                        <li
                            key={option}
                            className={option === value ? "active" : ""}
                            onClick={() => {
                                onChange(option);
                                setOpen(false);
                            }}
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}