"use client"

import React, { useState } from 'react'
import { Button } from "./ui/button"
import { Minus, Plus } from "lucide-react"

const Counter = ({name}: {name: string}) => {
    const [count, setCount] = useState(1)

    const increment = () => {
        setCount(count + 1)
    }

    const decrement = () => {
        if (count > 1) {
            setCount(count - 1)
        }
    }


  return (
    <div className="flex items-center gap-x-4">
        <input type="hidden" name={name} value={count}/>
        <Button variant="outline" size="icon" type="button" onClick={decrement} disabled={count === 1}>
            <Minus className="size-4 text-primary"/>
        </Button>

        <p className="font-medium text-lg">{count}</p>

        <Button variant="outline" size="icon" type="button" onClick={increment}>
            <Plus className="size-4 text-primary"/>
        </Button>
    </div>
  )
}

export default Counter