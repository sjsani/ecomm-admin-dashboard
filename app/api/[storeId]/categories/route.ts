import { NextResponse } from "next/server";
import {auth} from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb";
export async function POST(req:Request, {params}:{params:{storeId:string}}) {
  const {storeId} = await params
  try{
    const {userId} = await auth()
    const body = await req.json();

    const {name,billboardId} = body


    if(!userId){
      return new NextResponse("Unauthenticated", {status:401})
    }
    if(!name){
      return new NextResponse("Name is required", {status:400})
    }
    if(!billboardId){
      return new NextResponse("Choose a billboard", {status:400})
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
    const category = await prismadb.category.create({
      data:{
        name,
        billboardId,
        storeId:storeId
      }
    });

    return NextResponse.json(category);
  } catch(error){
    console.log("CATEGORIES_POST", error);
    return new NextResponse("Internal Error", {status:500})
  }
}

export async function GET(req:Request, {params}:{params:{storeId:string}}) {
  const {storeId} = await params
  try{


  
    
    
    if(!storeId){
      return new NextResponse("Store Id is required", {status:400})
    
    }
    
      
    
    const category = await prismadb.category.findMany({
      where:{

        storeId:storeId,
      }
    });

    return NextResponse.json(category);
  } catch(error){
    console.log("CATEGORIES_POST", error);
    return new NextResponse("Internal Error", {status:500})
  }
}