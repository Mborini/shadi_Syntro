export interface CustomerBalance {
  id: number;
  customer_id: number;
  name: string; // اسم الزبون للعرض في الجدول
  phone: string;
  address: string;
  balance: number;
}

export interface CustomerBalanceDTO {
  customer_id: number;
  balance: number;
}

export interface BalanceDrawerProps {
  opened: boolean;
  onClose: () => void;
  balance: CustomerBalance | null;
  onSubmit: (data: CustomerBalanceDTO) => void;
}
