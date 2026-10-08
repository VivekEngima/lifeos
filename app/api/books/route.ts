import { NextRequest, NextResponse } from "next/server";
import { getAllBooks, createBook, updateBook, deleteBook } from "@/lib/lifeos-service";

export async function GET() {
  try {
    const books = await getAllBooks();
    return NextResponse.json(books);
  } catch (error) {
    console.error("Error in GET /api/books:", error);
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newBook = await createBook(body);
    return NextResponse.json(newBook);
  } catch (error: any) {
    console.error("Error in POST /api/books:", error);
    return NextResponse.json({ error: error?.message || "Failed to create book" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: "Book id is required" }, { status: 400 });
    const res = await updateBook(id, data);
    return NextResponse.json(res);
  } catch (error: any) {
    console.error("Error in PUT /api/books:", error);
    return NextResponse.json({ error: error?.message || "Failed to update book" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Book id is required" }, { status: 400 });
    await deleteBook(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in DELETE /api/books:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete book" }, { status: 500 });
  }
}
