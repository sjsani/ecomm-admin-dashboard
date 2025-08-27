import { NextResponse } from "next/server";
import {auth} from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb";
export async function POST(req:Request, {params}:{params:{storeId:string}}) {
  const {storeId} = await params
  try{
    const {userId} = await auth()
    const body = await req.json();

    const {label,imageUrl} = body


    if(!userId){
      return new NextResponse("Unauthenticated", {status:401})
    }
    if(!label){
      return new NextResponse("Label is required", {status:400})
    }
    if(!imageUrl){
      return new NextResponse("Image is required", {status:400})
    }
    if(!storeId){
      return new NextResponse("Store Id is required", {status:400})
    
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
    const billboard = await prismadb.billboard.create({
      data:{
        label,
        imageUrl,
        storeId:storeId
      }
    });

    return NextResponse.json(billboard);
  } catch(error){
    console.log("BILLBOARDS_POST", error);
    return new NextResponse("Internal Error", {status:500})
  }
}

export async function GET(req:Request, {params}:{params:{storeId:string}}) {
  const {storeId} = await params
  try{


  
    
    
    if(!storeId){
      return new NextResponse("Store Id is required", {status:400})
    
    }
    
      
    
    const billboard = await prismadb.billboard.findMany({
      where:{

        storeId:storeId,
      }
    });

    return NextResponse.json(billboard);
  } catch(error){
    console.log("BILLBOARDS_POST", error);
    return new NextResponse("Internal Error", {status:500})
  }
}