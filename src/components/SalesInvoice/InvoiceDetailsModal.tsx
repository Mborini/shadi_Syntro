"use client";

import { Modal, Table, ScrollArea, Badge } from "@mantine/core";
import { SalesInvoice } from "@/types/salesInvoice";

interface InvoiceDetailsModalProps {
  opened: boolean;
  onClose: () => void;
  invoice: SalesInvoice | null;
}

export function InvoiceDetailsModal({
  opened,
  onClose,
  invoice,
}: InvoiceDetailsModalProps) {
  if (!invoice) return null;

  const statusTextMap: Record<number, string> = {
    1: "ذمم",
    2: "مدفوع جزئي",
    3: "مدفوع",
    4: "تسديد من الحساب",
    5: "دفع وتسديد",
  };

  const numericStatus = Number(invoice.status);

  const formatCurrency = (amount: number | undefined) =>
    (amount || 0).toLocaleString(undefined, {
      style: "currency",
      currency: "JOD",
    });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`تفاصيل الفاتورة رقم ${invoice.invoice_no}`}
      size="lg"
      dir="rtl"
       >
      <ScrollArea style={{ maxHeight: "70vh" }}>
        <Table striped highlightOnHover verticalSpacing="sm">
          <tbody>
            <tr>
              <td>
                <strong>رقم الفاتورة</strong>
              </td>
              <td>{invoice.invoice_no}</td>
            </tr>
            <tr>
              <td>
                <strong>الزبون</strong>
              </td>
              <td>{invoice.customer_name}</td>
            </tr>
            <tr>
              <td>
                <strong>التاريخ</strong>
              </td>
              <td>{new Date(invoice.invoice_date).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td>
                <strong>الإجمالي الكلي</strong>
              </td>
              <td>{formatCurrency(invoice.grand_total)}</td>
            </tr>
            <tr>
              <td>
                <strong>نقداً</strong>
              </td>
              <td>{formatCurrency(invoice.cash_amount)}</td>
            </tr>
            <tr>
              <td>
                <strong>عملات معدنية</strong>
              </td>
              <td>{formatCurrency(invoice.coins_amount)}</td>
            </tr>
            <tr>
              <td>
                <strong>تحويل بنكي</strong>
              </td>
              <td>{formatCurrency(invoice.bank_transfer_amount)}</td>
            </tr>
            <tr>
              <td>
                <strong>أخرى</strong>
              </td>
              <td>{formatCurrency(invoice.other_amount)}</td>
            </tr>
            <tr>
              <td>
                <strong>المدفوع</strong>
              </td>
              <td>{formatCurrency(invoice.paid_amount)}</td>
            </tr>
            <tr>
              <td>
                <strong>المتبقي من الفاتورة</strong>
              </td>
              <td>{formatCurrency(invoice.remaining_invoice_amount)}</td>
            </tr>
            <tr>
              <td>
                <strong>المدفوع من الرصيد</strong>
              </td>
              <td>{formatCurrency(invoice.paid_from_previous_balance)}</td>
            </tr>
            <tr>
              <td>
                <strong>صافي الرصيد</strong>
              </td>
              <td>{formatCurrency(invoice.remaining_previous_balance)}</td>
            </tr>
            <tr>
              <td>
                <strong>الحالة</strong>
              </td>
              <td>
                <Badge
                  variant="light"
                  color={
                    numericStatus === 3
                      ? "green"
                      : numericStatus === 2
                        ? "yellow"
                        : numericStatus === 4
                          ? "blue"
                          : numericStatus === 5
                            ? "teal"
                            : "red"
                  }
                >
                  {statusTextMap[numericStatus]}
                </Badge>
              </td>
            </tr>
            <tr>
              <td>
                <strong>ملاحظات</strong>
              </td>
              <td>{invoice.notes || "-"}</td>
            </tr>
          </tbody>
        </Table>
      </ScrollArea>
    </Modal>
  );
}
