import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { chatApi, chatErrorMessage, ChatMessage, ChatRecommendedMovie } from "@/src/api/chat";
import { scaleIn } from "@/src/lib/motion";
import { cn } from "@/src/lib/utils";
import { Spinner } from "@/src/components/Spinner";

type Message = {
	id: number | string;
	role: "user" | "assistant";
	content: string;
	movies?: ChatRecommendedMovie[];
};

const CONVERSATION_KEY = "chat_conversation_id";

export function ChatWidget() {
	const { t } = useTranslation("chat");
	const [open, setOpen] = useState(false);
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [sending, setSending] = useState(false);
	const [error, setError] = useState("");
	const [quota, setQuota] = useState<number | null>(null);
	const [conversationId, setConversationId] = useState<string | null>(null);
	const scrollRef = useRef<HTMLDivElement>(null);
	const hydratedRef = useRef(false);

	// Persiste el id de conversación para retomar el historial al volver.
	useEffect(() => {
		const stored = localStorage.getItem(CONVERSATION_KEY);
		if (stored) setConversationId(stored);
	}, []);

	// Al abrir por primera vez, recupera el historial de la conversación.
	useEffect(() => {
		if (!open || hydratedRef.current || !conversationId) return;
		hydratedRef.current = true;
		chatApi
			.history(conversationId)
			.then((res) => {
				setMessages(
					res.messages.map((m: ChatMessage) => ({
						id: m.id,
						role: m.role,
						content: m.content,
					}))
				);
			})
			.catch(() => {
				// Sin historial disponible; se inicia una conversación nueva.
				setConversationId(null);
			});
	}, [open, conversationId]);

	useEffect(() => {
		const el = scrollRef.current;
		if (el) el.scrollTop = el.scrollHeight;
	}, [messages, sending, open]);

	const send = async () => {
		const text = input.trim();
		if (!text || sending) return;

		setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", content: text }]);
		setInput("");
		setSending(true);
		setError("");

		try {
			const res = await chatApi.send(text, conversationId ?? undefined);
			setConversationId(res.conversation_id);
			localStorage.setItem(CONVERSATION_KEY, res.conversation_id);
			setMessages((prev) => [
				...prev,
				{
					id: res.message.id,
					role: "assistant",
					content: res.message.content,
					movies: res.recommended_movies,
				},
			]);
			setQuota(res.quota.remaining);
		} catch (err) {
			setError(chatErrorMessage(err));
		} finally {
			setSending(false);
		}
	};

	return (
		<>
			<AnimatePresence>
				{open && (
					<motion.div
						initial={{ opacity: 0, y: 16, scale: 0.96 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 16, scale: 0.96 }}
						transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
						className="fixed bottom-24 right-4 z-50 flex h-[480px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-float sm:right-6"
						role="dialog"
						aria-label={t("title")}
					>
						<header className="flex items-center justify-between border-b border-border-subtle bg-surface px-4 py-3">
							<div className="flex items-center gap-2">
								<span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-accent">
									<Bot className="h-5 w-5" />
								</span>
								<div>
									<p className="text-sm font-bold text-text-primary">{t("title")}</p>
									<p className="text-xs text-text-muted">{t("subtitle")}</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								{quota !== null && (
									<span className="rounded-full border border-border-subtle px-2 py-0.5 text-xs text-text-muted">
										{t("quota", { count: quota })}
									</span>
								)}
								<button
									type="button"
									onClick={() => setOpen(false)}
									aria-label={t("close")}
									className="rounded-md p-1.5 text-text-secondary hover:bg-surface-elevated"
								>
									<X className="h-4 w-4" />
								</button>
							</div>
						</header>

						<div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
							{messages.length === 0 && !sending && (
								<div className="flex h-full flex-col items-center justify-center text-center">
									<Sparkles className="mb-3 h-8 w-8 text-accent" />
									<p className="text-sm font-semibold text-text-primary">{t("emptyTitle")}</p>
									<p className="mt-1 max-w-xs text-xs text-text-muted">{t("emptyDesc")}</p>
								</div>
							)}

							{messages.map((m) => (
								<div
									key={m.id}
									className={cn(
										"flex",
										m.role === "user" ? "justify-end" : "justify-start"
									)}
								>
									<div
										className={cn(
											"max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm",
											m.role === "user"
												? "bg-accent text-accent-foreground"
												: "bg-surface-elevated text-text-primary"
										)}
									>
										<p className="whitespace-pre-wrap">{m.content}</p>
										{m.movies && m.movies.length > 0 && (
											<div className="mt-2 space-y-1.5">
												<p className="text-xs font-semibold text-text-secondary">
													{t("recommendedTitle")}
												</p>
												{m.movies.map((movie) => (
													<a
														key={movie.id}
														href={`/movie/${movie.id}`}
														className="block rounded-lg border border-border-subtle bg-surface px-2.5 py-1.5 transition-colors hover:border-accent/40"
													>
														<span className="text-xs font-semibold text-text-primary">
															{movie.title}
														</span>
														<span className="ml-2 text-[11px] text-text-muted">
															{movie.release_year}
														</span>
													</a>
												))}
											</div>
										)}
									</div>
								</div>
							))}

							{sending && (
								<div className="flex justify-start">
									<div className="flex items-center gap-2 rounded-2xl bg-surface-elevated px-3.5 py-2.5 text-sm text-text-muted">
										<span className="flex gap-1">
											<span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:0ms]" />
											<span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:150ms]" />
											<span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:300ms]" />
										</span>
										{t("typing")}
									</div>
								</div>
							)}
						</div>

						{error && (
							<p className="px-4 pb-1 text-xs text-danger">{error}</p>
						)}

						<form
							className="flex items-center gap-2 border-t border-border-subtle bg-surface p-3"
							onSubmit={(e) => {
								e.preventDefault();
								send();
							}}
						>
							<input
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder={t("placeholder")}
								maxLength={2000}
								disabled={sending}
								className="flex h-10 w-full rounded-lg border border-border-subtle bg-background px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-60"
							/>
							<button
								type="submit"
								disabled={sending || !input.trim()}
								aria-label={t("send")}
								className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-50"
							>
								{sending ? <Spinner /> : <Send className="h-4 w-4" />}
							</button>
						</form>
					</motion.div>
				)}
			</AnimatePresence>

			<motion.button
				type="button"
				onClick={() => setOpen((v) => !v)}
				aria-label={t("bubbleLabel")}
				className="fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-float transition-colors hover:bg-accent-hover sm:right-6"
				whileHover={{ scale: 1.06 }}
				whileTap={{ scale: 0.94 }}
			>
				<AnimatePresence mode="wait" initial={false}>
					<motion.span
						key={open ? "x" : "chat"}
						variants={scaleIn}
						initial="hidden"
						animate="visible"
						exit="hidden"
						className="flex"
					>
						{open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
					</motion.span>
				</AnimatePresence>
			</motion.button>
		</>
	);
}
