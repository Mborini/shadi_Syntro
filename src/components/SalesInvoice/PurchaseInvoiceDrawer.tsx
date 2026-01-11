"use client";

import { useEffect, useState } from "react";
import {
  Drawer,
  TextInput,
  NumberInput,
  Button,
  Divider,
  Select,
  Textarea,
} from "@mantine/core";
import { Toast } from "@/lib/toast";
import { getCustomers } from "@/services/customerServices";
import { CreateSalesInvoiceDTO, SalesInvoice } from "@/types/salesInvoice";
import {
  getCustomerBalance,
  updateCustomerBalance,
} from "@/services/balanceServices";

type Props = {
  opened: boolean;
  onClose: () => void;
  invoice?: SalesInvoice | null;
  onSubmit: (data: CreateSalesInvoiceDTO) => void;
};

export function SimpleInvoiceDrawer({
  opened,
  onClose,
  invoice,
  onSubmit,
}: Props) {
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [customerId, setCustomerId] = useState(0);
  const [customers, setCustomers] = useState<{ id: number; name: string }[]>(
    [],
  );
  const [notes, setNotes] = useState(""); // ملاحظات الفاتورة
  const [grandTotal, setGrandTotal] = useState(0); // مبلغ الفاتورة
  const [cashAmount, setCashAmount] = useState(0); // دفع نقدي
  const [coinsAmount, setCoinsAmount] = useState(0); // دفع عملات معدنية
  const [bankTransferAmount, setBankTransferAmount] = useState(0); // تحويل بنكي
  const [otherAmount, setOtherAmount] = useState(0); // طرق أخرى

  const [customerBalance, setCustomerBalance] = useState(0); // الرصيد السابق
  const [totalBalance, setTotalBalance] = useState(0); // الرصيد الإجمالي
  const [remainingAmount, setRemainingAmount] = useState(0); // الرصيد المتبقي

  const [status, setStatus] = useState<
    "ذمم" | "مدفوع جزئي" | "مدفوع" | "تسديد من الحساب" | "دفع وتسديد"
  >("ذمم");
  const [isSaving, setIsSaving] = useState(false);

  /* ================= تحميل الزبائن ================= */
  useEffect(() => {
    getCustomers().then(setCustomers).catch(console.error);
  }, []);

  /* ================= تحميل رصيد الزبون ================= */
  useEffect(() => {
    if (!customerId) {
      setCustomerBalance(0);
      return;
    }
    getCustomerBalance(customerId)
      .then((b) => setCustomerBalance(Number(b) || 0))
      .catch(console.error);
  }, [customerId]);

  /* ================= الحسبة المحاسبية ================= */
  useEffect(() => {
    const totalPaid =
      cashAmount + bankTransferAmount + otherAmount + coinsAmount;
    const total = customerBalance + grandTotal;
    const remaining = Math.max(total - totalPaid, 0);

    setTotalBalance(total);
    setRemainingAmount(remaining);

    // تحديد الحالة
    if (grandTotal === 0 && totalPaid > 0) setStatus("تسديد من الحساب");
    else if (totalPaid === 0) setStatus("ذمم");
    else if (remaining > 0) setStatus("مدفوع جزئي");
    else setStatus("مدفوع");
  }, [
    customerBalance,
    grandTotal,
    cashAmount,
    bankTransferAmount,
    otherAmount,
    coinsAmount,
  ]);

  /* ================= حفظ ================= */
  const handleSave = async () => {
    if (!invoiceNo) return Toast.error("الرجاء إدخال رقم الفاتورة");
    if (!customerId) return Toast.error("الرجاء اختيار الزبون");

    const totalPaid =
      cashAmount + bankTransferAmount + otherAmount + coinsAmount;
console.log({ totalPaid });
    if (grandTotal === 0 && totalPaid === 0)
      return Toast.error("أدخل مبلغ الفاتورة أو مبلغ التسديد");
    if (totalPaid > totalBalance)
      return Toast.error("المجموع المدفوع أكبر من الرصيد الإجمالي");

    setIsSaving(true);

    try {
      const data: CreateSalesInvoiceDTO = {
        invoice_no: invoiceNo,
        invoice_date: invoiceDate,
        customer_id: customerId,
        grand_total: grandTotal,
        paid_amount: totalPaid,
        remaining_invoice_amount: remainingAmount,
        totalBalance,
        status:
          status === "ذمم"
            ? 1
            : status === "مدفوع جزئي"
              ? 2
              : status === "مدفوع"
                ? 3
                : 4, // تسديد من الحساب
        cash_amount: cashAmount,
        bank_transfer_amount: bankTransferAmount,
        other_amount: otherAmount,
        coins_amount: coinsAmount,
        notes,
      };

      await onSubmit(data);

      Toast.success("تم حفظ العملية بنجاح");
      onClose();
    } catch (err) {
      console.error(err);
      Toast.error("فشل حفظ العملية");
    } finally {
      setIsSaving(false);
    }
  };

  /* ================= UI ================= */
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="sm"
      title="فاتورة / تسديد"
    >
      <div className="flex flex-col gap-4" dir="rtl">
        <TextInput
          label="رقم الفاتورة"
          variant="filled"
          value={invoiceNo}
          onChange={(e) => setInvoiceNo(e.currentTarget.value)}
        />

        <TextInput
          label="التاريخ"
          type="date"
          variant="filled"
          value={invoiceDate}
          onChange={(e) => setInvoiceDate(e.currentTarget.value)}
        />

        <Select
          label="الزبون"
          variant="filled"
          searchable
          placeholder="اختر الزبون"
          value={customerId ? String(customerId) : ""}
          onChange={(val) => setCustomerId(Number(val))}
          data={customers.map((c) => ({ value: String(c.id), label: c.name }))}
        />

        <NumberInput
          label="اجمالي الفاتورة"
          variant="filled"
          min={0}
          value={grandTotal}
          onChange={(v) => setGrandTotal(typeof v === "number" ? v : 0)}
        />

        <Divider />

        <NumberInput
          label="الدفع نقداً"
          variant="filled"
          min={0}
          value={cashAmount}
          onChange={(v) => setCashAmount(typeof v === "number" ? v : 0)}
        />
        <NumberInput
          label="الدفع عملات معدنية"
          variant="filled"
          min={0}
          value={coinsAmount}
          onChange={(v) => setCoinsAmount(typeof v === "number" ? v : 0)}
        />
        <NumberInput
          label="الدفع تحويل بنكي"
          variant="filled"
          min={0}
          value={bankTransferAmount}
          onChange={(v) => setBankTransferAmount(typeof v === "number" ? v : 0)}
        />

        <NumberInput
          label="طرق أخرى (ورق جوائز ...)"
          variant="filled"
          min={0}
          value={otherAmount}
          onChange={(v) => setOtherAmount(typeof v === "number" ? v : 0)}
        />
        <Textarea
          label="ملاحظات"
          variant="filled"
          minRows={2}
          value={notes}
          onChange={(e) => setNotes(e.currentTarget.value)}
        />
        <Divider />

        <TextInput
          label="الرصيد السابق"
          value={customerBalance}
          readOnly
          variant="filled"
        />
        <TextInput
          label="المجموع"
          value={totalBalance}
          readOnly
          variant="filled"
        />
        <TextInput
          label=" الباقي"
          value={remainingAmount}
          readOnly
          variant="filled"
        />
        <TextInput label="الحالة" value={status} readOnly variant="filled" />

        <Button
          color="green"
          variant="light"
          fullWidth
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "جارٍ الحفظ..." : "حفظ"}
        </Button>
      </div>
    </Drawer>
  );
}
