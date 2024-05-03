/** @type {import('tailwindcss').Config} */

// c_green

export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				c_black: "#181C25",
				c_dark_blue: {
					400: "#153452",
					600: "#132D46",
				},
				primary: {
					100: "#63F8CE",
					200: "#77F9D4",
					300: "#15F4B5",
					400: "#0BEAAB",
					500: "#09D99E",
					600: "#08C48F",
					700: "#07B080",
					800: "#079D72",
					900: "#067555",
				},
				c_gray: {
					200: "#E2EBF4",
					500: "#C9DAEA",
					700: "#A6C1DE",
					900: "#88ACD3",
				},
			},
		},
	},
	plugins: [],
};
