import React, { useState, useEffect, useRef } from 'react';
import PrimaryButton from './hooks/PrimaryButton';
import SecondaryButton from './hooks/SecondaryButton';
import InputUnitCode from './hooks/InputUnitCode';
import InputProductService from './hooks/InputProductService';
import InputWithLabel from './hooks/InputWithLabel';
import { createUUID } from './hooks/useUUID';
//import { getMeasurementUnits } from '../../apiClient/operations/catalogs';
//import { createProduct, © } from '../../apiClient/operations/products';
import PropTypes from 'prop-types';
import Alert from './hooks/Alert';

function AddProduct({ organizationId, onCancel, product, onAdded, psCatalog, addQty, setIsLoading }) {

    const [unitCatalog, setUnitCatalog] = useState([]);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState({});
    const UUIDRef = useRef(createUUID);
    const [productOrService, setProductOrService] = useState({
        unit: '',
        product: '',
        desc: '',
        quantity: '',
        amount: ''
    });

    /*useEffect(() => {
        if (unitCatalog.length > 0 && psCatalog.length > 0) {
            setTimeout(setIsLoading(false), 100);
        }else {
            setIsLoading(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [unitCatalog, psCatalog])*/

    /*useEffect(() => {
        const getUnitIds = async () => {
            try {
                const res = await getMeasurementUnits();
                setUnitCatalog(res.data.unit_keys);
            } catch (e) {
                setError(e.messageToUser)
            }
        }

        getUnitIds();
    }, []);*/

    useEffect(() => {
        if (product) setProductOrService({
            unit: product.unit,
            product: product.product,
            desc: product.description,
            amount: product.price / 100,
            quantity: product.quantity
        });
    }, [product])

    const handleDesc = e => {
        setProductOrService({ ...productOrService, desc: e.target.value });
        e.target.value.length > 1 && setErrors({ ...errors, desc: '' });
    }

    const handleQuantity = e => {
        setProductOrService({ ...productOrService, quantity: parseInt(e.target.value) });
        e.target.value.length > 0 && setErrors({ ...errors, quantity: '' });
    }

    const handleAmount = e => {
        setProductOrService({ ...productOrService, amount: parseFloat(e.target.value) });
        e.target.value.length > 0 && setErrors({ ...errors, amount: '' });
    }

    const validateFields = () => {
        let error = {};
        let validityStatus = true;
        if (productOrService['desc'].length <= 1) {
            error['desc'] = 'Debes ingresar un concepto';
            validityStatus = false;
        }
        if (addQty && (productOrService['quantity'] <= 0 || isNaN(productOrService['quantity']))) {
            error['quantity'] = 'Debes ingresar la cantidad';
            validityStatus = false;
        }
        if (productOrService['amount'] <= 0 || isNaN(productOrService['amount'])) {
            error['amount'] = 'Debes ingresar una cantidad';
            validityStatus = false;
        }
        if (Object.keys(productOrService['unit']).length === 0) {
            error['unit'] = 'Debes seleccionar una opción';
            validityStatus = false;
        }
        if (Object.keys(productOrService['product']).length === 0) {
            error['product'] = 'Debes seleccionar una opción';
            validityStatus = false;
        }
        setErrors(error);
        return validityStatus
    }


    const handleAddProduct = () => {
        if (validateFields()) {
            let { desc, amount, quantity, product: { name: productName }, unit: { name: unitName } } = productOrService;
            let productKey = productOrService.product.prod_id || productOrService.product.key;
            let unitKey = productOrService.unit.key_id || productOrService.unit.key;
            let productObject = {
                ...(product?.id && {
                    id: product.id,
                }),
                ...(addQty && { tempId: product?.tempId || `prod_${UUIDRef.current()}` }),
                status: product?.status || (product ? 'created' : 'new'),
                description: desc,
                ...(addQty ? {
                    quantity: quantity,
                    total: (amount * quantity) * 100,
                    product: {
                        key: productKey,
                        name: productName
                    },
                    unit: {
                        key: unitKey,
                        name: unitName
                    } 
                } : {
                    product_key: productKey,
                    unit_key: unitKey,
                    unit_name: unitName,
                }),
                price: amount * 100,
                tax_included: false,
                taxability: "01",
                taxes: [],
                local_taxes: []
            }
            if (addQty) {
                if (onAdded) onAdded(productObject);
                else if (onCancel) onCancel();
                return;
            }
            if (product) {
                editProduct(organizationId, productObject);
            } else {
                saveProduct(organizationId, productObject);
            }
        }
    }

    /*const saveProduct = async (organizationId, productObject) => {
        setIsLoading(true);
        setError(null);
        try {
            const product = await createProduct(organizationId, productObject);
            setIsLoading(false);
            if (onAdded) onAdded(product);
            else if (onCancel) onCancel();
        } catch (e) {
            setError(e.messageToUser);
            setIsLoading(false);
        }
    }*/

    const editProduct = async (organizationId, productObject) => {
        setIsLoading(true);
        setError(null);
        try {
            const product = await updateProduct(organizationId, productObject.id, productObject);
            setIsLoading(false);
            if (onAdded) onAdded(product);
            else if (onCancel) onCancel();
        } catch (e) {
            setError(e.messageToUser)
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full">
            <div className="space-y-8">
                <div className="">
                    <div>
                        <h5 className='font-bold'>Agregar nuevo producto</h5>
                        <div className='mt-5 -mx-6 border-t-2 border-gray-300' />
                    </div>
                    <div className="py-5 grid grid-cols-1 gap-y-4 gap-x-4 max-h-screen sm:max-h-[calc(100vh-300px)] overflow-y-auto -mx-4 px-4">
                        {error &&
                            <div className='mb-4 top-0 sticky z-50'>
                                <Alert title={error} show={error != null} onClose={() => setError(null)} />
                            </div>
                        }
                        <InputProductService selectedPerson={productOrService} setSelectedPerson={setProductOrService} people={psCatalog} errors={errors} setErrors={setErrors} />
                        <InputUnitCode selectedPerson={productOrService} setSelectedPerson={setProductOrService} people={unitCatalog} errors={errors} setErrors={setErrors} />
                        <div>
                            <InputWithLabel
                                label='Concepto'
                                needed={true}
                                hasLeftLabel={false}
                                type='text'
                                name='concept'
                                id='concept'
                                placeholder='Escribe una breve descripción'
                                hasRightLabel={false}
                                defaultValue={product?.description}
                                onInput={(e) => handleDesc(e)}
                            />
                            {errors.desc !== '' && <span className='block mt-0.5 text-red-500 text-sm'>{errors.desc}</span>}
                        </div>
                        {addQty && (
                            <div>
                                <InputWithLabel
                                    label='Cantidad'
                                    needed={true}
                                    hasLeftLabel={false}
                                    type='number'
                                    inputMode='numeric'
                                    name='quantity'
                                    id='quantity'
                                    placeholder='1'
                                    hasRightLabel={false}
                                    defaultValue={product?.quantity}
                                    onInput={(e) => handleQuantity(e)}
                                />
                                {errors.quantity !== '' && <span className='block mt-0.5 text-red-500 text-sm'>{errors.quantity}</span>}
                            </div>
                        )}
                        <div>
                            <InputWithLabel
                                label='Valor unitario'
                                needed={true}
                                hasLeftLabel={true}
                                leftLabel='$'
                                type='number'
                                name='amount'
                                id='amount'
                                placeholder='0.00'
                                hasRightLabel={true}
                                rightLabel='MXN'
                                defaultValue={product?.price ? (product?.price / 100) : ''}
                                onInput={(e) => handleAmount(e)}
                                aria-describedby="price-currency" />
                            {errors.amount !== '' && <span className='block mt-0.5 text-red-500 text-sm'>{errors.amount}</span>}
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <div className='mb-5 -mx-6 border-t-2 border-gray-300' />
                <div className="flex justify-end gap-6">
                    <SecondaryButton
                        type="button"
                        onClick={() => onCancel()}>
                        Cancelar
                    </SecondaryButton>
                    <PrimaryButton
                        onClick={handleAddProduct}>
                        Guardar
                    </PrimaryButton>
                </div>
            </div>
        </div>
    )
}

AddProduct.propTypes = {
    organizationId: PropTypes.string,
    onCancel: PropTypes.func,
    product: PropTypes.object,
    onAdded: PropTypes.func,
    psCatalog: PropTypes.array,
    addQty: PropTypes.bool
}

AddProduct.defaultProps = {
    addQty: true
}

export default AddProduct