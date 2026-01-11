"use client";

import { useEffect, useRef, useState } from "react";
import {
  Group,
  Table,
  ScrollArea,
  ActionIcon,
  Button,
  Badge,
} from "@mantine/core";
import { EyeIcon, PencilIcon, Plus, Printer, Trash2 } from "lucide-react";
import ConfirmModal from "../Common/ConfirmModal";
import { Toast } from "@/lib/toast";
import { TableSkeleton } from "../Common/skeleton";

import { InvoiceDetailsModal } from "./InvoiceDetailsModal";
import { SimpleInvoiceDrawer } from "./PurchaseInvoiceDrawer";
import {
  getSalesInvoices,
  deleteSalesInvoice,
  updateSalesInvoice,
  createSalesInvoice,
} from "@/services/salesInvoiceServices";
import { Box, Text } from "@mantine/core";

import { InvoiceFilter } from "./InvoiceFilter";
import {
  CreateSalesInvoiceDTO,
  SalesInvoice,
  UpdateSalesInvoiceDTO,
} from "@/types/salesInvoice";
import { MdLocalPrintshop } from "react-icons/md";
import handlePrintInvoice from "../Common/invoicePrintTemp";
import { Pagination } from "../Common/Pagination";

export function SalesInvoiceTable() {
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<SalesInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoice | null>(
    null,
  );
  const [modalOpened, setModalOpened] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<SalesInvoice | null>(
    null,
  );
  const [detailsOpened, setDetailsOpened] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState<SalesInvoice | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1); // الصفحة الحالية
  const perPage = 10; // عدد الفواتير في كل صفحة (يمكن تغييره حسب الحاجة)
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );
  const tableRef = useRef<HTMLDivElement>(null);
  const tableRef2 = useRef<HTMLDivElement>(null);

  const statusTextMap: Record<number, string> = {
    1: "ذمم",
    2: "مدفوع جزئي",
    3: "مدفوع",
    4: "تسديد من الحساب",
    5: "دفع وتسديد", // ✅ أضفنا الحالة الجديدة
  };

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const data = await getSalesInvoices();
      setInvoices(data);
      setFilteredInvoices(data);
    } catch (error) {
      console.error(error);
      Toast.error("فشل جلب الفواتير");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleSubmit = async (
    data: CreateSalesInvoiceDTO | UpdateSalesInvoiceDTO,
  ) => {
    try {
      if (selectedInvoice) {
        // استخدام الدالة من السيرفس
        await updateSalesInvoice(selectedInvoice.id, data as any);
        Toast.success("تم تعديل الفاتورة بنجاح");
      } else {
        await createSalesInvoice(data);
        Toast.success("تم إنشاء الفاتورة بنجاح");
      }
      await loadInvoices();
      setDrawerOpened(false);
      setSelectedInvoice(null);
    } catch (error: any) {
      console.error(error);
      Toast.error(error.message || "فشل حفظ الفاتورة");
    }
  };

  const handleConfirmDelete = async () => {
    if (!invoiceToDelete) return;
    try {
      await deleteSalesInvoice(invoiceToDelete.id);
      setInvoices((prev) => prev.filter((c) => c.id !== invoiceToDelete.id));
      setFilteredInvoices((prev) =>
        prev.filter((c) => c.id !== invoiceToDelete.id),
      );
      setModalOpened(false);
      Toast.success("تم حذف الفاتورة بنجاح");
      await loadInvoices();
    } catch (error: any) {
      console.error(error);
      Toast.error(error.message || "فشل حذف الفاتورة");
    }
  };

  const handleDeleteClick = (inv: SalesInvoice) => {
    setInvoiceToDelete(inv);
    setModalOpened(true);
  };

  // داخل SalesInvoiceTable
  const handleFilter = ({
    invoiceNo,
    customer,

    startDate,
    endDate,
    status,
  }: {
    invoiceNo: string;
    customer: string;
    startDate: string;
    endDate: string;
    status: string;
  }) => {
    let filtered = [...invoices];

    if (invoiceNo.trim()) {
      filtered = filtered.filter((inv) =>
        inv.invoice_no.toString().includes(invoiceNo.trim()),
      );
    }

    if (customer.trim()) {
      ``;
      filtered = filtered.filter((inv) =>
        inv.customer_name
          ?.toLowerCase()
          .includes(customer.trim().toLowerCase()),
      );
    }

    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter((inv) => new Date(inv.invoice_date) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      filtered = filtered.filter((inv) => new Date(inv.invoice_date) <= end);
    }

    if (status) {
      filtered = filtered.filter((inv) => inv.status.toString() === status);
    }

    setFilteredInvoices(filtered);
  };

  if (loading) return <TableSkeleton columns={6} />;
  const invoicesCount = filteredInvoices.length;

  const totalInvoicesAmount = filteredInvoices.reduce(
    (sum, inv) => sum + (Number(inv.grand_total) || 0),
    0,
  );

  const totalPaidAmount = filteredInvoices.reduce(
    (sum, inv) => sum + (Number(inv.paid_amount) || 0),
    0,
  );
  const handlePrintTable = () => {
    if (!tableRef.current) return;
    if (!tableRef2.current) return;


    const printWindow = window.open("", "_blank", "width=1200,height=800");
    if (!printWindow) return;

    const today = new Date().toLocaleDateString();

    printWindow.document.write(`
    <html>
      <head>
        <title>طباعة جدول الفواتير</title>
        <style>
          body {
            direction: rtl;
            font-family: Arial, sans-serif;
            padding: 20px;
            position: relative;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #000;
            padding: 6px;
            text-align: center;
            font-size: 12px;
          }
          th {
            background: #f1f5f9;
          }
          .print-hide {
            display: none !important;
          }
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            width: 410px;
            height: 200px;
            opacity: 0.06;
            transform: translate(-50%, -50%);
            z-index: -1;
          }
            .page_title{ 
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            }
          .title {
            text-align: center;
            font-size: 20px;
            font-weight: bold;
          }
          .date {
            text-align: center;
            margin-bottom: 10px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <!-- الوترمارك -->
        <img src="${window.location.origin}/watermark.png" class="watermark" />

        <!-- العنوان -->
        <div class="page_title">  نظام الادارة المالية المتكامل</div>
  <div style="display:flex; justify-content:space-between; font-size:18px; font-weight:bold; margin-bottom:15px;">
        <div class="title">جدول فواتير المبيعات</div>
        
        <div class="date">تاريخ الطباعة: ${today}</div>
</div>
        <!-- الجدول -->
        ${tableRef2.current.innerHTML}
        ${tableRef.current.innerHTML}

      </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <>
      <Group justify="space-between" mb="sm">
        <Group>
          <Button
            size="sm"
            radius="xl"
            color="green"
            variant="light"
            onClick={() => {
              setSelectedInvoice(null);
              setDrawerOpened(true);
            }}
          >
            فاتورة جديدة <Plus size={16} />
          </Button>

          <Button
            size="sm"
            radius="xl"
            color="blue"
            variant="light"
            leftSection={<MdLocalPrintshop size={16} />}
            onClick={handlePrintTable}
          >
            طباعة الجدول
          </Button>
        </Group>

        <InvoiceFilter onFilter={handleFilter} />
      </Group>

      {filteredInvoices.length > 0 && (
        <div ref={tableRef2}>
          <Table
            dir="rtl"
            withTableBorder
            className="mt-4 rounded-lg bg-white shadow-md"
          >
            <Table.Thead className="bg-blue-50">
              <Table.Tr>
                <Table.Th style={{ textAlign: "center" }}>
                  عدد الفواتير
                </Table.Th>
                <Table.Th style={{ textAlign: "center" }}>
                  إجمالي الفواتير
                </Table.Th>
                <Table.Th style={{ textAlign: "center" }}>
                  إجمالي المدفوع
                </Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              <Table.Tr>
                <Table.Td style={{ textAlign: "center" }}>
                  {invoicesCount}
                </Table.Td>

                <Table.Td style={{ textAlign: "center" }}>
                  {totalInvoicesAmount.toLocaleString(undefined, {
                    style: "currency",
                    currency: "JOD",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Table.Td>

                <Table.Td style={{ textAlign: "center" }}>
                  {totalPaidAmount.toLocaleString(undefined, {
                    style: "currency",
                    currency: "JOD",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </div>
      )}

      <ScrollArea mt="md" style={{ maxHeight: "70vh" }}>
        <div ref={tableRef}>
          <Table
            dir="rtl"
            className="w-full rounded-lg bg-white text-center shadow-md"
          >
            <Table.Thead className="bg-blue-50">
              <Table.Tr>
                <Table.Th style={{ textAlign: "center" }}>
                  رقم الفاتورة
                </Table.Th>
                <Table.Th style={{ textAlign: "center" }}>الزبون</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>التاريخ</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>
                  {" "}
                  اجمالي الفاتورة
                </Table.Th>
                <Table.Th style={{ textAlign: "center" }}>نقدا</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>تحويل بنكي</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>
                  عملات معدنية
                </Table.Th>
                <Table.Th style={{ textAlign: "center" }}>اخرى</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>
                  اجمالي المدفوع
                </Table.Th>
                <Table.Th style={{ textAlign: "center" }}>
                  المتبقي من الفاتورة
                </Table.Th>
                <Table.Th style={{ textAlign: "center" }}>
                  المدفوع من الرصيد
                </Table.Th>
                <Table.Th style={{ textAlign: "center" }}> رصيد سابق</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>  صافي الرصيد</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>الحالة</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>ملاحظات</Table.Th>
                <Table.Th
                  className="print-hide"
                  style={{ textAlign: "center" }}
                >
                  الإجراءات
                </Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {paginatedInvoices.map((inv) => {
                const numericStatus = Number(inv.status);
                return (
                  <Table.Tr key={inv.id} className="h-12 hover:bg-gray-100">
                    <Table.Td>{inv.invoice_no}</Table.Td>
                    <Table.Td>{inv.customer_name}</Table.Td>
                    <Table.Td>
                      {new Date(inv.invoice_date).toLocaleDateString()}
                    </Table.Td>
                    <Table.Td>
                      {(inv.grand_total || 0).toLocaleString(undefined, {
                        style: "currency",
                        currency: "JOD",  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
                      })}
                    </Table.Td>

                    <Table.Td>
                      {(inv.cash_amount || 0).toLocaleString(undefined, {
                        style: "currency",
                        currency: "JOD",  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
                      })}
                    </Table.Td>
                    <Table.Td>
                      {(inv.coins_amount || 0).toLocaleString(undefined, {
                        style: "currency",
                        currency: "JOD",  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
                      })}
                    </Table.Td>
                    <Table.Td>
                      {(inv.bank_transfer_amount || 0).toLocaleString(
                        undefined,
                        {
                          style: "currency",
                          currency: "JOD",  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
                        },
                      )}
                    </Table.Td>
                    <Table.Td>
                      {(inv.other_amount || 0).toLocaleString(undefined, {
                        style: "currency",
                        currency: "JOD",  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
                      })}
                    </Table.Td>

                    <Table.Td>
                      {(inv.paid_amount || 0).toLocaleString(undefined, {
                        style: "currency",
                        currency: "JOD",  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
                      })}
                    </Table.Td>
                    <Table.Td>
                      {(inv.remaining_invoice_amount || 0).toLocaleString(
                        undefined,
                        {
                          style: "currency",
                          currency: "JOD",
                            minimumFractionDigits: 2,
  maximumFractionDigits: 2,
                        },
                      )}
                    </Table.Td>

                    <Table.Td>
                      {(inv.paid_from_previous_balance || 0).toLocaleString(
                        undefined,
                        {
                          style: "currency",
                          currency: "JOD",
                            minimumFractionDigits: 2,
  maximumFractionDigits: 2,
                        },
                      )}
                    </Table.Td>
                    <Table.Td>
                      {(inv.remaining_previous_balance || 0).toLocaleString(
                        undefined,
                        {
                          style: "currency",
                          currency: "JOD",
                            minimumFractionDigits: 2,
  maximumFractionDigits: 2,
                        },
                      )}
                    </Table.Td>
                    <Table.Td>
                      {(
  (Number(inv.remaining_previous_balance) || 0) +
  (Number(inv.remaining_invoice_amount) || 0)
).toLocaleString(undefined, {
  style: "currency",
  currency: "JOD",
    minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
}
                    </Table.Td>
                    <Table.Td>
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
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" className="whitespace-pre-wrap">
                        {inv.notes || "-"}
                      </Text>
                    </Table.Td>
                    <Table.Td className="print-hide">
                      <Group className="justify-center" gap="xs">
                        <ActionIcon
                          radius="xl"
                          variant="light"
                          color="blue"
                          onClick={() => {
                            setInvoiceDetails(inv);
                            setDetailsOpened(true);
                          }}
                        >
                          <EyeIcon size={18} />
                        </ActionIcon>

                        <ActionIcon
                          radius="xl"
                          variant="light"
                          color="red"
                          onClick={() => handleDeleteClick(inv)}
                        >
                          <Trash2 size={18} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </div>
      </ScrollArea>
      <Pagination
        total={filteredInvoices.length} // العدد الكلي
        perPage={perPage} // عدد العناصر في الصفحة
        currentPage={currentPage} // الصفحة الحالية
        onPageChange={setCurrentPage} // دالة تغيير الصفحة
      />
      <SimpleInvoiceDrawer
        opened={drawerOpened}
        onClose={() => {
          setDrawerOpened(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
        onSubmit={handleSubmit}
      />

      <InvoiceDetailsModal
        opened={detailsOpened}
        onClose={() => setDetailsOpened(false)}
        invoice={invoiceDetails}
      />

      <ConfirmModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        onConfirm={handleConfirmDelete}
        title="حذف الفاتورة مبيعات"
        message="سيتم حذف الفاتورة نهائياً، وسيُعاد المبلغ المدفوع من الرصيد السابق للزبون إلى حسابه. لا يمكن التراجع عن هذه العملية. هل تريد المتابعة؟"
      />
    </>
  );
}
