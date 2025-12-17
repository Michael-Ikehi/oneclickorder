import { StoreDetails } from '../LandingPage';

export type BodyProps = {
  storeDetails: StoreDetails;
};

export type FoodVariationValue = {
  label: string;
  optionPrice: number;
};

export type RawFoodVariationValue = {
  label: string;
  optionPrice: string | number;
};

export type RawFoodVariation = {
  name: string;
  type: 'multi' | 'single';
  min: string | number;
  max: string | number;
  required: 'on' | 'off' | boolean;
  values: RawFoodVariationValue[];
};

export type FoodVariation = {
  name: string;
  type: 'multi' | 'single';
  min: number;
  max: number;
  required: boolean;
  values: FoodVariationValue[];
};

export interface AddOn {
  id: number;
  name: string;
  price: number;
}

export type Menu = {
  id: number;
  title: string;
};
