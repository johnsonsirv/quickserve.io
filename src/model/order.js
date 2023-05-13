'use-strict';
import { v4 as uuidv4 } from 'uuid'
import { EVENT_TYPES } from '../constants'
import { saveToDB } from '../services/dynamo'
import { addToStream } from '../services/kinesis'

const ORDER_STREAM_NAME = process.env.orderStreamName
const ORDER_TABLE_NAME = process.env.orderTableName;


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

module.exports = {
    handleCreateOrder,
    orderMapper,
}

