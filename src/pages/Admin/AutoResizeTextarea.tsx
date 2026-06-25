import { useEffect, useRef } from "react";

export default function AutoResizeTextarea(
    props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
    const ref = useRef<HTMLTextAreaElement>(null);

    function resize() {
        const textarea = ref.current;
        if (!textarea) return;

        requestAnimationFrame(() => {
            textarea.style.height = "auto";
            textarea.style.height = `${Math.min(textarea.scrollHeight, 500)}px`;
        });
    }

    useEffect(() => {
        resize();
    }, []);

    return (
        <textarea
            ref={ref}
            rows={1}
            onInput={resize}
            {...props}
        />
    );
}