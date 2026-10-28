import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Camera, Trash2 } from "lucide-react";
import { useProfile } from "@/src/redux/hooks/useProfile";
import { Avatar } from "@/src/components/Avatar";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Spinner } from "@/src/components/Spinner";
import { fadeUp } from "@/src/lib/motion";

export function ProfilePage() {
	const { t } = useTranslation("profile");
	const { user, saving, error, updateProfile, removeAvatar } = useProfile();

	const [name, setName] = useState(user.name || "");
	const [lastname, setLastname] = useState(user.lastname || "");
	const [bio, setBio] = useState(user.bio || "");
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [localError, setLocalError] = useState("");
	const fileRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		return () => {
			if (preview) {
				URL.revokeObjectURL(preview);
			}
		};
	}, [preview]);

	const handleFile = (file?: File) => {
		setLocalError("");
		if (!file) return;
		if (file.size > 2 * 1024 * 1024) {
			setLocalError(t("errorSize"));
			return;
		}
		if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
			setLocalError(t("errorType"));
			return;
		}
		setAvatarFile(file);
		setPreview(URL.createObjectURL(file));
	};

	const handleSave = async () => {
		const success = await updateProfile({
			name,
			lastname,
			bio,
			avatar: avatarFile,
		});
		if (success) {
			toast.success(t("saved"));
			setAvatarFile(null);
			setPreview(null);
		}
	};

	const handleRemove = async () => {
		setAvatarFile(null);
		setPreview(null);
		await removeAvatar();
	};

	return (
		<div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
			<motion.div
				variants={fadeUp}
				initial="hidden"
				animate="visible"
				className="rounded-3xl border border-border-subtle bg-surface p-6 shadow-card sm:p-8"
			>
				<h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
					{t("title")}
				</h1>

				<div className="mt-8 flex flex-col items-center gap-6 sm:flex-row">
					<Avatar
						name={user.name ? `${user.name} ${user.lastname}` : "?"}
						src={preview || user.avatar}
						size={96}
					/>
					<div className="flex flex-col items-center gap-2 sm:items-start">
						<input
							ref={fileRef}
							type="file"
							accept="image/jpeg,image/png,image/webp"
							className="hidden"
							onChange={(e) => handleFile(e.target.files?.[0])}
						/>
						<div className="flex gap-2">
							<Button
								variant="outline"
								onClick={() => fileRef.current?.click()}
							>
								<Camera className="h-4 w-4" />
								{t("upload")}
							</Button>
							{user.avatar && (
								<Button
									variant="ghost"
									onClick={handleRemove}
									className="text-danger hover:text-danger"
								>
									<Trash2 className="h-4 w-4" />
									{t("remove")}
								</Button>
							)}
						</div>
					</div>
				</div>

				<div className="mt-8 flex flex-col gap-5">
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-1.5">
							<Label htmlFor="name">{t("name")}</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="lastname">{t("lastname")}</Label>
							<Input
								id="lastname"
								value={lastname}
								onChange={(e) => setLastname(e.target.value)}
							/>
						</div>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="email">{t("email")}</Label>
						<Input id="email" value={user.email} disabled />
					</div>

					<div className="space-y-1.5">
						<div className="flex items-center justify-between">
							<Label htmlFor="bio">{t("bio")}</Label>
							<span className="text-xs text-text-muted">{bio.length}/280</span>
						</div>
						<textarea
							id="bio"
							value={bio}
							maxLength={280}
							onChange={(e) => setBio(e.target.value)}
							placeholder={t("bioPlaceholder")}
							rows={4}
							className="w-full resize-y rounded-lg border border-border-subtle bg-background px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring/30"
						/>
					</div>

					{(error || localError) && (
						<p className="text-sm text-danger">{localError || error}</p>
					)}

					<Button onClick={handleSave} disabled={saving} className="sm:w-fit">
						{saving ? <Spinner /> : t("save")}
					</Button>
				</div>
			</motion.div>
		</div>
	);
}
