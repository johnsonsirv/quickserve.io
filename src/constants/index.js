module.exports = {
    EVENT_TYPES: {
        ORDER_CREATED: 'order_created',
        ORDER_FULFILLED: 'order_fulfilled',
        ORDER_SENT_TO_DELIVERY: 'order_sent_to_delivery',
        ORDER_DELIVERED: 'order_delivered',
    },
    ORDER_DELIVERY_STATUS: {
        ENQUEUE: 1000,
        DELIVERED: 2000,
        CANCELLED: -1
    },
}