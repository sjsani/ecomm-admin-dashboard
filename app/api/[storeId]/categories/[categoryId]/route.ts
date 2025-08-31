import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
export async function GET(req:Request, {params}:{params:{ categoryId:string}}) {

  const {categoryId} = await params;
   try{ 
    
    
    if (!categoryId){
      return new NextResponse("category Id is required", {status:400})
    }
    


    const category = await prismadb.category.findUnique({
      where:{
        id:categoryId,
        
      }

    })

    return NextResponse.json(category)

   }catch(error){
    console.log("ERROR_GET_CATEGORY", error);
    return new NextResponse("Internal Error", {status:500})
   }
  
}
export async function PATCH(req:Request, {params}:{params:{storeId:string, categoryId:string}}) {
  const {storeId,categoryId} = await params;
   try{ 
    const {userId} = await auth();
    const body=await req.json();
    const { name,billboardId} = body

    if(!userId) {
      return new NextResponse("Unauthenticated", {status:401})}
    if(!name){
      return new NextResponse("Name is required",{status:400})
    }
    if(!billboardId){
      return new NextResponse("Billboard ID is required",{status:400})
    }
    if (!categoryId){
      return new NextResponse("Category Id is required", {status:400})
    }
    const storeByUserId = await prismadb.store.findFirst({
      where:{
        id:storeId,
        userId


      }
    })

    if(!storeByUserId){
      return new NextResponse("Unauthorized Access", {status:403})
      
    }

    const category = await prismadb.category.updateMany({
      where:{
        id:categoryId,
        
      },
      data:{
        name,
        billboardId
      }
    })

    return NextResponse.json(category)

   }catch(error){
    console.log("ERROR_PATCH_CATEGORY", error);
    return new NextResponse("Internal Error", {status:500})
   }
  
}

export async function DELETE(req:Request, {params}:{params:{storeId:string, categoryId:string}}) {
  const {storeId,categoryId} = await params;
   try{ 
    const {userId} = await auth();
    
    

    if(!userId) {
      return new NextResponse("Unauthorised User", {status:401})}
   
    
    if (!categoryId){
      return new NextResponse("Category Id is required", {status:400})
    }
    const storeByUserId = await prismadb.store.findFirst({
      where:{
        id:storeId,
        userId


      }
    })

    if(!storeByUserId){
      return new NextResponse("Unauthorized Access", {status:403})
      
    }


    const category = await prismadb.category.deleteMany({
      where:{
        id:categoryId,
        
      }

    })

    return NextResponse.json(category)

   }catch(error){
    console.log("ERROR_DELETE_CATEGORY", error);
    return new NextResponse("Internal Error", {status:500})
   }
  
}