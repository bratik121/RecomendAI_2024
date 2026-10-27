import {
	ResponsiveContainer,
	AreaChart,
	Area,
	BarChart,
	Bar,
	LineChart,
	Line,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";

export {
	ResponsiveContainer,
	AreaChart,
	Area,
	BarChart,
	Bar,
	LineChart,
	Line,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
};

const ACCENT = "var(--accent)";
const PALETTE = [
	"#0c8a68",
	"#3b82f6",
	"#f59e0b",
	"#ef4444",
	"#8b5cf6",
	"#14b8a6",
];

export function ChartCard({
	title,
	description,
	children,
	height = 260,
}: {
	title: string;
	description?: string;
	children: React.ReactNode;
	height?: number;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{description && <CardDescription>{description}</CardDescription>}
			</CardHeader>
			<CardContent>
				<div style={{ width: "100%", height }}>
					<ResponsiveContainer width="100%" height="100%">
						{children as React.ReactElement}
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	);
}

export function chartColors(count: number) {
	return Array.from({ length: count }, (_, i) => PALETTE[i % PALETTE.length]);
}

export function accentColor() {
	return ACCENT;
}
