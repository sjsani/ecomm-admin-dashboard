import prismadb  from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
export async function GET(req:Request, {params}:{params:{ colorId:string}}) {

  const {colorId} = await params;
   try{ 
    
    
    if (!colorId){
      return new NextResponse("Color Id is required", {status:400})
    }
    


    const color = await prismadb.color.findUnique({
      where:{
        id:colorId,
        
      }

    })

    return NextResponse.json(color)

   }catch(error){
    console.log("ERROR_GET_COLOR", error);
    return new NextResponse("Internal Error", {status:500})
   }
  
}
export async function PATCH(req:Request, {params}:{params:{storeId:string, colorId:string}}) {
  const {storeId,colorId} = await params;
   try{ 
    const {userId} = await auth();
    const body=await req.json();
    const { name,value} = body

    if(!userId) {
      return new NextResponse("Unauthenticated", {status:401})}
    if(!name){
      return new NextResponse("Name is required",{status:400})
    }
    if(!value){
      return new NextResponse("Value is required",{status:400})
    }
    if (!colorId){
      return new NextResponse("Color Id is required", {status:400})
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

    const color = await prismadb.color.updateMany({
      where:{
        id:colorId,
        
      },
      data:{
        name,
        value
      }
    })

    return NextResponse.json(color)

   }catch(error){
    console.log("ERROR_PATCH_COLOR", error);
    return new NextResponse("Internal Error", {status:500})
   }
  
}

export async function DELETE(req:Request, {params}:{params:{storeId:string, colorId:string}}) {
  const {storeId,colorId} = await params;
   try{ 
    const {userId} = await auth();
    
    

    if(!userId) {
      return new NextResponse("Unauthorised User", {status:401})}
   
    
    if (!colorId){
      return new NextResponse("Color Id is required", {status:400})
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


    const color = await prismadb.color.deleteMany({
      where:{
        id:colorId,
        
      }

    })

    return NextResponse.json(color)

   }catch(error){
    console.log("ERROR_DELETE_COLOR", error);
    return new NextResponse("Internal Error", {status:500})
   }
  
}