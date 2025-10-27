import prismadb from "@/lib/prismadb"


 export const GetStockCount = async (storeId:string) => {
  const stockCount = await prismadb.product.count({
    where:{
      storeId,
      isArchived:false,
    },
    
  });

 return stockCount
}

