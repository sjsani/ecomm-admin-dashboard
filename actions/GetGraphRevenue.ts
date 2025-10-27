import prismadb from "@/lib/prismadb"
import { parse } from "path";

interface GraphData{
  name:string;
  total:number
}
 export const GetGraphRevenue = async (storeId:string) => {
  const paidOrders = await prismadb.order.findMany({
    where:{
      storeId,
      isPaid:true,
    },
    include:{
      orderItems:{
        include:{
          product:true
        }
      }
    }
    
  });

  const MonthlyRevenue:{ [key:number]:number} ={} ;
  for (const order of paidOrders){
    const month = order.createdAt.getMonth();
    let revenueForOrder =0;
    for (const item of order.orderItems){
      revenueForOrder += item.product.price.toNumber();
    }

    MonthlyRevenue[month] = (MonthlyRevenue[month] || 0) + revenueForOrder;
  }

  const graphData:GraphData[] = [
    {name:"January", total: 0},
    {name:"February", total: 0},
    {name:"March", total: 0},
    {name:"April", total: 0},
    {name:"May", total: 0},
    {name:"June", total: 0},
    {name:"July", total: 0},
    {name:"August", total: 0},
    {name:"September", total: 0},
    {name:"October", total: 0},
    {name:"November", total: 0},
    {name:"December", total: 0},
    
  ];

  for (const month in MonthlyRevenue){
    graphData[parseInt(month)].total = MonthlyRevenue[parseInt(month)];
  }

  return graphData
}

