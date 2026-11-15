export type LaptopStatus = 'AVAILABLE' | 'IN_USE' | 'REPAIR';

export interface Component {
  id: number;
  type: string;
  serialNumber: string;
  laptopId: number | null;
  laptop?: Laptop | null;
}

export interface Laptop {
  id: number;
  serialNumber: string;
  model: string;
  status: LaptopStatus;
  components: Component[];
}