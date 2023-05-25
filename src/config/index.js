module.exports = {
    kinesis : {
        orderStreamName: process.env.orderStreamName || 'order-events'
    },
    dynamodb: {
        orderTableName: process.env.orderTableName || 'orders'
    },

    ses: {
        region: process.env.region || 'us-east-1',
        thirdPartyEmailAddress: process.env.thirdPartyEmailAddress || 'thirdpartyprovider@grr.la',
        noReplyEmailAddress: process.env.noReplyEmailAddress || 'no-reply-order-serverlessly-system@grr.la'
    },
    sqs: {
        region: process.env.region || 'us-east-1',
        thirdPartyQueueName: process.env.thirdPartyQueue || 'third-party-queue'
    }
}