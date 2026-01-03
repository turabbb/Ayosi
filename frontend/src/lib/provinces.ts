// Province delivery pricing for Pakistan
export const provinces = [
  { value: "punjab", label: "Punjab", deliveryFee: 250 },
  { value: "sindh", label: "Sindh", deliveryFee: 300 },
  { value: "balochistan", label: "Balochistan", deliveryFee: 350 },
  { value: "kpk", label: "KPK", deliveryFee: 300 },
  { value: "gilgit", label: "Gilgit-Baltistan", deliveryFee: 380 },
  { value: "islamabad", label: "Islamabad", deliveryFee: 300 },
] as const;

export type Province = typeof provinces[number]["value"];

// Get delivery fee based on province - Free shipping for orders Rs. 5000+
export const getDeliveryFee = (province: Province | string, subtotal: number): number => {
  if (subtotal >= 5000) return 0;
  
  const selectedProvince = provinces.find(p => p.value === province);
  return selectedProvince?.deliveryFee || 300; // Default to 300 if province not found
};

// Get province label by value
export const getProvinceLabel = (value: string): string => {
  const province = provinces.find(p => p.value === value);
  return province?.label || value;
};

// Get delivery fee for display (without free shipping logic)
export const getBaseDeliveryFee = (province: Province | string): number => {
  const selectedProvince = provinces.find(p => p.value === province);
  return selectedProvince?.deliveryFee || 300;
};
