"use client"

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Category, Color, Image, Product, Size, Store } from "@prisma/client"
import { Trash } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { AlertModal } from "@/components/models/alert-modal";
import ImageUpload from "@/components/ui/image-upload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { deleteImage, uploadImage } from "@/lib/storage/client";
import { convertBlobUrlToFile } from "@/lib/blobtourl";

interface ProductFormProps {
  initialData:Product&{
    images:Image[]
  }|null;
  categories: Category[];
  colors:Color[];
  sizes:Size[];

}

const formSchema = z.object({
  name: z.string().min(1),
  images: z.object({ url: z.string() }).array(),
  price:z.transform(Number).pipe(z.number().min(1)),
  categoryId: z.string().min(1),
  colorId: z.string().min(1),
  sizeId: z.string().min(1),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
});
type ProductFormValues = z.infer<typeof formSchema>;


export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,categories,sizes,colors,
}) =>{

  const form = useForm<ProductFormValues>({
  resolver: zodResolver(formSchema),
  defaultValues: initialData
    ? {
        ...initialData,
        images: initialData.images?.map((img) => ({ url: img.url })) ?? [],
        price: parseFloat(String(initialData.price)),
      }
    : {
        name: '',
        images: [],
        price: 0,
        categoryId: '',
        colorId: '',
        sizeId: '',
        isFeatured: false,
        isArchived: false,
      }
});
  const params = useParams()
  const[open, setOpen] = useState(false);
  const [loading,setLoading]= useState(false)
  const router = useRouter()

  const title = initialData? "Edit Product":"Create Product"
  const description = initialData? "Edit a Product":"Add a new Product"
  const toastMessage = initialData? "Product Updated":"Product Created"
  const action = initialData? "Save Product":"Create"

const onSubmit = async (data: ProductFormValues) => {
  try {
    setLoading(true);

    const uploadedImages: { url: string }[] = [];

    // 1️⃣ Handle removed images if updating
    if (initialData) {
      // All original images from DB
      const originalUrls = initialData.images.map((img) => img.url);

      // All images currently in the form (before uploading new blobs)
      const formUrls = data.images
        .filter((img) => img.url.startsWith("http"))
        .map((img) => img.url);

      // Determine which images were removed
      const removedUrls = originalUrls.filter((url) => !formUrls.includes(url));

      // Delete removed images from Supabase storage
      for (const url of removedUrls) {
        try {
          await deleteImage(url);
        } catch (err) {
          console.error("Failed to delete removed image:", url, err);
        }
      }
    }

    // 2️⃣ Upload new blob images
    for (const img of data.images) {
      if (img.url.startsWith("http")) {
        uploadedImages.push({ url: img.url });
        continue;
      }

      if (!img.url) continue;
      const file = await convertBlobUrlToFile(img.url);

      const { imageUrl, error } = await uploadImage({
        file,
        bucket: "images",
        folder: `products/${params.storeId}`,
      });

      if (!imageUrl || error) {
        toast.error("Image upload failed");
        setLoading(false);
        return;
      }

      uploadedImages.push({ url: imageUrl });
    }

    // 3️⃣ Ensure at least one image
    if (uploadedImages.length === 0) {
      toast.error("At least one image is required");
      setLoading(false);
      return;
    }

    // 4️⃣ Prepare payload with final images
    const payload = { ...data, images: uploadedImages };

    // 5️⃣ Call patch or post API
    if (initialData) {
      await axios.patch(
        `/api/${params.storeId}/products/${params.productId}`,
        payload
      );
    } else {
      await axios.post(`/api/${params.storeId}/products`, payload);
    }

    router.refresh();
    router.push(`/${params.storeId}/products`);
    toast.success(initialData ? "Product Updated" : "Product Created");
  } catch (err) {
    console.error("PRODUCTS_SUBMIT_ERROR:", err);
    toast.error("Something went wrong");
  } finally {
    setLoading(false);
  }
};




  const onDelete = async()=>{
    try{
      setLoading(true)
      await axios.delete(`/api/${params.storeId}/products/${params.productId}`)
      router.refresh();
      router.push(`/${params.storeId}/products`)
      toast.success("Product Deleted")
    }catch(error){
      toast.error("Problem with deleting Product")
    }finally{
      setLoading(false)
      setOpen(false)
    }
  }
  
  return(
    <>
    <AlertModal
    isOpen={open}
    onClose={()=>setOpen(false)}
    onConfirm={onDelete}
    loading={loading}/>
    <div className=" flex items-center justify-between">
      <Heading 
      title={title}
      description={description} />
      {initialData &&(
      <Button disabled={loading} variant="destructive" size="sm" onClick={()=>setOpen(true)}>
        <Trash className="h-2 w-4" />
      </Button>)}
      
    </div>
    <Separator />
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
      <FormField
        control={form.control}
        name="images"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Images</FormLabel>
            <FormControl>
              <ImageUpload
                value={field.value.map((img) => img.url)} // extract URLs
                disabled={loading}
                multiple={true}
                onChange={(urls) => field.onChange(urls.map((u) => ({ url: u })))} // wrap back into { url }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

        <div className="grid grid-cols-3 gap-8">
          <FormField
          control={form.control}
          name="name"
          render={({field})=>(
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input disabled={loading} placeholder="Porduct Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField
          control={form.control}
          name="price"
          render={({field})=>(
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input type="number" disabled={loading} placeholder="9.99" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField
          control={form.control}
          name="categoryId"
          render={({field})=>(
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select disabled ={loading} onValueChange ={field.onChange} value={field.value} defaultValue={field.value}> 
                <FormControl>
                  <SelectTrigger>
                    <SelectValue defaultValue={field.value} placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category)=>(
                    <SelectItem
                    key={category.id}
                    value={category.id}>
                      {category.name}
                    </SelectItem> 
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField
          control={form.control}
          name="sizeId"
          render={({field})=>(
            <FormItem>
              <FormLabel>Size</FormLabel>
              <Select disabled ={loading} onValueChange ={field.onChange} value={field.value} defaultValue={field.value}> 
                <FormControl>
                  <SelectTrigger>
                    <SelectValue defaultValue={field.value} placeholder="Select a Size" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sizes.map((size)=>(
                    <SelectItem
                    key={size.id}
                    value={size.id}>
                      {size.name}
                    </SelectItem> 
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField
          control={form.control}
          name="colorId"
          render={({field})=>(
            <FormItem>
              <FormLabel>Color</FormLabel>
              <Select disabled ={loading} onValueChange ={field.onChange} value={field.value} defaultValue={field.value}> 
                <FormControl>
                  <SelectTrigger>
                    <SelectValue defaultValue={field.value} placeholder="Select a color" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {colors.map((color)=>(
                    <SelectItem
                    key={color.id}
                    value={color.id}>
                      {color.name}
                    </SelectItem> 
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField
          control={form.control}
          name="isFeatured"
          render={({field})=>(
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Featured
                </FormLabel>
                <FormDescription>
                  This product will appear on the Home Page.
                </FormDescription>
              </div>
            </FormItem>
          )} />
                    <FormField
          control={form.control}
          name="isArchived"
          render={({field})=>(
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Archived
                </FormLabel>
                <FormDescription>
                  This product will not appear anywhere in the Store.
                </FormDescription>
              </div>
            </FormItem>
          )} />
        </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
      </form>

    </Form>
    <Separator />
    
    </>
  )
}