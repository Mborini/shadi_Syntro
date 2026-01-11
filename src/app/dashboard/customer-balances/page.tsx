// app/tables/page.tsx
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { BalancesTable } from "@/components/Customer-balances/Table";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ذمم الزبائن`",
};

export default async function customersPage() {
  return (
    <>
      <Breadcrumb pageName="ذمم الزبائن" />

      <div className="space-y-10">
        <BalancesTable />
      </div>
    </>
  );
}
