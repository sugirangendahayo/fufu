export type Address = {
  building?: string | null;
  cell?: string | null;
  createdAt: string;
  district: string;
  id: string;
  instructions?: string | null;
  isDefault: boolean;
  label?: string | null;
  phone: string;
  province: string;
  recipientName: string;
  sector?: string | null;
  street?: string | null;
  updatedAt: string;
};

export type AddressInput = {
  building?: string;
  cell?: string;
  district: string;
  instructions?: string;
  isDefault?: boolean;
  label?: string;
  phone: string;
  province: string;
  recipientName: string;
  sector?: string;
  street?: string;
};

export type ProfileInput = {
  firstName?: string;
  lastName?: string | null;
};
