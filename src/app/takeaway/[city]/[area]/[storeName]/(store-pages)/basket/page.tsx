import React, { use } from 'react';
import BasketWrapper from './BasketWrapper';

type Params = { storeName: string };

const Page = ({ params }: { params: Promise<Params> }) => {
  const { storeName } = use(params);
  return (
    <div className="min-h-screen">
      <BasketWrapper storeName={storeName} />
    </div>
  );
};

export default Page;
