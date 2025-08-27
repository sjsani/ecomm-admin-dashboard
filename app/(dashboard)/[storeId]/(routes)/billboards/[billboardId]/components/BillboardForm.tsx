"use client"

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Billboard, Store } from "@prisma/client"
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
import { ApiAlert } from "@/components/ui/api-alert";
import { useOrigin } from "@/hooks/use-origin";

interface BillboardFormProps {
  initialData:Billboard|null;
}

const formSchema = z.object({
  label: z.string().min(1),
  imageUrl: z.string().min(1),
})
type BillboardFormValues = z.infer<typeof formSchema>;


export const BillboardForm: React.FC<BillboardFormProps> = ({
  initialData
}) =>{

  const form = useForm<BillboardFormValues>({
    resolver:zodResolver(formSchema),
    defaultValues: initialData || {
      label:"",
      imageUrl:'',

    }
  })
  const params = useParams()
  const[open, setOpen] = useState(false);
  const [loading,setLoading]= useState(false)
  const router = useRouter()
  const origin = useOrigin()
  const title = initialData? "Edit Billboard":"Create Billboard"
  const description = initialData? "Edit a Billboard":"Add a new Billboard"
  const toastMessage = initialData? "Billboard Updated":"Billboard Created"
  const action = initialData? "Save Billboard":"Create"

  const onSubmit = async (data: BillboardFormValues) => {
    try{
      setLoading(true)
      await axios.patch(`/api/stores/${params.storeId}`, data);
      router.refresh()
      toast.success("Store Updated")
    }catch(error){
      toast.error("Something Went Wrong.")

    }finally{
      setLoading(false)
    }
  };
  const onDelete = async()=>{
    try{
      setLoading(true)
      await axios.delete(`/api/stores/${params.storeId}`)
      router.refresh();
      router.push("/")
      toast.success("Store Deleted")
    }catch(error){
      toast.error("Make Sure you removed all products and categories first.")
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
          name="label"
          render={({field})=>(
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input disabled={loading} placeholder="Billboard Label" {...field} />
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