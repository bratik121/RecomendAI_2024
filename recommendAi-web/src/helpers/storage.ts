export const storage = {
	set: (name: string, content: any) => {
		if (!name) return;
		if (typeof content !== "string") {
			content = JSON.stringify(content);
		}
		window.localStorage.setItem(name, content);
	},
	get: (name: string) => {
		if (!name) return;
		return window.localStorage.getItem(name);
	},
	remove: (name: string) => {
		if (!name) return;
		return window.localStorage.removeItem(name);
	},
	clear: () => {
		return window.localStorage.clear();
	},
};
