// app/api/salesInvoice/[id]/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

/* =======================
   UPDATE INVOICE (PUT)
======================= */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const invoiceId = Number(params.id);
  const data = await req.json();

  try {
    const totalPaid =
      Number(data.cash_amount || 0) +
      Number(data.coins_amount || 0) +
      Number(data.bank_transfer_amount || 0) +
      Number(data.other_amount || 0);

    const remainingInvoiceAmount = Math.max(
      Number(data.grand_total || 0) - totalPaid,
      0
    );

    // الرصيد الجديد = الرصيد السابق + الباقي من الفاتورة فقط
    const newBalance =
      Number(data.customerBalance || 0) + remainingInvoiceAmount;

    await pool.query(
      `UPDATE sales_invoices
       SET invoice_no=$1,
           customer_id=$2,
           invoice_date=$3,
           grand_total=$4,
           paid_amount=$5,
           remaining_amount=$6,
           remaining_invoice_amount=$7,
           status=$8,
           cash_amount=$9,
           coins_amount=$10,
           bank_transfer_amount=$11,
           other_amount=$12,
           updated_at=NOW()
       WHERE id=$13`,
      [
        data.invoice_no,
        data.customer_id,
        data.invoice_date,
        data.grand_total,
        totalPaid,
        remainingInvoiceAmount, // الرصيد المتراكم
        remainingInvoiceAmount, // الباقي من هذه الفاتورة
        data.status,
        data.cash_amount || 0,
        data.coins_amount || 0,
        data.bank_transfer_amount || 0,
        data.other_amount || 0,
        invoiceId,
      ]
    );

    await pool.query(
      `INSERT INTO customer_balances (customer_id, balance)
       VALUES ($1,$2)
       ON CONFLICT (customer_id)
       DO UPDATE SET balance=$2, updated_at=NOW()`,
      [data.customer_id, newBalance]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "فشل تحديث الفاتورة" },
      { status: 500 }
    );
  }
}

/* =======================
   DELETE INVOICE 
======================= */

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const invoiceId = Number(params.id);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ جلب الفاتورة
    const invoiceRes = await client.query(
      `SELECT
         customer_id,
         remaining_invoice_amount,
         paid_from_previous_balance
       FROM sales_invoices
       WHERE id = $1`,
      [invoiceId]
    );

    if (invoiceRes.rows.length === 0) {
      throw new Error("الفاتورة غير موجودة");
    }

    const {
      customer_id,
      remaining_invoice_amount,
      paid_from_previous_balance,
    } = invoiceRes.rows[0];

    // 2️⃣ جلب رصيد الزبون الحالي
    const balanceRes = await client.query(
      `SELECT balance FROM customer_balances WHERE customer_id = $1`,
      [customer_id]
    );

    const currentBalance = Number(balanceRes.rows[0]?.balance || 0);

    // 3️⃣ عكس أثر الفاتورة بالكامل
    const newBalance =
      currentBalance -
      Number(remaining_invoice_amount || 0) +
      Number(paid_from_previous_balance || 0);

    // 4️⃣ تحديث رصيد الزبون
    await client.query(
      `UPDATE customer_balances
       SET balance = $1, updated_at = NOW()
       WHERE customer_id = $2`,
      [newBalance, customer_id]
    );

    // 5️⃣ حذف الفاتورة
    await client.query(
      `DELETE FROM sales_invoices WHERE id = $1`,
      [invoiceId]
    );

    await client.query("COMMIT");

    return NextResponse.json({ success: true });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error deleting invoice:", error);
    return NextResponse.json(
      { error: "فشل في حذف الفاتورة" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
