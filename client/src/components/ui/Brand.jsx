import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
export default function Brand() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-2 font-bold tracking-tight text-ink dark:text-white"
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-lavender text-white">
        <Sparkles size={18} />
      </span>
      <span>
        English Trainer <span className="text-lavender">AI</span>
      </span>
    </Link>
  );
}
