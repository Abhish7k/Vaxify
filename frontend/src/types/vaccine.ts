export interface Vaccine {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
  stock: number;
  capacity: number;
  lastUpdated: string;
}

export interface UpdateStockRequest {
  vaccineId: string;
  quantity: number;
}
