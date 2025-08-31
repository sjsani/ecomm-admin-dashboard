"use client"

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Color,  Store } from "@prisma/client"
import { Trash } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { AlertModal } from "@/components/models/alert-modal";
import ImageUpload from "@/components/ui/image-upload";

interface ColorFormProps {
  initialData:Color|null;
}

const formSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
})
type ColorFormValues = z.infer<typeof formSchema>;


export const ColorForm: React.FC<ColorFormProps> = ({
  initialData
}) =>{

  const form = useForm<ColorFormValues>({
    resolver:zodResolver(formSchema),
    defaultValues: initialData || {
      name:"",
      value:'',

    }
  })
  const params = useParams()
  const[open, setOpen] = useState(false);
  const [loading,setLoading]= useState(false)
  const router = useRouter()

  const title = initialData? "Edit Color":"Create Color"
  const description = initialData? "Edit a Color":"Add a new Color"
  const toastMessage = initialData? "Color Updated":"Color Created"
  const action = initialData? "Save Color":"Create"

  const onSubmit = async (data: ColorFormValues) => {
    try{
      setLoading(true)
      if(initialData){
        await axios.patch(`/api/${params.storeId}/colors/${params.colorId}`, data);
      }else{await axios.post(`/api/${params.storeId}/colors`, data);}
      
      router.refresh()
      router.push(`/${params.storeId}/colors`)
      toast.success(toastMessage)
    }catch(error){
      toast.error("Something Went Wrong.")

    }finally{
      setLoading(false)
    }
  };
  const onDelete = async()=>{
    try{
      setLoading(true)
      await axios.delete(`/api/${params.storeId}/colors/${params.colorId}`)
      router.refresh();
      router.push(`/${params.storeId}/colors`)
      toast.success("Color Deleted")
    }catch(error){
      toast.error("Make Sure you removed all products using this color.")
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

        <div className="grid grid-cols-3 gap-8">
          <FormField
          control={form.control}
          name="name"
          render={({field})=>(
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input disabled={loading} placeholder="Color Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
                    <FormField
          control={form.control}
          name="value"
          render={({field})=>(
            <FormItem>
              <FormLabel>Value</FormLabel>
              <FormControl>
                <Input disabled={loading} placeholder="Color Value" {...field} />
              </FormControl>
              <FormMessage />
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