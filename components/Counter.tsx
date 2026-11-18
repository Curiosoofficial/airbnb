"use client"

import React, { useState } from 'react'
import { Button } from "./ui/button"
import { Minus, Plus } from "lucide-react"

interface Props {
    name: string
    defaultValue?: number
    min?: number
    max?: number
    // Optional: Elternkomponente bekommt den Wert mit (z. B. in der Suche)
    onChange?: (value: number) => void
}

const Counter = ({name, defaultValue = 1, min = 1, max = 16, onChange}: Props) => {
    const [count, setCount] = useState(defaultValue)

    const update = (value: number) => {
        setCount(value)
        onChange?.(value)
    }

    const increment = () => {
        if (count < max) {
            update(count + 1)
        }
    }

    const decrement = () => {
        if (count > min) {
            update(count - 1)
        }
    }


  return (
    <div className="flex items-center gap-x-4">
        <input type="hidden" name={name} value={count}/>
        <Button variant="outline" size="icon" type="button" onClick={decrement} disabled={count <= min} aria-label="Decrease">
            <Minus className="size-4 text-primary"/>
        </Button>

        <p className="font-medium text-lg w-6 text-center" aria-live="polite">{count}</p>

        <Button variant="outline" size="icon" type="button" onClick={increment} disabled={count >= max} aria-label="Increase">
            <Plus className="size-4 text-primary"/>
        </Button>
    </div>
  )
}

export default Counter
