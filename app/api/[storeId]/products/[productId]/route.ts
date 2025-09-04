import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { deleteImage } from "@/lib/storage/client"; 
export async function GET(req:Request, {params}:{params:{ productId:string}}) {

  const {productId} = await params;
   try{ 
    
    
    if (!productId){
      return new NextResponse("Product Id is required", {status:400})
    }
    


    const product = await prismadb.product.findUnique({
      where:{
        id:productId,
        
      },
      include:{
        images:true,
        size:true,
        category:true,
        color:true,
      }

    })

    return NextResponse.json(product)

   }catch(error){
    console.log("ERROR_GET_PRODUCT", error);
    return new NextResponse("Internal Error", {status:500})
   }
  
}
export async function PATCH(req:Request, {params}:{params:{storeId:string, productId:string}}) {
  const {storeId,productId} = await params;
   try{ 
    const {userId} = await auth();
    const body=await req.json();
    const {name,price,categoryId,sizeId,colorId,images,isFeatured,isArchived} = body


    if(!userId) {
      return new NextResponse("Unauthenticated", {status:401})}
    if(!name){
      return new NextResponse("Name is required", {status:400})
    }
    if(!price){
      return new NextResponse("Price is required", {status:400})
    }
    if(!images || !images.length){
      return new NextResponse("Image is required", {status:400})
    }
    if(!categoryId){
      return new NextResponse("Category Id is required", {status:400})
    
    }
    if(!sizeId){
      return new NextResponse("Size Id is required", {status:400})
    
    }
    if(!colorId){
      return new NextResponse("Color Id is required", {status:400})
    
    }
    if(!storeId){
      return new NextResponse("Store Id is required", {status:400})
    
    }
    if (!productId){
      return new NextResponse("Product Id is required", {status:400})
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

    await prismadb.product.update({
      where:{
        id:productId,
        
      },
      data:{
        name,
        price,
        isFeatured,
        isArchived,
        sizeId,
        colorId,
        categoryId,
        storeId:storeId,
        images:{ deleteMany:{

        }}
      }
    })
    const product = await prismadb.product.update({
      where:{
        id:productId
      },
      data:{
        images:{
          createMany:{
            data:[
              ...images.map((image:{url:string})=>image),
            ]
          }
        }
      }
    })
    return NextResponse.json(product)

   }catch(error){
    console.log("ERROR_PATCH_PRODUCT", error);
    return new NextResponse("Internal Error", {status:500})
   }
  
}



export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  const { storeId, productId } = params;

  try {
    const { userId } = await auth();

    if (!userId) return new NextResponse("Unauthorized User", { status: 401 });
    if (!productId) return new NextResponse("Product Id is required", { status: 400 });

    // Verify store ownership
    const storeByUserId = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });
    if (!storeByUserId) return new NextResponse("Unauthorized Access", { status: 403 });

    // Fetch product with images
    const product = await prismadb.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (!product) return new NextResponse("Product not found", { status: 404 });

    // Delete all images from Supabase storage
    for (const img of product.images) {
      try {
        await deleteImage(img.url);
      } catch (err) {
        console.error("Failed to delete image:", img.url, err);
        // Continue anyway; we still want to delete the product
      }
    }

    // Delete product (and cascade delete images if set up in Prisma)
    await prismadb.product.delete({
      where: { id: productId },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("ERROR_DELETE_PRODUCT", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
