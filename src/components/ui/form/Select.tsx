import { useState, useRef, useEffect } from "react";
import '../../styles/Select.css';
import SimpleButton from "../buttons/SimpleButton";

interface SelectProps {
    children?: React.ReactNode;
    options: string[];
    onChange: (value: string) => void;
    value: string;
    style?: string;
    compacto?: boolean;
    icon?: string;
}

export default function Select({
    children,
    options,
    onChange,
    value,
    compacto = false,
    icon = "Filter"
}: SelectProps) {

    const [open, setOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    // Fechar ao clicar fora
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

            <div className="circleButton">
                <SimpleButton
                    onClick={() => setOpen(!open)}
                    icon={icon}
                    tema="select"
                >
                    {!compacto && value}
                </SimpleButton>
            </div>

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