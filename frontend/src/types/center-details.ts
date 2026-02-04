export interface CenterDetailsVaccine {
  name: string;
  available: boolean;
  price: string;
}

export interface CenterData {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  operatingHours: {
    weekdays: string;
  };
  vaccines: CenterDetailsVaccine[];
  description: string;
  features: string[];
}
