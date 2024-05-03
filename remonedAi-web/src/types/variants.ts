const opacityVariant = {
	hidden: {
		opacity: 0,
	},
	visible: {
		opacity: 1,
		transition: {
			duration: 0.5,
			ease: "easeInOut",
		},
	},
};

const leftVariant = {
	hidden: {
		x: -100,
		opacity: 0,
	},
	visible: {
		x: 0,
		opacity: 1,
		transition: {
			duration: 0.5,
			ease: "easeInOut",
		},
	},
};

const rightVariant = {
	hidden: {
		x: 100,
		opacity: 0,
	},
	visible: {
		x: 0,
		opacity: 1,
		transition: {
			duration: 0.5,
			ease: "easeInOut",
		},
	},
};

const liVariants = {
	open: {
		opacity: 1,
		height: "auto",
	},
	closed: {
		opacity: 0,
		height: 0,
	},
};

const downVariant = {
	hidden: {
		y: 100,
		opacity: 0,
	},
	visible: {
		y: 0,
		opacity: 1,
		transition: {
			duration: 0.5,
			ease: "easeInOut",
		},
	},
};

const upVariant = {
	hidden: {
		y: -100,
		opacity: 0,
	},
	visible: {
		y: 0,
		opacity: 1,
		transition: {
			duration: 0.5,
			ease: "easeInOut",
		},
	},
};

const scaleVariant = {
	hidden: {
		scale: 0,
		opacity: 0,
	},
	visible: {
		scale: 1,
		opacity: 1,
		transition: {
			duration: 0.5,
			ease: "easeInOut",
		},
	},
};

const containerVariant = {
	hidden: {
		opacity: 0,
	},
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.2,
		},
	},
};

const itemUpVariant = {
	hidden: {
		opacity: 0,
		y: 50,
	},
	visible: {
		opacity: 1,
		y: 0,
	},
};

const itemDownVariant = {
	hidden: {
		opacity: 0,
		y: -50,
	},
	visible: {
		opacity: 1,
		y: 0,
	},
};

const itemLeftVariant = {
	hidden: {
		opacity: 0,
		x: -50,
	},
	visible: {
		opacity: 1,
		x: 0,
	},
};

const itemRightVariant = {
	hidden: {
		opacity: 0,
		x: 50,
	},
	visible: {
		opacity: 1,
		x: 0,
	},
};

const setViewPort = (
	amount: number
): {
	once: boolean;
	amount: number;
} => {
	return {
		once: true,
		amount: amount,
	};
};

export {
	opacityVariant,
	leftVariant,
	rightVariant,
	liVariants,
	downVariant,
	upVariant,
	scaleVariant,
	containerVariant,
	itemUpVariant,
	itemDownVariant,
	itemLeftVariant,
	itemRightVariant,
	setViewPort,
};
