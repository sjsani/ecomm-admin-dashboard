import prismadb from '@/lib/prismadb';
import React from 'react';
import { ProductForm } from './components/ProductForm';

const ProductPage = async ({
  params,
}: {
  params: { productId: string; storeId: string };
}) => {
  const { productId, storeId } = await params;

  const product = await prismadb.product.findUnique({
    where: { id: productId },
    include: { images: true },
  });

  const categories = await prismadb.category.findMany({
    where: { storeId },
  });

  const colors = await prismadb.color.findMany({
    where: { storeId },
  });

  const sizes = await prismadb.size.findMany({
    where: { storeId },
  });

  // Serialize product for Client Component
  const initialData = product
    ? {
        ...product,
        price: Number(product.price), // convert Decimal → number
      }
    : null;

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductForm
          categories={categories}
          colors={colors}
          sizes={sizes}
          initialData={initialData as any}
        />
      </div>
    </div>
  );
};

export default ProductPage;
