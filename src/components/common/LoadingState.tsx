interface LoadingStateProps {
  text?: string;
}

export default function LoadingState({
  text = "Завантаження...",
}: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
      {text}
    </div>
  );
}
