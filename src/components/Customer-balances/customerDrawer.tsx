"use client";

import { Toast } from "@/lib/toast";
import { CustomerBalanceDTO, BalanceDrawerProps } from "@/types/balance";

import { Button, Drawer, NumberInput, Select } from "@mantine/core";
import { useState, useEffect } from "react";

interface Customer {
  id: number;
  name: string;
}

export function BalanceDrawer({
  opened,
  onClose,
  balance,
  onSubmit,
  customers, // هنا نمرر قائمة الزبائن من الأعلى
}: BalanceDrawerProps & { customers: Customer[] }) {
  const [form, setForm] = useState<CustomerBalanceDTO>({
    customer_id: 0,
    balance: 0,
  });

  useEffect(() => {
    if (balance) {
      setForm({
        customer_id: balance.customer_id,
        balance: balance.balance,
      });
    } else {
      setForm({
        customer_id: 0,
        balance: 0,
      });
    }
  }, [balance, opened]);

  const handleSubmit = () => {
    if (!form.customer_id) {
      return Toast.error("الرجاء اختيار الزبون!");
    }
    onSubmit(form);
    onClose();
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="sm"
      title={balance ? "تعديل الرصيد" : "اضافة رصيد جديد"}
    >
      <div dir="rtl" className="flex flex-col gap-4">
        <Select
          variant="filled"
          radius="md"
          label="اختر الزبون"
          placeholder="اختر زبون"
          value={form.customer_id.toString()}
          onChange={(value) => setForm({ ...form, customer_id: Number(value) })}
          data={customers.map((c) => ({
            value: c.id.toString(),
            label: c.name,
          }))}
        />

        <NumberInput
          variant="filled"
          radius="md"
          label="الرصيد"
          value={form.balance}
          onChange={(value) =>
            setForm({ ...form, balance: Number(value ?? 0) })
          }
        />

        <div className="mt-4 flex justify-center gap-2">
          <Button
            variant="light"
            color={balance ? "orange" : "green"}
            onClick={handleSubmit}
            fullWidth
          >
            {balance ? "تحديث" : "اضافة"}
          </Button>
          <Button color="red" variant="light" onClick={onClose} fullWidth>
            الغاء
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
