"use client";

import { Table, Button, Group, ActionIcon, ScrollArea } from "@mantine/core";
import { PencilIcon, Trash2, UserRoundPlus } from "lucide-react";
import { useEffect, useState } from "react";

import { TableSkeleton } from "../Common/skeleton";
import ConfirmModal from "../Common/ConfirmModal";

import { Toast } from "@/lib/toast";

import { BalanceDrawer } from "./customerDrawer";
import { CustomerBalance, CustomerBalanceDTO } from "@/types/balance";
import {
  createBalance,
  deleteBalance,
  getBalances,
  updateBalance,
} from "@/services/balanceServices";
import { getCustomers } from "@/services/customerServices";
import { Customer } from "@/types/customer";

export function BalancesTable() {
  const [balances, setBalances] = useState<CustomerBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [drawerOpened, setDrawerOpened] = useState(false);
  const [selectedBalance, setSelectedBalance] =
    useState<CustomerBalance | null>(null);

  const [balanceToDelete, setBalanceToDelete] =
    useState<CustomerBalance | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  // الزبائن الذين لم يُضاف لهم رصيد بعد
const availableCustomers = customers.filter(
  (c) => !balances.some((b) => b.customer_id === c.id)
);

  useEffect(() => {
    async function loadData() {
      try {
        const customerData = await getCustomers(); // API لجلب كل الزبائن
        setCustomers(customerData);

        const balanceData = await getBalances();
        setBalances(balanceData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);
  useEffect(() => {
    async function loadBalances() {
      setLoading(true);
      try {
        const data = await getBalances();
        setBalances(data);
      } catch (error) {
        console.error("Failed to fetch balances:", error);
      } finally {
        setLoading(false);
      }
    }
    loadBalances();
  }, []);

  const handleSubmit = async (data: CustomerBalanceDTO) => {
    try {
      if (selectedBalance) {
        await updateBalance(selectedBalance.id, data);
        const refreshedBalances = await getBalances();
        setBalances(refreshedBalances);
        Toast.success("تم تحديث الرصيد بنجاح");
      } else {
        await createBalance(data);
        const refreshedBalances = await getBalances();
        setBalances(refreshedBalances);
        Toast.success("تم اضافة الرصيد بنجاح");
      }
      setDrawerOpened(false);
    } catch (error) {
      Toast.error("فشل في حفظ الرصيد");
      console.error(error);
    }
  };

  const handleDeleteClick = (balance: CustomerBalance) => {
    setBalanceToDelete(balance);
    setModalOpened(true);
  };

  const handleConfirmDelete = async () => {
    if (balanceToDelete) {
      try {
        await deleteBalance(balanceToDelete.id);
        setBalances((prev) => prev.filter((b) => b.id !== balanceToDelete.id));
        setBalanceToDelete(null);
        setModalOpened(false);
        Toast.success("تم حذف الرصيد بنجاح");
      } catch (error) {
        console.error(error);
        Toast.error("فشل في حذف الرصيد");
      }
    }
  };

  if (loading) {
    return <TableSkeleton columns={4} />;
  }

  return (
    <>
      <Group mb="md">
        <Button
          color="green"
          variant="light"
          onClick={() => {
            setSelectedBalance(null);
            setDrawerOpened(true);
          }}
        >
          <UserRoundPlus size={18} />
        </Button>
      </Group>

      <ScrollArea>
        <div className="flex justify-center">
          <Table
            dir="rtl"
            className="w-full rounded-lg bg-white text-center shadow-md dark:bg-gray-dark dark:shadow-card"
          >
            <Table.Thead>
              <Table.Tr className="h-12 align-middle">
                <Table.Th style={{ textAlign: "center" }}>الاسم</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>الهاتف</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>العنوان</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>الرصيد</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>الإجراءات</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {balances.map((balance) => (
                <Table.Tr key={balance.id} className="h-12 align-middle">
                  <Table.Td>{balance.name}</Table.Td>
                  <Table.Td>{balance.phone}</Table.Td>
                  <Table.Td>{balance.address}</Table.Td>
                  <Table.Td>
                    {balance.balance
                      ? Number(balance.balance).toFixed(2)
                      : "0.00"}
                  </Table.Td>
                  <Table.Td>
                    <Group className="justify-center">
                      <ActionIcon
                        variant="subtle"
                        color="orange"
                        onClick={() => {
                          setSelectedBalance(balance);
                          setDrawerOpened(true);
                        }}
                      >
                        <PencilIcon size={18} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => handleDeleteClick(balance)}
                      >
                        <Trash2 size={18} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      </ScrollArea>

 <BalanceDrawer
  opened={drawerOpened}
  onClose={() => setDrawerOpened(false)}
  balance={selectedBalance}
  onSubmit={handleSubmit}
  customers={selectedBalance ? customers : availableCustomers}
/>


      <ConfirmModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        onConfirm={handleConfirmDelete}
        title="حذف الرصيد"
        message="هل تريد حذف هذا الرصيد؟"
        color="red"
      />
    </>
  );
}
