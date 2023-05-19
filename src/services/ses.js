'use-strict'
import * as SES from 'aws-sdk/clients/ses'
import { ses as sesConfig } from '../config'

const ses = new SES({
    region: sesConfig.region,
});

const sesSendMail = ({ toAddress, fromAddress, orderItem }) => {
    const params = {
        Destination: {
            ToAddress: [toAddress]
        },
        Message: {
            Subject: {
                Data: 'New Item Order Alert!!!'
            },
            Body: {
                Text: {
                    Data: JSON.stringify(orderItem)
                },
            },
        },
        Source: fromAddress,
    }

    return (
        ses.sendEmail(params)
            .promise()
            .then((data) => data)
            .catch((error) => console.log(error))
    )
}

module.exports = {
    sesSendMail,
}