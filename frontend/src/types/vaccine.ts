export interface Vaccine {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
  stock: number;
  capacity: number;
  lastUpdated: string;
  hospitalId?: string;
  hospitalName?: string;
  price?: number;
}

export interface UpdateStockRequest {
  vaccineId: string;
  quantity: number;
}
