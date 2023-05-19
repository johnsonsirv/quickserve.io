'use-strict';
import { v4 as uuidv4 } from 'uuid'
import { EVENT_TYPES } from '../constants'
import { saveToDB, getFromDB } from '../services/dynamo'
import { addToStream } from '../services/kinesis'
import { sesSendMail } from '../services/ses'
import {
    kinesis as kinesisConfig,
    dynamodb as dynamodbConfig,
    ses as sesConfig,
} from '../config'

const ORDER_STREAM_NAME = kinesisConfig.orderStreamName
const ORDER_TABLE_NAME = dynamodbConfig.orderTableName;
const THIRD_PARTY_EMAIL_ADDRESS = sesConfig.thirdPartyEmailAddress
const NO_REPLY_EMAIL_ADDRESS = sesConfig.noReplyEmailAddress


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

const handleOrderNotifyThirdPartyProvider = (orders) => {
    const promises = orders.map((order) => sesSendMail({ 
             toAddress: THIRD_PARTY_EMAIL_ADDRESS,
             fromAddress: NO_REPLY_EMAIL_ADDRESS,
             orderItem: order,
        }));

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

module.exports = {
    handleCreateOrder,
    orderMapper,
    handleOrderNotifyThirdPartyProvider,
    handleFulfilOrderByThirdParty,
}

