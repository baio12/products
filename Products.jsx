import React, { useEffect, useState, useRef } from 'react'
import { PlusIcon, ShoppingBagIcon, SearchIcon, CurrencyDollarIcon, TagIcon, ScaleIcon, InformationCircleIcon } from '@heroicons/react/solid';
import PrimaryButton from './hooks/PrimaryButton';
import SecondaryButton from './hooks/SecondaryButton';
import Modal from './hooks/Modal';
import AddProduct from './AddProduct';
import Input from './hooks/Input';
import Table from './hooks/Table';
import EmptyState from './hooks/EmptyState';
import Pagination from './hooks/Pagination';
import useFormatterCurrency from './hooks/useFormatterCurrency';
//import { deleteProduct, getProducts } from '../../apiClient/operations/products';
//import { getProductKeys } from '../../apiClient/operations/catalogs';
import Alert from './hooks/Alert';
import useScrollPosition from './hooks/useScrollPosition';
import usePagination from './hooks/usePagination';
import Loader from './hooks/Loader';

const tableColumns = [
    { heading: 'Clave P/S', value: 'product.key', mobile_value: 'product.key,product.name', description: 'product.name' },
    { heading: 'Concepto', value: 'description' },
    { heading: 'Valor unitario', value: 'price' }
]

const itemsLimitInTable =20;

