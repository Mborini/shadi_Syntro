// src/app/api/customer-balances/route.ts
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface CustomerBalanceDTO {
  customer_id: number;
  balance: number;
}

// GET /api/customer-balances
export async function GET() {
  try {
    const client = await pool.connect();
    const res = await client.query(
      `SELECT b.id, b.customer_id, b.balance, c.name, c.phone, c.address
       FROM customer_balances b
       JOIN customers c ON b.customer_id = c.id
       ORDER BY b.id ASC`
    );
    client.release();
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// POST /api/customer-balances
export async function POST(req: NextRequest) {
  try {
    const client = await pool.connect();
    const data: CustomerBalanceDTO = await req.json();

    const res = await client.query(
      `INSERT INTO customer_balances (customer_id, balance)
       VALUES ($1, $2)
       RETURNING id, customer_id, balance`,
      [data.customer_id, data.balance]
    );

    client.release();
    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
