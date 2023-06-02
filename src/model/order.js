'use-strict';
import { v4 as uuidv4 } from 'uuid'
import { EVENT_TYPES, ORDER_DELIVERY_STATUS } from '../constants'
import { saveToDB, getFromDB } from '../services/dynamo'
import { addToStream } from '../services/kinesis'
import { sesSendMail } from '../services/ses'
import { sqsEnqueue } from '../services/sqs'
import {
    kinesis as kinesisConfig,
    dynamodb as dynamodbConfig,
    ses as sesConfig,
    sqs as sqsConfig,
} from '../config'

const ORDER_STREAM_NAME = kinesisConfig.orderStreamName
const ORDER_TABLE_NAME = dynamodbConfig.orderTableName;
const THIRD_PARTY_EMAIL_ADDRESS = sesConfig.thirdPartyEmailAddress
const NO_REPLY_EMAIL_ADDRESS = sesConfig.noReplyEmailAddress
const THIRD_PARTY_QUEUE_NAME = sqsConfig.thirdPartyQueueName
const CUSTOMER_SERVICE_QUEUE_NAME = sqsConfig.customerServiceQueue


const orderMapper = (params) => {
    // TODO: ensure validation is in place, cant trust http
    
    return {
        orderId: uuidv4(),
        clientName: params.clientName,
        clientAddress: params.clientAddress,
        quantity: params.quantity,
        productId: params.productId,
        eventType: EVENT_TYPES.ORDER_CREATED,
        createdAt: Date.now()
    }
}


const handleCreateOrder = (order) => {
    // TODO: do you want to handle errors?
    return saveToDB({
       data: order,
       tableName: ORDER_TABLE_NAME,
    }).then(() => {
        return addToStream({
            data: order,
            partitionKey: 'orderId',
            streamName: ORDER_STREAM_NAME,
        })
    });
}

const handleNotifyThirdPartyProducer = ({ orders }) => {
    if (Array.isArray(orders) && orders.length <= 0) return null;

    const promises = orders.map((order) => sesSendMail({ 
        toAddress: THIRD_PARTY_EMAIL_ADDRESS,
        fromAddress: NO_REPLY_EMAIL_ADDRESS,
        data: JSON.stringify(order),
   }));

    return Promise.all(promises)
}

const handleNotifyThirdPartyDelivery = ({ orders }) => {
    if (Array.isArray(orders) && orders.length <= 0) return null;
    
    const promises = orders.map((order) => {
        // TODO: Consistency? add lookup step, but from cache.
        // ?? No need ?? no http request, exchange within AWS system
        const orderForDelivery = {
            ...order,
            deliveryStatus: ORDER_DELIVERY_STATUS.ENQUEUE,
            sentToDeliveryDate: Date.now(),
            eventType: EVENT_TYPES.ORDER_SENT_TO_DELIVERY
        };

        saveToDB({ data: orderForDelivery, tableName: ORDER_TABLE_NAME })
            .then(() => {
                sqsEnqueue({
                    message: JSON.stringify(orderForDelivery),
                    queueUrl: THIRD_PARTY_QUEUE_NAME,
                    queueUrl: THIRD_PARTY_QUEUE_NAME,
                })
            })
    });


   return Promise.all(promises)
}

const handleFulfilOrderByThirdParty = ({ orderId, thirdPartyProviderId }) => {

    return (
        // TODO: fetch from in-memory cache
        getFromDB({ keyName: 'orderId', keyValue: orderId, tableName: ORDER_TABLE_NAME })
            .then((order) => {
                if (!order) return;

                const fulfilledOrder = {
                    ...order,
                    fulfillmentId: thirdPartyProviderId, // random id from third party device/system
                    fulfillmentDate: Date.now(), 
                    eventType: EVENT_TYPES.ORDER_FULFILLED,
                };

                return saveToDB({
                    data: fulfilledOrder,
                    tableName: ORDER_TABLE_NAME,
                }).then(() => {
                    return addToStream({
                        data: fulfilledOrder,
                        partitionKey: 'orderId',
                        streamName: ORDER_STREAM_NAME,
                })
            })
        })
    )

}

const handleOrderDelivered = ({ orderId, thirdPartyProviderId, orderReview }) => {
    // TODO: consider data validation

    return (
        getFromDB({ keyName: 'orderId', keyValue: orderId, tableName: ORDER_TABLE_NAME })
         .then((order) => {
            if (!order) return;

            const orderDelivered = {
                ...order,
                deliveryId: thirdPartyProviderId,
                deliveryStatus: ORDER_DELIVERY_STATUS.DELIVERED,
                deliveryDate: Date.now(),
                eventType: EVENT_TYPES.ORDER_DELIVERED,
            }

            return saveToDB({
                data: orderDelivered,
                tableName: ORDER_TABLE_NAME,
            }).then(() => {
                return sqsEnqueue({
                    message: JSON.stringify({
                        orderId,
                        orderReview,
                        orderReviewDate: Date.now(),
                    }),
                    queueUrl: CUSTOMER_SERVICE_QUEUE_NAME,
                })
              })
         })
    )
}

module.exports = {
    handleCreateOrder,
    orderMapper,
    handleNotifyThirdPartyProducer,
    handleNotifyThirdPartyDelivery,
    handleFulfilOrderByThirdParty,
    handleOrderDelivered,
}

