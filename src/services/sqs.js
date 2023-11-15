'use-strict'
import * as SQS from 'aws-sdk/clients/sqs'
import { sqs as sqsConfig } from '../config'

const sqs = new SQS({
    region: sqsConfig.region,
});

const sqsEnqueue = ({ message, queueUrl }) => {
    const params = {
        MessageBody: message,
        QueueUrl: queueUrl,
    }

    return sqs.sendMessage(params).promise()
}


module.exports = {
    sqsEnqueue,
}
