import { NextRequest, NextResponse } from "next/server";
import {
  logFinanceTransaction,
  logDailyIncome,
  updateMonthlyBudget,
  updateFinanceTransaction,
  deleteFinanceTransaction,
  deleteFinanceByDate,
} from "@/lib/lifeos-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.type === "monthly_budget") {
      const res = await updateMonthlyBudget(Number(body.amount));
      return NextResponse.json(res);
    }

    if (body.type === "income") {
      const res = await logDailyIncome(body.date || body.transactionDate, Number(body.amount));
      return NextResponse.json(res);
    }

    const res = await logFinanceTransaction({
      transactionDate: body.transactionDate || body.date,
      title: body.title,
      amount: Number(body.amount),
      category: body.category,
      isEssential: body.isEssential,
    });
    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in POST /api/finance:", error);
    return NextResponse.json({ error: "Failed to log finance item" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const res = await updateFinanceTransaction(id, data);
    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in PUT /api/finance:", error);
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const date = searchParams.get("date");
    if (!id && !date) return NextResponse.json({ error: "id or date is required" }, { status: 400 });
    if (date) {
      const result = await deleteFinanceByDate(date);
      return NextResponse.json(result);
    }
    await deleteFinanceTransaction(id!);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/finance:", error);
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}
