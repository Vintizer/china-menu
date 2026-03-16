export const t = {
  ru: {
    // Общее
    loading: 'Загрузка...',

    // Home
    heroTitle: 'Меню',
    todaySpecial: 'Сегодня рекомендуем',
    todaySpecialSub: 'Фирменные блюда дня',
    viewDetails: 'Посмотреть',

    // Category
    searchPlaceholder: 'Поиск блюда...',
    notFound: 'Ничего не найдено',
    notFoundSub: 'Попробуйте другой запрос',

    // DishCard
    addToCart: 'В корзину',
    added: 'Добавлено',
    currency: 'р',

    // CartBar
    cartLabel: 'Корзина',

    // Cart page
    cart: 'Корзина',
    cartEmpty: 'Корзина пуста',
    cartEmptySub: 'Добавьте блюда из меню',
    goToMenu: 'Перейти в меню',
    addMore: 'Добавить ещё блюда',
    subtotal: 'Промежуточный итог',
    delivery: 'Доставка',
    free: 'Бесплатно',
    total: 'Итого',
    checkout: 'Оформить заказ',
    positions: n => `${n} ${n === 1 ? 'позиция' : n < 5 ? 'позиции' : 'позиций'}`,

    // Checkout page
    checkoutTitle: 'Оформление заказа',
    yourOrder: 'Ваш заказ',
    contactInfo: 'Контактные данные',
    paymentMethod: 'Способ оплаты',
    cash: 'Наличные',
    card: 'Картой',
    sendOrder: 'Отправить заказ',
    fieldName: 'Ваше имя',
    fieldPhone: 'Телефон',
    fieldAddress: 'Адрес доставки',
    fieldComment: 'Комментарий к заказу',
    phName: 'Иван Иванов',
    phPhone: '+375 29 000-00-00',
    phAddress: 'Улица, дом, квартира',
    phComment: 'Напишите пожелания...',
    errName: 'Введите имя',
    errPhone: 'Введите телефон',
    errAddress: 'Введите адрес',
    orderError: 'Ошибка отправки. Попробуйте ещё раз или позвоните нам.',

    // Confirmation page
    orderSent: 'Заказ отправлен!',
    orderAccepted: 'Ваш заказ принят и будет доставлен в ближайшее время.',
    thankYou: '感谢您的订购！',
    questions: 'Есть вопросы? Звоните:',
    orTelegram: 'или пишите @JIAYUAN6688 в Telegram',
    backToMenu: 'Вернуться в меню',
  },

  cn: {
    // Общее
    loading: '加载中...',

    // Home
    heroTitle: '菜单',
    todaySpecial: '今日推荐',
    todaySpecialSub: '今日特色菜',
    viewDetails: '查看详情',

    // Category
    searchPlaceholder: '搜索菜品...',
    notFound: '没有找到',
    notFoundSub: '请换个关键词试试',

    // DishCard
    addToCart: '加入购物车',
    added: '已添加',
    currency: '卢',

    // CartBar
    cartLabel: '购物车',

    // Cart page
    cart: '购物车',
    cartEmpty: '购物车是空的',
    cartEmptySub: '从菜单中选择菜品',
    goToMenu: '查看菜单',
    addMore: '继续点餐',
    subtotal: '小计',
    delivery: '配送',
    free: '免费',
    total: '总价',
    checkout: '去结账',
    positions: n => `${n} 份`,

    // Checkout page
    checkoutTitle: '结账',
    yourOrder: '您的订单',
    contactInfo: '联系方式',
    paymentMethod: '支付方式',
    cash: '现金',
    card: '刷卡',
    sendOrder: '提交订单',
    fieldName: '您的姓名',
    fieldPhone: '电话号码',
    fieldAddress: '配送地址',
    fieldComment: '订单备注',
    phName: '王明',
    phPhone: '+375 29 000-00-00',
    phAddress: '街道, 门牌号, 公寓',
    phComment: '请填写您的要求...',
    errName: '请输入姓名',
    errPhone: '请输入电话号码',
    errAddress: '请输入地址',
    orderError: '提交失败，请重试或致电我们。',

    // Confirmation page
    orderSent: '订单已提交！',
    orderAccepted: '您的订单已收到，将尽快为您配送。',
    thankYou: '感谢您的订购！',
    questions: '有问题？请联系我们：',
    orTelegram: '或在 Telegram 联系 @JIAYUAN6688',
    backToMenu: '返回菜单',
  },
}
