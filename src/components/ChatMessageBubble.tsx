import React, { useState, useMemo } from 'react';
import { ChatMessage } from '../types';
import { User, Copy, Check, Volume2, VolumeX, Sparkles, Mail, Send, Zap, ArrowRight } from 'lucide-react';
import { marked } from 'marked';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  onOpenGmail?: (prefill?: { to?: string; subject?: string; body?: string }) => void;
  onOpenConnectors?: () => void;
}

// Convert LaTeX \begin{array} tables and clean all broken inline LaTeX ($1\text{G}$, $c$, etc.)
function preprocessContent(rawText: string): string {
  if (!rawText) return '';

  let text = rawText;

  // 1. Convert LaTeX array tables: $$\begin{array}{|l|l|...} ... \end{array}$$
  text = text.replace(/\$\$\\begin\{array\}\{.*?\}([\s\S]*?)\\end\{array\}\$\$/g, (match, inner) => {
    try {
      const rows = inner
        .split(/\\\\/)
        .map((r: string) => r.replace(/\\hline/g, '').trim())
        .filter((r: string) => r.length > 0);

      if (rows.length < 2) return match;

      const parsedRows = rows.map((row: string) => {
        return row.split('&').map((cell: string) => {
          let c = cell.trim();
          c = c.replace(/\\textbf\{([^}]*)\}/g, '**$1**');
          c = c.replace(/\\mathbf\{([^}]*)\}/g, '**$1**');
          c = c.replace(/\\text\{([^}]*)\}/g, '$1');
          c = c.replace(/\\\s+/g, ' ');
          c = c.replace(/\\&/g, '&');
          return c.trim();
        });
      });

      const headers = parsedRows[0];
      const dataRows = parsedRows.slice(1);

      const mdHeader = '| ' + headers.join(' | ') + ' |';
      const mdDivider = '| ' + headers.map(() => '---').join(' | ') + ' |';
      const mdData = dataRows.map((r: string[]) => '| ' + r.join(' | ') + ' |').join('\n');

      return '\n\n' + mdHeader + '\n' + mdDivider + '\n' + mdData + '\n\n';
    } catch {
      return match;
    }
  });

  // 2. Clean display equations: $$ ... $$ -> formatted block
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
    let f = formula.trim();
    f = f.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1 / $2)');
    f = f.replace(/\\sqrt\{([^}]*)\}/g, '√($1)');
    f = f.replace(/\\text\{([^}]*)\}/g, '$1');
    f = f.replace(/\\textbf\{([^}]*)\}/g, '$1');
    f = f.replace(/\\mathbf\{([^}]*)\}/g, '$1');
    f = f.replace(/\\ge\b/g, '≥');
    f = f.replace(/\\le\b/g, '≤');
    f = f.replace(/\\gamma\b/g, 'γ');
    f = f.replace(/\\Delta\b/g, 'Δ');
    f = f.replace(/\\rho\b/g, 'ρ');
    f = f.replace(/\\times\b/g, '×');
    f = f.replace(/\\approx\b/g, '≈');
    f = f.replace(/\\quad/g, '   ');
    f = f.replace(/\\\s+/g, ' ');
    f = f.replace(/\\_/g, '_');
    return `\n\n> 📐 **Equation:** \`${f}\`\n\n`;
  });

  // 3. Clean specific inline LaTeX units like $1\text{G}$ -> **1G**, $4\text{G}$ -> **4G**, $200\text{G}$ -> **200G**
  text = text.replace(/\$([0-9.]+)\s*\\text\{([A-Za-z]+)\}\$/g, '**$1$2**');
  text = text.replace(/\$([0-9.]+[A-Za-z%]+)\$/g, '**$1**');

  // 4. Clean symbols like ($c$) -> (speed of light **c**)
  text = text.replace(/\(\$c\$\)/g, '(**c - Speed of Light**)');
  text = text.replace(/\$c\$/g, '**c**');

  // 5. Clean common LaTeX math operators and Greek letters
  text = text.replace(/\\ge\b/g, '≥');
  text = text.replace(/\\le\b/g, '≤');
  text = text.replace(/\\Delta\b/g, 'Δ');
  text = text.replace(/\\gamma\b/g, 'γ');
  text = text.replace(/\\rho\b/g, 'ρ');
  text = text.replace(/\\theta\b/g, 'θ');
  text = text.replace(/\\times\b/g, '×');
  text = text.replace(/\\approx\b/g, '≈');
  text = text.replace(/\\text(?:bf)?\{([^}]*)\}/g, '$1');
  text = text.replace(/\\mathbf\{([^}]*)\}/g, '$1');

  // 6. Clean any remaining inline dollar signs: $E = mc^2$ -> **E = mc²**
  text = text.replace(/\$([^$\n]+)\$/g, (match, inner) => {
    let clean = inner.trim();
    clean = clean.replace(/\^2/g, '²');
    clean = clean.replace(/\^3/g, '³');
    clean = clean.replace(/\\text\{([^}]*)\}/g, '$1');
    clean = clean.replace(/\\/g, '');
    return `**${clean}**`;
  });

  return text;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  onOpenGmail,
  onOpenConnectors,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isUser = message.role === 'user';

  // Parse markdown into rich semantic HTML
  const parsedHtml = useMemo(() => {
    if (isUser) return '';
    const preprocessed = preprocessContent(message.content);
    return marked.parse(preprocessed, { breaks: true, gfm: true }) as string;
  }, [message.content, isUser]);

  // Extract email draft details if present
  const emailDraft = useMemo(() => {
    if (isUser) return null;
    const content = message.content;
    const isEmailRelated =
      /(gmail|email|dispatch|recipient|subject|compose)/i.test(content) &&
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i.test(content);

    if (!isEmailRelated) return null;

    const emailMatch = content.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const to = emailMatch ? emailMatch[1] : '';

    const subjectMatch = content.match(/\*\*Subject:\*\*\s*(.+)/i) || content.match(/Subject:\s*([^\n]+)/i);
    const subject = subjectMatch ? subjectMatch[1].replace(/[*`_]/g, '').trim() : '';

    // Extract body if preceded by Body / Email Body / Message Body
    const bodyMatch =
      content.match(/(?:\*\*(?:Email |Message )?Body:\*\*|(?:Email |Message )?Body:)\s*([\s\S]*?)(?=(?:\n\*{3,}|\n_{3,}|\n---|\n###|\n\*\*Ready to send|\nReady to send|\nAction requires explicit confirmation|\nJust say ["']|$))/i);

    let body = bodyMatch ? bodyMatch[1].replace(/^[>\s]+/, '').trim() : '';

    // Strip any trailing prompt text like "**Ready to send?**...", "Ready to send?...", "***", etc.
    body = body
      .replace(/\s*(\*{3,}|_{3,}|-{3,})\s*$/g, '')
      .replace(/\s*\*\*Ready to send\??\*\*[\s\S]*$/i, '')
      .replace(/\s*Ready to send\??[\s\S]*$/i, '')
      .replace(/\s*Just say ["'].*?["'][\s\S]*$/i, '')
      .replace(/\s*Action requires explicit confirmation[\s\S]*$/i, '')
      .replace(/\s*Open in Gmail Action Center[\s\S]*$/i, '')
      .replace(/\s*Review & Send Email[\s\S]*$/i, '')
      .replace(/\s*(\*{3,}|_{3,}|-{3,})\s*$/g, '')
      .trim();

    return { to, subject, body };
  }, [message.content, isUser]);

  const hasConnectorReference = useMemo(() => {
    if (isUser) return false;
    return /(app connector|connectors hub|authorize sign-in|oauth client)/i.test(message.content);
  }, [message.content, isUser]);

  const handleCopy = () => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(message.content);
      }
    } catch (e) {
      console.warn('Clipboard write restricted', e);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSpeech = () => {
    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(message.content.replace(/[#*`_$\\]/g, ''));
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    } catch (e) {
      console.warn('Speech synthesis restricted', e);
      setIsSpeaking(false);
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end my-4 px-2 sm:px-4">
        <div className="flex items-start gap-3 max-w-2xl">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm sm:text-base leading-relaxed shadow-md font-sans whitespace-pre-wrap">
            {message.content}
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center shrink-0 text-slate-200">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start my-6 px-2 sm:px-4">
      <div className="flex items-start gap-3 max-w-3xl w-full">
        {/* Assistant Avatar */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md shadow-cyan-500/20 text-white">
          <Sparkles className="w-4 h-4" />
        </div>

        {/* Message Container */}
        <div className="flex-1 space-y-2.5 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-100 font-sans flex items-center gap-1.5">
                HMHS Box AI
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-800 text-cyan-300 text-[10px] font-mono font-bold">
                10-Agent Super Core
              </span>
            </div>

            {/* Cinematic Live Agent Holographic Pill ("Scene wala") */}
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                A-7 Cruz (Security)
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                A-8 Drake (Cloud Ops)
              </span>
            </div>
          </div>

          {/* Real Formatted Markdown Body with Real Headings, Underlines, Tables & Clean Math */}
          <div className="bg-slate-900/90 p-5 rounded-2xl rounded-tl-sm border border-slate-800 shadow-xl overflow-hidden">
            <div
              className="markdown-body"
              dangerouslySetInnerHTML={{ __html: parsedHtml }}
            />

            {/* Email Dispatch Action Card */}
            {emailDraft && onOpenGmail && (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-red-950/40 via-indigo-950/40 to-slate-900 border border-red-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Gmail Action Center</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-950 border border-red-800 text-red-300 font-mono">
                        Verified Clean Draft
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                      {emailDraft.to ? `To: ${emailDraft.to}` : 'Ready for direct email dispatch'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenGmail(emailDraft)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-sans transition flex items-center justify-center gap-2 shadow-md shadow-red-600/30 active:scale-95 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Review & Send Email</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Connector Hub Quick Action Card */}
            {hasConnectorReference && onOpenConnectors && (
              <div className="mt-4 p-3 rounded-xl bg-indigo-950/30 border border-indigo-700/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-slate-300">
                    Authorize real apps via the 24+ Connectors Hub
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onOpenConnectors}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono transition font-bold"
                >
                  Open 24+ Apps
                </button>
              </div>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition flex items-center gap-1 text-xs"
              title="Copy message"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={toggleSpeech}
              className={`p-1.5 rounded-lg transition flex items-center gap-1 text-xs ${
                isSpeaking ? 'text-cyan-400 bg-cyan-950/60' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
              title="Read aloud"
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{isSpeaking ? 'Stop' : 'Listen'}</span>
            </button>

            {onOpenGmail && (
              <button
                type="button"
                onClick={() => onOpenGmail()}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/80 transition flex items-center gap-1 text-xs ml-auto"
                title="Open Gmail Action Center"
              >
                <Mail className="w-3.5 h-3.5 text-red-400" />
                <span className="text-[11px] text-slate-300">Gmail</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

