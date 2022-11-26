import React, { useEffect, useState } from 'react';
import PrimaryButton from '../hooks/PrimaryButton';
import {getProducts} from '../../apiClient/products';

function Products() {
    const [products, setProducts] = useState([]);

    const getListProducts = async () => {
        try {
            const res = await getProducts();
            setProducts(res);
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        getListProducts();
    }, [])
    
    return (
        <div className='p-10'>
            <span className='text-3xl font-medium mb-4 block'>Submódulo de productos</span>
            <div>
                <PrimaryButton>
                    Products
                </PrimaryButton>
            </div>
            <div className='w-full mt-6'>
                {products.map(product => (
                    <div key={ product.id }>
                        <span>{product.name}</span>
                    </div>
                ))
                }
            </div>
        </div>
    )
}

export default Products