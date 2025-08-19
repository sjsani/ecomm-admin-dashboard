import { NextResponse } from "next/server";
import {auth} from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb";
export async function POST(req:Request) {
  try{
    const {userId} = await auth()
    const body = await req.json();

    const {name} = body


    if(!userId){
      return new NextResponse("Unauthorized Access", {status:401})
    }
    if(!name){
      return new NextResponse("Require a Name", {status:400})
    }
    const store = await prismadb.store.create({
      data:{
        name,
        userId
      }
    });

    return NextResponse.json(store);
  } catch(error){
    console.log("ERROR_POST_STORES", error);
    return new NextResponse("Internal Error", {status:500})
  }
}