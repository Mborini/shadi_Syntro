import { CustomerBalance, CustomerBalanceDTO } from "@/types/balance";

const BASE_URL = "/api/customer-balances";

export async function getBalances(): Promise<CustomerBalance[]> {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("فشل في جلب الذمم");
  return res.json();
}
export async function getCustomerBalance(customerId: number): Promise<number> {
  const res = await fetch(`${BASE_URL}/${customerId}`);
  if (!res.ok) throw new Error("فشل في جلب رصيد الزبون");
  const data = await res.json();
  return data.balance;
}
export async function createBalance(data: CustomerBalanceDTO) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("فشل في إضافة الرصيد");
  return res.json();
}

// updateCustomerBalance

export async function updateCustomerBalance(customerId: number, balance: number) {
  const res = await fetch(`${BASE_URL}/${customerId}`, {
    method: "PUT", 
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customer_id: customerId, balance }),
  });

  if (!res.ok) throw new Error("فشل في تحديث رصيد الزبون");
  return res.json();
}
export async function updateBalance(id: number, data: CustomerBalanceDTO) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("فشل في تحديث الرصيد");
  return res.json();
}

export async function deleteBalance(id: number) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("فشل في حذف الرصيد");
  return res.json();
}
