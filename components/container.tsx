import { type ReactNode } from "react";

type ContainerProps = {
  className?: string;
  children: ReactNode;
};

export function Container({ className = "", children }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-4 ${className}`.trim()}>
      {children}
    </div>
  );
}
