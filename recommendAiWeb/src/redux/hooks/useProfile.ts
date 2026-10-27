import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { api } from "@/src/api/client";
import { storage } from "@/src/helpers";
import { RootState } from "../reducers";
import { setUserFromStorage } from "../actions";

export interface IProfileUpdate {
	name: string;
	lastname: string;
	bio: string;
	avatar?: File | null;
}

export const useProfile = () => {
	const dispatch = useDispatch();
	const user = useSelector((state: RootState) => state.user.user);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [saved, setSaved] = useState(false);

	const updateProfile = async (data: IProfileUpdate) => {
		setSaving(true);
		setError("");
		setSaved(false);
		try {
			const form = new FormData();
			form.append("name", data.name);
			form.append("lastname", data.lastname);
			form.append("bio", data.bio);
			if (data.avatar) {
				form.append("avatar", data.avatar);
			}

			const response = await api.patch("/profile/", form);

			const updated = {
				email: response.data.email,
				name: response.data.name,
				lastname: response.data.lastname,
				id: String(response.data.id),
				avatar: response.data.avatar || null,
				bio: response.data.bio || "",
				role: response.data.role || "user",
			};
			storage.set("user", updated);
			dispatch(setUserFromStorage(updated));
			setSaved(true);
			return true;
		} catch (requestError: any) {
			setError(
				requestError?.response?.data?.detail ||
					requestError?.response?.data?.avatar?.[0] ||
					"Ocurrió un error inesperado."
			);
			return false;
		} finally {
			setSaving(false);
		}
	};

	const removeAvatar = async () => {
		setSaving(true);
		setError("");
		try {
			const response = await api.delete("/profile/avatar/");
			const updated = {
				email: response.data.email,
				name: response.data.name,
				lastname: response.data.lastname,
				id: String(response.data.id),
				avatar: response.data.avatar || null,
				bio: response.data.bio || "",
				role: response.data.role || "user",
			};
			storage.set("user", updated);
			dispatch(setUserFromStorage(updated));
			return true;
		} catch (requestError: any) {
			setError("No se pudo quitar la foto.");
			return false;
		} finally {
			setSaving(false);
		}
	};

	return { user, saving, error, saved, updateProfile, removeAvatar };
};
