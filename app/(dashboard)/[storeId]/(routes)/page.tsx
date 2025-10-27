import { GetGraphRevenue } from "@/actions/GetGraphRevenue";
import { GetSalesCount } from "@/actions/GetSalesCount";
import { GetStockCount } from "@/actions/GetStockCount";
import { GetTotalRevenue } from "@/actions/GetTotalRevenue";
import Overview from "@/components/Overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import prismadb from "@/lib/prismadb"
import { formatter } from "@/lib/utils";
import { CreditCard, DollarSign, Package } from "lucide-react";


interface DashboardPageProps {
  params:{
    storeId:string
  }
}

const DashboardPage: React.FC<DashboardPageProps> = async ({params}) =>{
  const totalRevenue = await GetTotalRevenue(params.storeId)
  const salesCount = await GetSalesCount(params.storeId)
  const stockCount =  await GetStockCount(params.storeId)

  const graphRevenue = await GetGraphRevenue(params.storeId)


  return (
    <div className="flex-col">|
      <div className=" flex-1 space-y-4 p-8 pt-6">
        <Heading title="Dashboard" description="Overview of Your Store" />
        <Separator />
        <div className=" grid gap-4 grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle  className="text-sm font-medium">Total Revenue</CardTitle>
              
              <DollarSign className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatter.format(totalRevenue)}
              </div>
            </CardContent>
            
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle  className="text-sm font-medium">Sales</CardTitle>
              
              <CreditCard className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                +{salesCount}
              </div>
            </CardContent>
            
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle  className="text-sm font-medium">Products In Stock</CardTitle>
              
              <Package className="h-2 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
               {stockCount}
              </div>
            </CardContent>
            
          </Card>

        </div>
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={graphRevenue} />
          </CardContent>

        </Card>
      </div>
      
    </div>
  );
}
export default DashboardPage;