export type Language = 'en' | 'ru';

export const translations = {
  en: {
    // Navigation
    vehicles: 'VEHICLES',
    ourWorks: 'OUR WORKS',
    carProjects: 'CAR PROJECTS',
    contacts: 'CONTACTS',
    
    // Home page
    selectVehicleModel: 'Select Vehicle Model',
    selectBrand: 'Select Brand',
    selectModel: 'Select Model',
    selectYear: 'Select Year',
    goToServices: 'Go to services',
    
    // Services
    featuresActivation: 'FEATURES ACTIVATION',
    retrofits: 'RETROFITS',
    powerUpgrade: 'POWER UPGRADE',
    accessories: 'ACCESSORIES',
    added: 'ADDED',
    add: 'ADD',
    remove: 'REMOVE',
    details: 'Details',
    total: 'TOTAL',
    clearCart: 'Clear Cart',
    getAnOffer: 'GET AN OFFER',
    getAListOfServices: 'Get a list of services',
    
    // Order form
    getAnOfferTitle: 'Get an offer',
    yourName: 'YOUR NAME',
    vehicleVINNumber: 'VEHICLE VIN NUMBER',
    mobileNumberOrEmail: 'MOBILE NUMBER OR EMAIL ADDRESS',
    orderSummary: 'Order Summary',
    submitOrder: 'Submit Order',
    submitting: 'Submitting...',
    
    // Messages
    orderSubmitted: 'Your order has been submitted! We will contact you soon.',
    requestSubmitted: 'Your request has been submitted! We will contact you soon.',
    failedToSubmitOrder: 'Failed to submit order. Please try again.',
    failedToSubmitRequest: 'Failed to submit request. Please try again.',
    
    // Admin
    manageServices: 'Manage Services',
    manageVehicles: 'Manage Vehicles',
    viewOrders: 'View Orders',
    backToAdmin: '← Back to Admin',
    allServices: 'All Services',
    addEditServices: 'Add/Edit Services',
    allBrands: 'All Brands',
    allModels: 'All Models',
    allYears: 'All Years',
    allCategories: 'All Categories',
    searchByTitle: 'Search by title...',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    
    // Order statuses
    all: 'ALL',
    pending: 'PENDING',
    reviewed: 'REVIEWED',
    contacted: 'CONTACTED',
    completed: 'COMPLETED',
    cancelled: 'CANCELLED',
    
    // Common
    noItemsFound: 'No items found',
    loading: 'Loading...',
    inStock: 'IN STOCK',
    unavailable: 'UNAVAILABLE',
    comingSoon: 'COMING SOON',
    requirements: 'Requirements',
    yes: 'Yes',
    no: 'No',
  },
  ru: {
    // Navigation
    vehicles: 'АВТОМОБИЛИ',
    ourWorks: 'НАШИ РАБОТЫ',
    carProjects: 'ПРОЕКТЫ',
    contacts: 'КОНТАКТЫ',
    
    // Home page
    selectVehicleModel: 'Выберите модель автомобиля',
    selectBrand: 'Выберите марку',
    selectModel: 'Выберите модель',
    selectYear: 'Выберите год',
    goToServices: 'Перейти к услугам',
    
    // Services
    featuresActivation: 'АКТИВАЦИЯ ФУНКЦИЙ',
    retrofits: 'РЕТРОФИТЫ',
    powerUpgrade: 'УСИЛЕНИЕ МОЩНОСТИ',
    accessories: 'АКСЕССУАРЫ',
    added: 'ДОБАВЛЕНО',
    add: 'ДОБАВИТЬ',
    remove: 'УДАЛИТЬ',
    details: 'Детали',
    total: 'ИТОГО',
    clearCart: 'Очистить корзину',
    getAnOffer: 'ПОЛУЧИТЬ ПРЕДЛОЖЕНИЕ',
    getAListOfServices: 'Получить список услуг',
    
    // Order form
    getAnOfferTitle: 'Получить предложение',
    yourName: 'ВАШЕ ИМЯ',
    vehicleVINNumber: 'VIN НОМЕР АВТОМОБИЛЯ',
    mobileNumberOrEmail: 'МОБИЛЬНЫЙ ТЕЛЕФОН ИЛИ EMAIL',
    orderSummary: 'Сводка заказа',
    submitOrder: 'Отправить заказ',
    submitting: 'Отправка...',
    
    // Messages
    orderSubmitted: 'Ваш заказ отправлен! Мы свяжемся с вами в ближайшее время.',
    requestSubmitted: 'Ваш запрос отправлен! Мы свяжемся с вами в ближайшее время.',
    failedToSubmitOrder: 'Не удалось отправить заказ. Пожалуйста, попробуйте снова.',
    failedToSubmitRequest: 'Не удалось отправить запрос. Пожалуйста, попробуйте снова.',
    
    // Admin
    manageServices: 'Управление услугами',
    manageVehicles: 'Управление автомобилями',
    viewOrders: 'Просмотр заказов',
    backToAdmin: '← Назад в админку',
    allServices: 'Все услуги',
    addEditServices: 'Добавить/Редактировать услуги',
    allBrands: 'Все марки',
    allModels: 'Все модели',
    allYears: 'Все годы',
    allCategories: 'Все категории',
    searchByTitle: 'Поиск по названию...',
    edit: 'Редактировать',
    delete: 'Удалить',
    save: 'Сохранить',
    cancel: 'Отмена',
    
    // Order statuses
    all: 'ВСЕ',
    pending: 'В ОЖИДАНИИ',
    reviewed: 'РАССМОТРЕНО',
    contacted: 'СВЯЗАЛИСЬ',
    completed: 'ЗАВЕРШЕНО',
    cancelled: 'ОТМЕНЕНО',
    
    // Common
    noItemsFound: 'Товары не найдены',
    loading: 'Загрузка...',
    inStock: 'В НАЛИЧИИ',
    unavailable: 'НЕДОСТУПНО',
    comingSoon: 'СКОРО',
    requirements: 'Требования',
    yes: 'Да',
    no: 'Нет',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

