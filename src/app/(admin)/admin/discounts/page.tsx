import { getServerSession } from "next-auth";
import DiscountsPanel from "@/components/admin/DiscountsPanel";
import { listDiscounts } from "@/lib/admin-api";
import { authOptions } from "@/lib/auth";

export default async function AdminDiscountsPage() {
  const session = await getServerSession(authOptions);
  const accessToken =
    (session as unknown as { accessToken?: string })?.accessToken ?? "";
  const discounts = await listDiscounts(accessToken);

  return (
    <div>
      <h1 className="font-display text-fluid-h1 italic text-foreground">
        Discounts
      </h1>
      <p className="mt-2 text-sm text-muted">
        {discounts.length} discount codes.
      </p>

      <div className="mt-8">
        <DiscountsPanel initialDiscounts={discounts} />
      </div>
    </div>
  );
}
