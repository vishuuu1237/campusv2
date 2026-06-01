import { Link } from 'react-router-dom';
import { formatINR } from '../utils/currency';

const ProductCard = ({ product }) => {
  return (
    <Link
      to={`/product/${product.id}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div className="bg-gray-200">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-44 sm:h-48 md:h-40 lg:h-44 object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary-600">
            {formatINR(product.price)}
          </span>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {product.category}
          </span>
        </div>
        {product.condition && (
          <div className="mt-2">
            <span className="text-xs text-gray-500">Condition: {product.condition}</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;

