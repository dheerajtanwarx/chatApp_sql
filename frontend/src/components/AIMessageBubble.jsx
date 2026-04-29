import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function AIMessageBubble({ text, time }) {
  return (
    <div className="chat chat-start">
      <div className="chat-bubble relative bg-gradient-to-br from-slate-800 to-slate-800/80 text-slate-200 border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
        {/* AI badge */}
        <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-cyan-500/15">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 text-[10px] font-semibold tracking-wide uppercase">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            AI
          </span>
        </div>

        {/* Markdown content */}
        <div className="ai-markdown prose prose-invert prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
        </div>

        {/* Timestamp */}
        <p className="text-xs mt-2 opacity-60 flex items-center gap-1">
          {new Date(time).toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

export default AIMessageBubble;
