"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Billboard } from "@prisma/client";
import { Trash } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { AlertModal } from "@/components/models/alert-modal";
import ImageUpload from "@/components/ui/image-upload";
import { convertBlobUrlToFile } from "@/lib/blobtourl";
import { deleteImage, uploadImage } from "@/lib/storage/client";

interface BillboardFormProps {
  initialData: Billboard | null;
}

const formSchema = z.object({
  label: z.string().min(1, "Label is required"),
  imageUrl: z.string().min(1, "An image is required"),
});

type BillboardFormValues = z.infer<typeof formSchema>;

export const BillboardForm: React.FC<BillboardFormProps> = ({ initialData }) => {
  const form = useForm<BillboardFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      label: "",
      imageUrl: "",
    },
  });

  const params = useParams();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const title = initialData ? "Edit Billboard" : "Create Billboard";
  const description = initialData
    ? "Edit a Billboard"
    : "Add a new Billboard";
  const toastMessage = initialData
    ? "Billboard Updated"
    : "Billboard Created";
  const action = initialData ? "Save Billboard" : "Create";

const onSubmit = async (data: BillboardFormValues) => {
  try {
    setLoading(true);

    let imageUrl = data.imageUrl;

    // 🟢 If the current image was removed from initialData, delete it from Supabase
    if (initialData?.imageUrl && initialData.imageUrl !== data.imageUrl) {
      try {
        await deleteImage(initialData.imageUrl);
      } catch (err) {
        console.error("Failed to delete old billboard image:", err);
      }
    }

    // 🟢 If the new image is a blob URL, upload it
    if (imageUrl && !imageUrl.startsWith("http")) {
      const file = await convertBlobUrlToFile(imageUrl);

      const { imageUrl: uploadedUrl, error } = await uploadImage({
        file,
        bucket: "images",
        folder: `billboards/${params.storeId}`,
      });

      if (error || !uploadedUrl) {
        toast.error("Image upload failed");
        setLoading(false);
        return;
      }

      imageUrl = uploadedUrl;
    }

    // Final payload
    const finalData: BillboardFormValues = {
      ...data,
      imageUrl,
    };

    if (initialData) {
      await axios.patch(
        `/api/${params.storeId}/billboards/${params.billboardId}`,
        finalData
      );
    } else {
      await axios.post(`/api/${params.storeId}/billboards`, finalData);
    }

    router.refresh();
    router.push(`/${params.storeId}/billboards`);
    toast.success(initialData ? "Billboard Updated" : "Billboard Created");
  } catch (error) {
    console.error("BILLBOARD_SUBMIT_ERROR:", error);
    toast.error("Something went wrong.");
  } finally {
    setLoading(false);
  }
};



  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `/api/${params.storeId}/billboards/${params.billboardId}`
      );
      router.refresh();
      router.push(`/${params.storeId}/billboards`);
      toast.success("Billboard deleted");
    } catch (error) {
      toast.error("Make sure you removed all categories using this billboard.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          {/* Single Image Upload */}
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Background Image</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value ? [field.value] : []}
                  disabled={loading}
                  multiple={false}
                  onChange={(urls) => field.onChange(urls[0] || "")} // pick first
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


          {/* Label */}
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Billboard Label"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
      <Separator />
    </>
  );
};
