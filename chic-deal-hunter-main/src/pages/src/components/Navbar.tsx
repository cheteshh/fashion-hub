import { useEffect, useState } from "react"

export default function Navbar() {

  const [count, setCount] = useState(0)

  useEffect(() => {

    const cart = JSON.parse(localStorage.getItem("cart") || "[]")

    setCount(cart.length)

  }, [])

  return (

    <div className="flex justify-between items-center px-8 py-4 shadow">

      <h1 className="text-xl font-bold">
        FashionHub
      </h1>

      <div className="flex gap-6">

        <a href="/">Home</a>
        <a href="/shop">Shop</a>

        <div>
          🛒 {count}
        </div>

      </div>

    </div>

  )
}