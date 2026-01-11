import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface CustomerBalanceDTO {
  customer_id: number;
  balance: number;
}

// 🔹 GET /api/customer-balances/:id
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await pool.connect();
    const res = await client.query(
      `SELECT customer_id, balance FROM customer_balances WHERE customer_id = $1`,
      [params.id]
    );
    client.release();
console.log(res.rows);
    if (res.rows.length === 0) {
      return NextResponse.json({ balance: 0 }); // إذا لم يوجد رصيد
    }

    return NextResponse.json({ balance: res.rows[0].balance });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { balance } = await req.json();

    const update = await pool.query(
      `UPDATE customer_balances SET balance = $1 WHERE customer_id = $2 RETURNING *`,
      [balance, params.id]
    );

    // إذا لم يوجد رصيد سابق
    if (update.rows.length === 0) {
      const insert = await pool.query(
        `INSERT INTO customer_balances (customer_id, balance) VALUES ($1, $2) RETURNING *`,
        [params.id, balance]
      );
      return NextResponse.json(insert.rows[0]);
    }

    return NextResponse.json(update.rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// 🔹 DELETE /api/customer-balances/:id
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await pool.connect();
    await client.query(`DELETE FROM customer_balances WHERE customer_id=$1`, [params.id]);
    client.release();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
