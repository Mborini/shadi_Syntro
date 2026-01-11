"use client";

import { Group, Button, Text } from "@mantine/core";

interface PaginationProps {
  total: number;       // العدد الكلي للعناصر
  perPage: number;     // عدد العناصر في كل صفحة
  currentPage: number; // الصفحة الحالية
  onPageChange: (page: number) => void; // دالة تغيير الصفحة
}

export function Pagination({ total, perPage, currentPage, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / perPage);

  if (totalPages <= 1) return null; // لا تظهر إذا كانت صفحة واحدة فقط

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <Group align="center" justify="center" mt="md">
      <Button
        size="sm"
        variant="light"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        السابق
      </Button>

      {pages.map((page) => (
        <Button
          key={page}
          size="sm"
          variant={page === currentPage ? "filled" : "light"}
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}

      <Button
        size="sm"
        variant="light"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        التالي
      </Button>
    </Group>
  );
}
