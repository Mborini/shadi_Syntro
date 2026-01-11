// data.ts
import {
  DoorClosed,
  GitBranchIcon,
  GraduationCap,
  NotepadText,
  ShieldUser,
  UnplugIcon,
  User2Icon,
  UserCog,
} from "lucide-react";
import {
  TbCashRegister,
  TbFileInvoice,
  TbInvoice,
  TbPackageImport,
  TbPackages,
  TbReportAnalytics,
} from "react-icons/tb";
import { RiAlignItemBottomLine, RiAlignItemLeftFill } from "react-icons/ri";
import { SiHomeassistantcommunitystore } from "react-icons/si";
import { AiOutlineProduct } from "react-icons/ai";
import { IoMdMan } from "react-icons/io";
import {
  FaBoxesStacked,
  FaDollarSign,
  FaFileInvoice,
  FaFileInvoiceDollar,
  FaTruckRampBox,
  FaUsersBetweenLines,
  FaUsersGear,
} from "react-icons/fa6";
import { PiEyeDuotone, PiInvoiceBold, PiInvoiceDuotone } from "react-icons/pi";
import { FaHome, FaShuttleVan } from "react-icons/fa";
import { HiOutlineUsers, HiUserGroup } from "react-icons/hi2";
import { BiSolidCalendarHeart, BiSolidPackage } from "react-icons/bi";
import { TbPackageExport } from "react-icons/tb";
import { PiHandWithdrawDuotone } from "react-icons/pi";
import { LiaFileInvoiceDollarSolid } from "react-icons/lia";
import { SlCalender } from "react-icons/sl";
import { MdOutlineManageAccounts, MdStarBorder } from "react-icons/md";
import { TfiUser } from "react-icons/tfi";
import { FcLeave } from "react-icons/fc";
import { FaClipboardUser } from "react-icons/fa6";

export interface NavItem {
  title: string;
  url?: string;
  icon?: React.ComponentType<any>;
  color?: string;
  items: NavItem[]; // دائمًا مصفوفة
}

export interface NavSection {
  label: string;
  color?: string;
  items: NavItem[];
}

export const NAV_DATA: NavSection[] = [
  {
    label: " ",
    items: [
      {
        title: "الصفحة الرئيسية",
        url: "../",
        icon: FaHome,

        items: [],
      },
      {
        title: "الفواتير",

        icon: PiInvoiceDuotone,
        items: [
          {
            title: "مشتريات",

            url: "/dashboard/invoices/purchases",
            icon: TbInvoice,
            items: [],
          },
          {
            title: "مصاريف",

            url: "/dashboard/invoices/expenses",
            icon: LiaFileInvoiceDollarSolid,
            items: [],
          },
          {
            title: "مبيعات",

            url: "/dashboard/invoices/sales",
            icon: TbFileInvoice,
            items: [],
          },
        ],
      },
      {
        title: "الاصناف",
        icon: TbPackages,

        items: [
          {
            title: "اصناف المشتريات",
            url: "/dashboard/items/purchasesItems",
            icon: TbPackageImport,

            items: [],
          },
          {
            title: "اصناف المبيعات",
            url: "/dashboard/items/salesItems",

            icon: TbPackageExport,
            items: [],
          },
        ],
      },
      {
        title: "التقارير",
        icon: TbReportAnalytics,

        items: [
          {
            title: "تقرير الموظفين",
            url: "/dashboard/reports/employees",
            icon: FaClipboardUser,

            items: [],
          },
          {
            title: "التقرير المالي",
            url: "/dashboard/reports/monthly",
            icon: NotepadText,

            items: [],
          },
        ],
      },
      {
        title: "رموز النظام",
        icon: MdStarBorder,

        items: [
          {
            title: "الموردون",
            url: "/dashboard/suppliers",
            icon: FaShuttleVan,

            items: [],
          },
          
          {
            title: "أنواع المصاريف",
            url: "/dashboard/expensesTypes",
            icon: FaDollarSign,

            items: [],
          },
          {
            title: "الزبائن",
            url: "/dashboard/customers",
            icon: HiOutlineUsers,

            items: [],
          },
          {
            title: "ذمم الزبائن",
            url: "/dashboard/customer-balances",
            icon: HiOutlineUsers,

            items: [],
          },{
            title: "المستخدمين",
            url: "/dashboard/users",
            icon: TfiUser,
            items: [],
          },
        ],
      },
      {
        title: "المستودعات",

        icon: SiHomeassistantcommunitystore,
        items: [
          {
            title: "المواد الاولية",
            url: "",

            icon: FaTruckRampBox,
            items: [
              {
                title: "عرض المستودع",

                url: "/dashboard/inventories/inventory",
                icon: PiEyeDuotone,
                items: [],
              },
              {
                title: "حركات السحب",

                url: "/dashboard/inventories/InventoryWithdraw",
                icon: PiHandWithdrawDuotone,
                items: [],
              },
            ],
          },
          {
            title: "مستودع الانتاج ",

            url: "/dashboard/inventories/WarehouseTable",
            icon: FaBoxesStacked,
            items: [],
          },
        ],
      },
      {
        title: "الموظفين",
        icon: FaUsersBetweenLines,

        items: [
          {
            title: "ادارة الموظفين",
            url: "/dashboard/HR/management",
            icon: FaUsersGear,

            items: [],
          },
          {
            title: "الدوام اليومي",
            url: "/dashboard/HR/attendance",
            icon: SlCalender,

            items: [],
          },
          {
            title: " الإجازات",
            url: "/dashboard/HR/leaves",
            icon: FcLeave,

            items: [],
          },
          {
            title: " المسحوبات",
            url: "/dashboard/HR/withdrawals",
            icon: TbCashRegister,

            items: [],
          },
          {
            title: " دفع الرواتب",
            url: "/dashboard/HR/payroll",
            icon: TbCashRegister,

            items: [],
          },
        ],
      },
    ],
  },
];