function Products({ user }) {
    const formatterCurrencyRef = useRef(useFormatterCurrency);
    const [openModal, setOpenModal] = useState(false);
    const [products, setProducts] = useState([]);
    const [editProduct, setEditProduct] = useState(null);
    const [productsList, setProductsList] = useState([]);
    const [currentPage, setCurrenPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [viewDetails, setViewDetails] = useState(false);
    const [generalError, setGeneralError] = useState(null);
    const [productOrService, setProductOrService] = useState({
        unitId: '',
        product: '',
        desc: '',
        quantity: '',
        amount: ''
    });
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [psCatalog, setPsCatalog] = useState([]);
    const setScrollPosition = useScrollPosition();
    const paginate = usePagination();

    /*const getProductList = async (limit, page) => {
        setIsLoadingData(true);
        setScrollPosition(0);
        try {
            const res = await getProducts(user?.organizationId, limit, page);
            if (res?.data?.products?.length > 0) {
                setProductsList(res?.data?.products);
                setProducts(res?.data?.products);
                setPagination(paginate(res.total_items, itemsLimitInTable, res.total_pages));
            }
            setIsLoadingData(false);
        } catch (e) {
            setGeneralError(e.messageToUser);
            setIsLoadingData(false)
        }
    }*/

    /*useEffect(() => {
        getProductList(itemsLimitInTable, currentPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);*/

    /*useEffect(() => {
        const getPS = async () => {
            try {
                const res = await getProductKeys();
                setPsCatalog(res);
            } catch (e) {
                console.log(e)
            }
        }

        getPS();
    }, []);*/

    useEffect(() => {
        if (!openModal) {
            setEditProduct(null)
        }
    }, [openModal]);

    const onProductAdded = productAdded => {
        setOpenModal(false);
        if (editProduct) {
            setEditProduct(null);
            let updatedProducts = products.filter(product => product.id !== productAdded.id);
            setProducts([,
                productAdded,
                ...updatedProducts
            ]);
        } else {
            setProducts([])
            //getProductList(itemsLimitInTable, currentPage);
        }
    }

    const handleViewProductDetails = item => {
        setProductOrService(item);
        setViewDetails(true);
    }

    /*const handleDeleteProduct = async item => {
        setIsLoadingData(true);
        setGeneralError(null);
        try {
            await deleteProduct(user?.organizationId, item.id);
            setProducts([]);
            getProductList(itemsLimitInTable, currentPage);
        } catch (e) {
            setGeneralError(e.messageToUser);
            setIsLoadingData(false);
        }
    }*/

    const handleEditProduct = item => {
        let product = products?.find(prod => prod?.id === item.id);
        setEditProduct(product);
        setProductOrService({
            unitId: { key_id: product.unit.key, name: product.unit.name },
            product: { prod_id: product.product.key, name: product?.product.name },
            desc: product?.description,
            quantity: product?.quantity,
            amount: product?.price / 100
        });
        setOpenModal(true);
    }

    const actions = [
        {
            name: 'Ver detalles',
            action: handleViewProductDetails
        },
        {
            name: 'Editar',
            action: handleEditProduct
        },
        /*{
            name: 'Eliminar',
            action: handleDeleteProduct
        }*/
    ];

    const handleSearch = value => {
        const filtered = products.filter(item => {
            if (value == '') {
                return item
            } else if ( item.description.toLocaleLowerCase().includes(value.toLocaleLowerCase()) || item.product.key.toLocaleLowerCase().includes(value.toLocaleLowerCase())) {
                return item
            } else {
                return ''
            }
        });
        setProductsList(filtered);
    }

    useEffect(() => {
        setProductsList(products);
        return () => {
            setProductsList([]);
        }
    }, [products]);

    return (
        <>
            <Loader show={isLoading} />
            <div className='min-h-full md:min-h-[calc(100vh-4rem)] bg-gray-200/70 px-4 lg:px-9 pt-6 pb-10'>
                {generalError &&
                    <div className='mb-5 top-[5.5rem] sticky z-50'>
                        <Alert type="Error" show={generalError != null} title={generalError} onClose={() => setGeneralError(null)} />
                    </div>
                }
                <div className='flex justify-between'>
                    <h2 className='text-3xl font-bold text-gray-900'>
                        Productos
                    </h2>
                    {!isLoadingData && products.length > 0 && (
                        <PrimaryButton onClick={() => setOpenModal(true)}>
                            <PlusIcon className='-ml-1 mr-3 h-5 w-5' />
                            <span className='block lg:hidden'>Agregar</span>
                            <span className='hidden lg:block'>Agregar un nuevo producto</span>
                        </PrimaryButton>
                    )}
                </div>
                <div className='w-full rounded-md lg:bg-white px-0 lg:px-9 py-0 lg:py-7 mt-4'>
                    {isLoadingData ? (
                        <Table title="Productos o servicios agregados" columns={tableColumns} actionItems={actions} isLoadingData={isLoadingData} />
                    ) : (
                        <>
                            {products.length > 0 ? (
                                <div>
                                    <div>
                                        <Input
                                            type="search"
                                            placeholder="Buscar"
                                            onChange={e => handleSearch(e.target.value)}
                                            leftIcon={<SearchIcon className='w-4 h-4 text-gray-400' />}
                                        />
                                    </div>
                                    <div className='mt-4'>
                                        {productsList.length > 0 ?
                                            <>
                                                <Table title="Productos o servicios agregados" columns={tableColumns} data={productsList} actionItems={actions} />
                                                <div className="lg:flex-1 lg:flex items-center justify-between pt-3">
                                                    {pagination && (
                                                        <p className="select-none text-sm text-gray-700 hidden lg:block">
                                                            Mostrando {pagination.pages.find(element => element.page == currentPage).range.join(' a ')} de {pagination.totalItems} resultados
                                                        </p>
                                                    )}
                                                    <div>
                                                        <Pagination pages={pagination?.totalPages || pagination?.pages?.length} currentPage={currentPage} setCurrentPage={setCurrenPage} />
                                                    </div>
                                                </div>
                                            </>
                                            :
                                            <div className='w-full'>
                                                <EmptyState icon={<SearchIcon className='w-12 h-12' />} title='No existen coincidencias' message='Inténtalo de nuevo con otra palabra.' />
                                            </div>
                                        }
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full">
                                    <EmptyState icon={<ShoppingBagIcon className='w-12 h-12' />} title='No hay productos agregados' message='Comienza agregando clientes nuevos a la lista. Será la manerá más sencilla de facturar.' />
                                    <div className='block mt-6 text-center'>
                                        <PrimaryButton onClick={() => setOpenModal(true)} >
                                            <PlusIcon className='-ml-1 mr-3 h-5 w-5' /> Agregar un nuevo producto
                                        </PrimaryButton>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div >
            <Modal open={openModal} setOpen={setOpenModal} className='w-full sm:max-w-[30rem]'>
                <AddProduct
                    organizationId={user?.organizationId}
                    onCancel={() => setOpenModal(false)}
                    product={editProduct}
                    onAdded={onProductAdded}
                    psCatalog={psCatalog}
                    addQty={false}
                    setIsLoading={setIsLoading} />
            </Modal>
            <Modal open={viewDetails} setOpen={setViewDetails} className='w-full sm:max-w-[30rem]'>
                <div className="w-full">
                    <div>
                        <div className='sm:flex justify-between items-center space-y-4 sm:space-y-0'>
                            <h5 className='font-bold'>Detalle del producto</h5>
                        </div>
                        <div className='mt-5 -mx-6 sm:-mx-12 border-t-2 border-gray-300' />
                    </div>
                    <div className="max-h-[calc(100vh-300px)] overflow-y-auto py-5 space-y-7 -mx-6 px-6">
                        <div className='flex gap-1 text-gray-500 font-medium text-sm'>
                            <TagIcon className='w-4 h-4 mt-[2px]' />
                            <div>
                                <span className='font-bold block'>Clave de producto/servicio:</span>
                                <span>{productOrService?.product?.key} {productOrService?.product?.name}</span>
                            </div>
                        </div>
                        <div className='flex gap-1 text-gray-500 font-medium text-sm'>
                            <ScaleIcon className='w-4 h-4 mt-[2px]' />
                            <div>
                                <span className='font-bold block'>Unidad de medida:</span>
                                <span>{productOrService?.unit?.key} {productOrService?.unit?.name}</span>
                            </div>
                        </div>
                        <div className='flex gap-1 text-gray-500 font-medium text-sm'>
                            <InformationCircleIcon className='w-4 h-4 mt-[2px]' />
                            <div className='w-full'>
                                <span className='font-bold block'>Concepto:</span>
                                <span>
                                    {productOrService?.description}
                                </span>
                            </div>
                        </div>
                        <div className='flex gap-1 text-gray-500 font-medium text-sm'>
                            <CurrencyDollarIcon className='w-4 h-4 mt-[2px]' />
                            <div className='w-full'>
                                <span className='font-bold block'>Valor unitario:</span>
                                <span>{`${formatterCurrencyRef.current(productOrService?.price / 100)} MXN`}</span>
                            </div>
                        </div>
                    </div>
                    <div className="">
                        <div className='mb-5 -mx-6 sm:-mx-12 border-t-2 border-gray-300' />
                        <div className="flex justify-end gap-5">
                            <SecondaryButton
                                type="button"
                                onClick={() => setViewDetails(false)}>
                                Cerrar
                            </SecondaryButton>
                            <PrimaryButton
                                type="button"
                                onClick={() => {
                                    setViewDetails(false);
                                    handleEditProduct(productOrService);
                                }}>
                                Editar
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default Products