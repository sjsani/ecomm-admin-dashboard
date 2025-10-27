import React from 'react'
import ColorClient from './components/client'
import prismadb from '@/lib/prismadb'
import { ColorColumn } from './components/columns'
import {format} from 'date-fns'

const ColorPage = async ({
  params
}:{
  params:{storeId:string}
}) => {
  
  const color = await prismadb.color.findMany({
    where:{
      storeId: params.storeId
    },
    orderBy:{
      createdAt:'desc'
    }
  });

  const formattedColor: ColorColumn[]= color.map((item)=>({
    id:item.id,
    name: item.name,
    value:item.value,
    createdAt:format(item.createdAt, "MMMM do, yyyy"),

  }))
  return (
    <div className='flex-col'>
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <ColorClient data={formattedColor} />
      </div>
      
    </div>
  )
}

export default ColorPage