"use client";
import { useState } from "react";


interface SelectionBoxProps{
    isDragging : boolean;
    rect : { x: number, y: number, w: number, h: number },
    
}
export default function SelectionBox({isDragging,rect} : SelectionBoxProps) {
  if(!isDragging){
    return null
  }

  return (
        <div
          className="absolute top-0 left-0 border-2 border-blue-500 bg-blue-200/30"
          style={{
            left: rect.x,
            top: rect.y,
            width: rect.w,
            height: rect.h,
          }}
        />
      
  );
}
