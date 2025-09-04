import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { deleteImage } from "@/lib/storage/client";
export async function GET(req:Request, {params}:{params:{ billboardId:string}}) {

  const {billboardId} = await params;
   try{ 
    
    
    if (!billboardId){
      return new NextResponse("Billboard Id is required", {status:400})
    }
    


    const billboard = await prismadb.billboard.findUnique({
      where:{
        id:billboardId,
        
      }

    })

    return NextResponse.json(billboard)

   }catch(error){
    console.log("ERROR_GET_BILLBOARD", error);
    return new NextResponse("Internal Error", {status:500})
   }
  
}
export async function PATCH(req:Request, {params}:{params:{storeId:string, billboardId:string}}) {
  const {storeId,billboardId} = await params;
   try{ 
    const {userId} = await auth();
    const body=await req.json();
    const { label,imageUrl} = body

    if(!userId) {
      return new NextResponse("Unauthenticated", {status:401})}
    if(!label){
      return new NextResponse("Label is required",{status:400})
    }
    if(!imageUrl){
      return new NextResponse("Image is required",{status:400})
    }
    if (!billboardId){
      return new NextResponse("Billboard Id is required", {status:400})
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

    const billboard = await prismadb.billboard.updateMany({
      where:{
        id:billboardId,
        
      },
      data:{
        label,
        imageUrl
      }
    })

    return NextResponse.json(billboard)

   }catch(error){
    console.log("ERROR_PATCH_BILLBOARD", error);
    return new NextResponse("Internal Error", {status:500})
   }
  
}

export async function DELETE(req:Request, {params}:{params:{storeId:string, billboardId:string}}) {
  const {storeId,billboardId} = await params;
   try{ 
    const {userId} = await auth();
    
    

    if(!userId) {
      return new NextResponse("Unauthorised User", {status:401})}
   
    
    if (!billboardId){
      return new NextResponse("Billboard Id is required", {status:400})
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
const billboard = await prismadb.billboard.findUnique({
      where: { id: billboardId },
    });

    if (!billboard) {
      return new NextResponse("Billboard not found", { status: 404 });
    }

    // 2. Delete the image from Supabase storage if it exists
    if (billboard.imageUrl) {
      try {
        await deleteImage(billboard.imageUrl);
      } catch (err) {
        console.error("Failed to delete image from storage:", err);
        // don’t return early, we still want to delete the DB record
      }
    }

    await prismadb.billboard.deleteMany({
      where:{
        id:billboardId,
        
      }

    })

    return NextResponse.json(billboard)

   }catch(error){
    console.log("ERROR_DELETE_BILLBOARD", error);
    return new NextResponse("Internal Error", {status:500})
   }
  
}