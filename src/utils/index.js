'use-strict'
function createAPIGatewayResponse({ statusCode, message }){
    return {
        statusCode,
        body: JSON.stringify(message)
    }
}

module.exports = {
    createAPIGatewayResponse
}