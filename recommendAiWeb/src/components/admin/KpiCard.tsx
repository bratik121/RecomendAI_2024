import { Card, CardContent } from "@/src/components/ui/card";

export function KpiCard({
	label,
	value,
	hint,
}: {
	label: string;
	value: string | number;
	hint?: string;
}) {
	return (
		<Card>
			<CardContent className="p-5">
				<p className="text-sm font-medium text-text-muted">{label}</p>
				<p className="mt-2 text-3xl font-extrabold tracking-tight text-text-primary">
					{value}
				</p>
				{hint && <p className="mt-1 text-xs text-text-muted">{hint}</p>}
			</CardContent>
		</Card>
	);
}
