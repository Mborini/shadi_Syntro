// app/api/salesInvoice/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

// 🔹 GET كل الفواتير مع اسم الزبون
export async function GET() {
  const result = await pool.query(`
    SELECT 
      si.*, 
      c.name AS customer_name,
      cb.balance AS customer_balance
    FROM sales_invoices si
    LEFT JOIN customers c ON si.customer_id = c.id
    LEFT JOIN customer_balances cb ON si.customer_id = cb.customer_id
    ORDER BY si.id DESC
  `);

  return NextResponse.json(result.rows);
}
export async function POST(req: Request) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const data = await req.json();

    const totalPaid =
      Number(data.cash_amount || 0) +
      Number(data.coins_amount || 0) +
      Number(data.bank_transfer_amount || 0) +
      Number(data.other_amount || 0);

    // 1️⃣ جلب رصيد الزبون الحالي
    const balanceRes = await client.query(
      `SELECT balance FROM customer_balances WHERE customer_id = $1`,
      [data.customer_id],
    );

    const previousBalance = Number(balanceRes.rows[0]?.balance || 0);

    let paidFromPreviousBalance = 0;

    // 1️⃣ إذا الدفع أكبر من الفاتورة → الفرق من الرصيد السابق
    if (totalPaid > data.grand_total) {
      paidFromPreviousBalance = Math.min(
        totalPaid - data.grand_total,
        previousBalance,
      );
    }

    const remainingPreviousBalance = previousBalance - paidFromPreviousBalance;

    // 3️⃣ حسابات الفاتورة
  const paidAmount = totalPaid;

    const remainingInvoiceAmount = Math.max(data.grand_total - paidAmount, 0);

    // 4️⃣ إدخال الفاتورة
    const invoiceResult = await client.query(
      `INSERT INTO sales_invoices (
        invoice_no, customer_id, invoice_date,
        grand_total, paid_amount, remaining_invoice_amount,
        paid_from_previous_balance, remaining_previous_balance,
        status, cash_amount, coins_amount, bank_transfer_amount, other_amount, notes
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING id`,
      [
        data.invoice_no,
        data.customer_id,
        data.invoice_date,
        data.grand_total,
        paidAmount,
        remainingInvoiceAmount,
        paidFromPreviousBalance,
        remainingPreviousBalance,
        data.status,
        data.cash_amount || 0,
        data.coins_amount || 0,
        data.bank_transfer_amount || 0,
        data.other_amount || 0,
        data.notes || "",
      ],
    );

    // 5️⃣ تحديث رصيد الزبون
    const newBalance = remainingPreviousBalance + remainingInvoiceAmount;

    await client.query(
      `INSERT INTO customer_balances (customer_id, balance)
       VALUES ($1,$2)
       ON CONFLICT (customer_id)
       DO UPDATE SET balance = EXCLUDED.balance, updated_at=NOW()`,
      [data.customer_id, newBalance],
    );

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      invoiceId: invoiceResult.rows[0].id,
    });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error(error);
    return NextResponse.json(
      { error: error.message || "فشل إنشاء الفاتورة" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
