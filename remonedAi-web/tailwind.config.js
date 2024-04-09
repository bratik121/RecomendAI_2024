/** @type {import('tailwindcss').Config} */

export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				c_black: "#181C25",
				c_dark_blue: "#132D46",
				c_green: "#09D99E",
				c_grey: "#696E79",
			},
		},
	},
	plugins: [],
};
