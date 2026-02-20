import * as React from "react";
import { Check, X, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function MultiSelect({ options, selected = [], onChange, label, placeholder = "Sélectionner..." }) {
	const [open, setOpen] = React.useState(false);

	const handleUnselect = (value) => {
		onChange(selected.filter((s) => s !== value));
	};

	const handleSelect = (value) => {
		if (selected.includes(value)) {
			onChange(selected.filter((s) => s !== value));
		} else {
			onChange([...selected, value]);
		}
	};

	return (
		<div className="flex flex-col gap-2 w-full">
			{label && <label className="font-raleway text-[11px] tracking-widest uppercase text-[#8B7355] font-medium">{label}</label>}
			<Popover
				open={open}
				onOpenChange={setOpen}
			>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={open}
						className="w-full justify-between h-auto min-h-[42px] border-[#B8935C]/30 bg-transparent hover:bg-[#B8935C]/5"
					>
						<div className="flex flex-wrap gap-1 items-center">
							{selected.length > 0 ? (
								selected.map((val) => {
									const option = options.find((o) => o.value === val);
									return (
										<Badge
											key={val}
											variant="secondary"
											className="bg-[#B8935C]/15 text-[#3D2E1E] border-none hover:bg-[#B8935C]/25 font-raleway text-[11px]"
										>
											{option?.label}
											<button
												className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
												onKeyDown={(e) => {
													if (e.key === "Enter") handleUnselect(val);
												}}
												onMouseDown={(e) => {
													e.preventDefault();
													e.stopPropagation();
												}}
												onClick={() => handleUnselect(val)}
											>
												<X className="h-3 w-3 text-[#8B7355]" />
											</button>
										</Badge>
									);
								})
							) : (
								<span className="text-muted-foreground font-raleway text-[13px]">{placeholder}</span>
							)}
						</div>
						<ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 text-[#B8935C]" />
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className="w-full p-0 border-[#B8935C]/20"
					align="start"
				>
					<Command className="bg-white">
						<CommandList>
							<CommandGroup>
								{options.map((option) => (
									<CommandItem
										key={option.value}
										onSelect={() => handleSelect(option.value)}
										className="cursor-pointer"
									>
										<div
											className={cn(
												"mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-[#B8935C]",
												selected.includes(option.value) ? "bg-[#B8935C] text-white" : "opacity-50",
											)}
										>
											{selected.includes(option.value) && <Check className="h-3 w-3" />}
										</div>
										<span className="font-raleway text-[13px]">{option.label}</span>
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
}
