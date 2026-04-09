import ProductCard from "@/components/ProductCard"
import { products } from "@/data/products"

export default function Shop() {

  return (

    <div className="max-w-6xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6">
        Shop Products
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}

      </div>

    </div>

  )
}