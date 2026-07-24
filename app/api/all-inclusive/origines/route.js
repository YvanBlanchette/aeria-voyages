import { ORIGINES } from "@/lib/all-inclusive";
import { cachedJson } from "@/lib/api-utils";

export async function GET() {
	return cachedJson(ORIGINES);
}
