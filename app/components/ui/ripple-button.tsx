"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    rippleColor?: string;
    duration?: string;
    href?: string;
}

export const RippleButton = React.forwardRef<HTMLButtonElement, RippleButtonProps>(
    (
        { children, onClick, rippleColor = "rgba(255, 255, 255, 0.4)", duration = "600ms", className = "", href, style, ...props },
        ref
    ) => {
        const [ripples, setRipples] = useState<{ x: number; y: number; size: number; id: number }[]>([]);

        useEffect(() => {
            if (ripples.length > 0) {
                const timer = setTimeout(() => {
                    setRipples([]);
                }, parseInt(duration) + 100);
                return () => clearTimeout(timer);
            }
        }, [ripples, duration]);

        const handleClick = (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
            const element = event.currentTarget;
            const rect = element.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = event.clientX - rect.left - size / 2;
            const y = event.clientY - rect.top - size / 2;

            const newRipple = { x, y, size, id: Date.now() };
            setRipples((prev) => [...prev, newRipple]);

            if (onClick) {
                onClick(event as React.MouseEvent<HTMLButtonElement>);
            }
        };

        const rippleElements = ripples.map((ripple) => (
            <span
                key={ripple.id}
                style={{
                    position: "absolute",
                    left: ripple.x,
                    top: ripple.y,
                    width: ripple.size,
                    height: ripple.size,
                    transform: "scale(0)",
                    borderRadius: "50%",
                    backgroundColor: rippleColor,
                    animation: `ripple ${duration} ease-out forwards`,
                    pointerEvents: "none",
                    zIndex: 0,
                }}
            />
        ));

        const styleElement = (
            <style jsx>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
        );

        // If href is provided, render as Link
        if (href) {
            return (
                <Link
                    href={href}
                    onClick={handleClick}
                    className={`relative overflow-hidden ${className}`}
                    style={style}
                >
                    {rippleElements}
                    <span className="relative z-10">{children}</span>
                    {styleElement}
                </Link>
            );
        }

        return (
            <button
                ref={ref}
                onClick={handleClick}
                className={`relative overflow-hidden ${className}`}
                style={style}
                {...props}
            >
                {rippleElements}
                <span className="relative z-10">{children}</span>
                {styleElement}
            </button>
        );
    }
);

RippleButton.displayName = "RippleButton";

export default RippleButton;
