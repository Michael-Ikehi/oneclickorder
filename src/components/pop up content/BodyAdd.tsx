import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToBasket, removeFromBasket } from '@/lib/store/basketSlice';
import { logActivity } from '@/lib/store/activityLogSlice';
import { RootState } from '@/lib/store/store';
import { StoreItem } from '../landing-page/LandingPage';
import { AddOn, FoodVariation } from '../landing-page/body/bodyType';
import BodyAddView from './BodyAddView';

type BodyAddProps = {
  item: StoreItem | null;
  closePopup: () => void;
  currency?: string;
  foodVariations?: FoodVariation[];
  addOns: AddOn[];
};

const baseImage = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
const defaultImage = '/images/placeholder.png';

const BodyAdd: React.FC<BodyAddProps> = ({
  item,
  closePopup,
  currency,
  foodVariations,
  addOns,
}) => {
  const dispatch = useDispatch();
  const basketItems = useSelector((state: RootState) => state.basket.items);
  const [quantity, setQuantity] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [freeQuantity, setFreeQuantity] = useState<number>(0);
  const [selections, setSelections] = useState<Map<string, string[]>>(new Map());
  const [imageSrc, setImageSrc] = useState(
    item?.image ? `${baseImage}/uploads/product/${item.image}` : defaultImage
  );

  const isBuyGetFree = !!item?.is_buy_get_free;

  const basketItem = item ? basketItems.find((b) => b.id === item.id) : null;

  useEffect(() => {
    if (item) {
      const existingQty = basketItem ? basketItem.quantity : 0;
      setQuantity(existingQty);
      if (isBuyGetFree) {
        setFreeQuantity(basketItem?.freeQuantity ?? 0);
      }
      if (basketItem?.variations) {
        setSelections(new Map(Object.entries(basketItem.variations)));
      }
    }
  }, [item, basketItem, isBuyGetFree]);

  if (!item) return <div className="text-center">No item selected</div>;

  const generateItemKey = (
    id: number,
    variations: Record<string, string[]>,
    addons: { id: number }[]
  ) => {
    const variationPart = Object.entries(variations)
      .map(([k, v]) => `${k}:${v.sort().join(',')}`)
      .sort()
      .join('|');

    const addonPart = addons
      .map((a) => a.id)
      .sort()
      .join(',');

    return `${id}|${variationPart}|${addonPart}`;
  };

  const toggleVariation = (
    variationSlug: string,
    variantLabel: string,
    type: string,
    max?: number
  ) => {
    setSelections((prev) => {
      const updated = new Map(prev);
      const currentSelections = updated.get(variationSlug) || [];

      if (type === 'single') {
        updated.set(variationSlug, currentSelections.includes(variantLabel) ? [] : [variantLabel]);
      } else {
        const exists = currentSelections.includes(variantLabel);
        if (exists) {
          updated.set(
            variationSlug,
            currentSelections.filter((v) => v !== variantLabel)
          );
        } else if (!max || currentSelections.length < max) {
          updated.set(variationSlug, [...currentSelections, variantLabel]);
        }
      }

      return updated;
    });
  };

  const selectedVariations: Record<string, string[]> = {};
  selections.forEach((value, key) => {
    if (value.length > 0) selectedVariations[key] = value;
  });

  const selectedAddOnIds = selections.get('addons') || [];
  const selectedAddOns = addOns.filter((addon) =>
    selectedAddOnIds.includes(`addon-${addon.id}-${item.id}`)
  );

  const existingItem = basketItems.find((i) => i.id === item.id);
  const itemKey = existingItem?.key ?? generateItemKey(item.id, selectedVariations, selectedAddOns);

  let totalVariationPrice = 0;
  foodVariations?.forEach((variation) => {
    const variationSlug = `${(variation.name || '').toLowerCase().replace(/\s+/g, '-')}-${item.id}`;
    const selectedLabels = selections.get(variationSlug) || [];

    selectedLabels.forEach((labelSlug) => {
      const match = variation.values.find((v) => {
        const expectedSlug = `${variationSlug}-${v.label.toLowerCase().replace(/\s+/g, '-')}`;
        return labelSlug === expectedSlug;
      });

      if (match) totalVariationPrice += match.optionPrice;
    });
  });

  const addonTotal = selectedAddOns.reduce((sum, addon) => sum + addon.price, 0);
  const base = item.price + totalVariationPrice + addonTotal;
  const finalPrice = quantity > 0 ? base * quantity : base;

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
    if (isBuyGetFree) setFreeQuantity((prev) => prev + 1);
  };

  const handleDecrease = () => {
    setQuantity((prev) => {
      const newQty = prev > 1 ? prev - 1 : 0;
      if (isBuyGetFree) setFreeQuantity(newQty);
      return newQty;
    });
  };

  const handleAddToBasket = () => {
    if (!item) return;

    const unfulfilledRequired = foodVariations?.filter((variation) => {
      const variationSlug = `${(variation.name || '').toLowerCase().replace(/\s+/g, '-')}-${item.id}`;
      const selected = selections.get(variationSlug) || [];
      return variation.required && selected.length === 0;
    });

    if (unfulfilledRequired && unfulfilledRequired.length > 0) {
      setError('Please select all required options before adding to basket.');
      return;
    }

    if (quantity === 0) {
      setError('Please select a quantity greater than 0.');
      return;
    }

    setError('');
    const timestamp = new Date().toLocaleString();

    if (quantity > 0) {
      dispatch(
        addToBasket({
          id: item.id,
          key: itemKey,
          name: item.name,
          price: item.price,
          quantity,
          totalPrice: finalPrice,
          image: item.image,
          freeQuantity: isBuyGetFree ? quantity : 0,
          variations: selectedVariations,
          variationPrice: totalVariationPrice,
          addons: selectedAddOns,
          is_buy_get_free: isBuyGetFree,
        })
      );

      dispatch(
        logActivity(`User added ${quantity} quantity of ${item.name} to basket at ${timestamp}`)
      );
    } else {
      dispatch(removeFromBasket({ key: itemKey }));
    }

    closePopup();
  };

  return (
    <BodyAddView
      item={item}
      imageSrc={imageSrc}
      defaultImage={defaultImage}
      currency={currency}
      quantity={quantity}
      freeQuantity={freeQuantity}
      foodVariations={foodVariations}
      addOns={addOns}
      selections={selections}
      toggleVariation={toggleVariation}
      handleDecrease={handleDecrease}
      handleIncrease={handleIncrease}
      handleAddToBasket={handleAddToBasket}
      error={error}
      isBuyGetFree={isBuyGetFree}
      finalPrice={finalPrice}
      setImageSrc={setImageSrc}
    />
  );
};

export default BodyAdd;
